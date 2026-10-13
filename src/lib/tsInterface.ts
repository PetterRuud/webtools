export type OutputKind = "interface" | "type";

export type TsInterfaceOptions = {
  rootName: string;
  kind: OutputKind;
  optional: boolean;
  readonly: boolean;
  exportTypes: boolean;
};

type Primitive = "string" | "number" | "boolean" | "null" | "unknown";

type Inferred =
  | { t: "primitive"; name: Primitive }
  | { t: "array"; el: Inferred }
  | { t: "object"; props: Map<string, PropInfer> }
  | { t: "union"; members: Inferred[] };

type PropInfer = {
  type: Inferred;
  /** Present when this key was missing on some merged samples. */
  optional: boolean;
};

const DEFAULT_OPTIONS: TsInterfaceOptions = {
  rootName: "Root",
  kind: "interface",
  optional: false,
  readonly: false,
  exportTypes: true,
};

export function generateTsInterfaces(
  input: string,
  options: Partial<TsInterfaceOptions> = {},
): string {
  const opts: TsInterfaceOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    rootName: sanitizeTypeName(options.rootName ?? DEFAULT_OPTIONS.rootName),
  };

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Paste JSON first.");
  }

  let value: unknown;
  try {
    value = JSON.parse(trimmed) as unknown;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Invalid JSON");
  }

  const inferred = inferValue(value);
  return emit(inferred, opts);
}

function inferValue(value: unknown): Inferred {
  if (value === null) return { t: "primitive", name: "null" };
  if (typeof value === "string") return { t: "primitive", name: "string" };
  if (typeof value === "number") return { t: "primitive", name: "number" };
  if (typeof value === "boolean") return { t: "primitive", name: "boolean" };

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { t: "array", el: { t: "primitive", name: "unknown" } };
    }
    let el = inferValue(value[0]);
    for (let i = 1; i < value.length; i++) {
      el = mergeInferred(el, inferValue(value[i]));
    }
    return { t: "array", el };
  }

  if (typeof value === "object") {
    const props = new Map<string, PropInfer>();
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      props.set(key, { type: inferValue(child), optional: false });
    }
    return { t: "object", props };
  }

  return { t: "primitive", name: "unknown" };
}

function mergeInferred(a: Inferred, b: Inferred): Inferred {
  if (sameShape(a, b)) return a;

  if (a.t === "object" && b.t === "object") {
    const keys = new Set([...a.props.keys(), ...b.props.keys()]);
    const props = new Map<string, PropInfer>();
    for (const key of keys) {
      const left = a.props.get(key);
      const right = b.props.get(key);
      if (left && right) {
        props.set(key, {
          type: mergeInferred(left.type, right.type),
          optional: left.optional || right.optional,
        });
      } else if (left) {
        props.set(key, { type: left.type, optional: true });
      } else if (right) {
        props.set(key, { type: right.type, optional: true });
      }
    }
    return { t: "object", props };
  }

  if (a.t === "array" && b.t === "array") {
    return { t: "array", el: mergeInferred(a.el, b.el) };
  }

  const members = [...flattenUnion(a), ...flattenUnion(b)];
  return { t: "union", members: dedupeInferred(members) };
}

function flattenUnion(value: Inferred): Inferred[] {
  return value.t === "union" ? value.members : [value];
}

function dedupeInferred(members: Inferred[]): Inferred[] {
  const out: Inferred[] = [];
  for (const member of members) {
    if (!out.some((existing) => sameShape(existing, member))) {
      out.push(member);
    }
  }
  return out;
}

function sameShape(a: Inferred, b: Inferred): boolean {
  if (a.t !== b.t) return false;
  if (a.t === "primitive" && b.t === "primitive") return a.name === b.name;
  if (a.t === "array" && b.t === "array") return sameShape(a.el, b.el);
  if (a.t === "union" && b.t === "union") {
    if (a.members.length !== b.members.length) return false;
    return a.members.every((member) => b.members.some((other) => sameShape(member, other)));
  }
  if (a.t === "object" && b.t === "object") {
    if (a.props.size !== b.props.size) return false;
    for (const [key, prop] of a.props) {
      const other = b.props.get(key);
      if (!other) return false;
      if (prop.optional !== other.optional) return false;
      if (!sameShape(prop.type, other.type)) return false;
    }
    return true;
  }
  return false;
}

type NamedDef = {
  name: string;
  props: Array<{
    key: string;
    typeText: string;
    optional: boolean;
  }>;
};

function emit(root: Inferred, opts: TsInterfaceOptions): string {
  const defs: NamedDef[] = [];
  const usedNames = new Set<string>();

  function reserve(name: string): string {
    let candidate = sanitizeTypeName(name);
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
    let i = 2;
    while (usedNames.has(`${candidate}${i}`)) i++;
    const next = `${candidate}${i}`;
    usedNames.add(next);
    return next;
  }

  function typeText(node: Inferred, hint: string): string {
    if (node.t === "primitive") return node.name;
    if (node.t === "array") {
      const el = typeText(node.el, singularize(hint) || `${hint}Item`);
      return needsParens(node.el) ? `(${el})[]` : `${el}[]`;
    }
    if (node.t === "union") {
      return node.members
        .map((member, index) => typeText(member, `${hint}${index + 1}`))
        .join(" | ");
    }

    const name = reserve(hint);
    const props = [...node.props.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, prop]) => ({
        key,
        typeText: typeText(prop.type, nestedName(name, key)),
        optional: opts.optional || prop.optional,
      }));
    defs.push({ name, props });
    return name;
  }

  let preamble = "";
  if (root.t === "object") {
    typeText(root, opts.rootName);
  } else if (root.t === "array") {
    const itemHint = singularize(opts.rootName) || `${opts.rootName}Item`;
    const itemType = typeText(root.el, itemHint);
    const exportKw = opts.exportTypes ? "export " : "";
    preamble = `${exportKw}type ${opts.rootName} = ${needsParens(root.el) ? `(${itemType})` : itemType}[];\n\n`;
  } else {
    const exportKw = opts.exportTypes ? "export " : "";
    preamble = `${exportKw}type ${opts.rootName} = ${typeText(root, opts.rootName)};\n\n`;
  }

  const body = defs.map((def) => formatNamed(def, opts)).join("\n\n");

  return `${preamble}${body}`.trimEnd() + "\n";
}

function formatNamed(def: NamedDef, opts: TsInterfaceOptions): string {
  const exportKw = opts.exportTypes ? "export " : "";
  const lines = def.props.map((prop) => {
    const key = formatKey(prop.key);
    const optional = prop.optional ? "?" : "";
    const readonly = opts.readonly ? "readonly " : "";
    return `  ${readonly}${key}${optional}: ${prop.typeText};`;
  });

  if (opts.kind === "type") {
    if (lines.length === 0) {
      return `${exportKw}type ${def.name} = {\n};`;
    }
    return `${exportKw}type ${def.name} = {\n${lines.join("\n")}\n};`;
  }

  if (lines.length === 0) {
    return `${exportKw}interface ${def.name} {\n}`;
  }
  return `${exportKw}interface ${def.name} {\n${lines.join("\n")}\n}`;
}

function needsParens(node: Inferred): boolean {
  return node.t === "union";
}

function formatKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function nestedName(parent: string, key: string): string {
  const fromKey = toPascalCase(key);
  if (!fromKey) return `${parent}Child`;
  // Prefer property-derived name; collisions handled by reserve().
  return fromKey;
}

function singularize(name: string): string {
  const base = sanitizeTypeName(name);
  if (base.endsWith("ies") && base.length > 3) {
    return `${base.slice(0, -3)}y`;
  }
  if (base.endsWith("ses") || base.endsWith("xes") || base.endsWith("zes")) {
    return base.slice(0, -2);
  }
  if (base.endsWith("s") && !base.endsWith("ss") && base.length > 1) {
    return base.slice(0, -1);
  }
  return base;
}

function toPascalCase(value: string): string {
  const parts = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

function sanitizeTypeName(value: string): string {
  const pascal = toPascalCase(value);
  if (!pascal) return "Root";
  if (/^[0-9]/.test(pascal)) return `T${pascal}`;
  return pascal;
}
