/** Email DNS parsing / scoring — DIY over DoH records. No third-party APIs. */

export type CheckStatus = "pass" | "warn" | "fail" | "info";

export type EmailCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  records?: string[];
};

export type SpfParsed = {
  raw: string;
  version: string;
  terms: string[];
  allQualifier: "+" | "-" | "~" | "?" | null;
  includes: string[];
  redirects: string[];
};

export type DmarcParsed = {
  raw: string;
  version: string;
  policy: string | null;
  subdomainPolicy: string | null;
  pct: number | null;
  rua: string[];
  ruf: string[];
  adkim: string | null;
  aspf: string | null;
};

export type MxRecord = {
  priority: number;
  host: string;
  raw: string;
};

/** Common DKIM selectors — discovery only; absence ≠ no DKIM. */
export const COMMON_DKIM_SELECTORS = [
  "google",
  "default",
  "selector1",
  "selector2",
  "s1",
  "s2",
  "s3",
  "k1",
  "k2",
  "k3",
  "mail",
  "dkim",
  "cm",
  "zendesk1",
  "zendesk2",
  "protonmail",
  "pm",
  "everlytickey1",
  "everlytickey2",
] as const;

export function normalizeEmailDomain(input: string): string {
  let value = input.trim().toLowerCase();
  if (!value) return "";

  // user@domain.com → domain.com
  const at = value.lastIndexOf("@");
  if (at >= 0) value = value.slice(at + 1);

  // strip URL schemes / paths
  value = value.replace(/^https?:\/\//, "");
  value = value.split("/")[0] ?? value;
  value = value.split("?")[0] ?? value;
  value = value.split("#")[0] ?? value;
  // strip trailing port / trailing dots
  value = value.replace(/:\d+$/, "");
  value = value.replace(/\.+$/, "");

  return value;
}

export function unwrapTxt(data: string): string {
  // DoH often returns "\"chunk1\" \"chunk2\""
  return data
    .replace(/"\s*"/g, "")
    .replace(/^"+|"+$/g, "")
    .replace(/\\"/g, '"')
    .trim();
}

export function parseMxData(data: string): MxRecord | null {
  const trimmed = data.trim().replace(/\.$/, "");
  const match = /^(\d+)\s+(\S+)$/.exec(trimmed);
  if (!match) return null;
  return {
    priority: Number(match[1]),
    host: match[2].replace(/\.$/, ""),
    raw: data,
  };
}

export function parseSpf(txts: string[]): SpfParsed | null {
  const raw = txts.map(unwrapTxt).find((t) => /^v=spf1(?:\s|$)/i.test(t));
  if (!raw) return null;

  const parts = raw.split(/\s+/).filter(Boolean);
  const version = parts[0] ?? "v=spf1";
  const terms = parts.slice(1);
  let allQualifier: SpfParsed["allQualifier"] = null;
  const includes: string[] = [];
  const redirects: string[] = [];

  for (const term of terms) {
    const allMatch = /^([+\-~?])?all$/i.exec(term);
    if (allMatch) {
      allQualifier = (allMatch[1] as SpfParsed["allQualifier"]) ?? "+";
      continue;
    }
    const include = /^include:(.+)$/i.exec(term);
    if (include) {
      includes.push(include[1]);
      continue;
    }
    const redirect = /^redirect=(.+)$/i.exec(term);
    if (redirect) redirects.push(redirect[1]);
  }

  return { raw, version, terms, allQualifier, includes, redirects };
}

export function parseDmarc(txts: string[]): DmarcParsed | null {
  const raw = txts.map(unwrapTxt).find((t) => /^v=dmarc1\b/i.test(t));
  if (!raw) return null;

  const tags: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim().toLowerCase();
    const val = trimmed.slice(eq + 1).trim();
    tags[key] = val;
  }

  const policy = tags.p?.toLowerCase() ?? null;
  const pct = tags.pct != null && tags.pct !== "" ? Number(tags.pct) : null;

  return {
    raw,
    version: tags.v ?? "DMARC1",
    policy,
    subdomainPolicy: tags.sp?.toLowerCase() ?? null,
    pct: Number.isFinite(pct) ? pct : null,
    rua: splitMailtoList(tags.rua),
    ruf: splitMailtoList(tags.ruf),
    adkim: tags.adkim?.toLowerCase() ?? null,
    aspf: tags.aspf?.toLowerCase() ?? null,
  };
}

function splitMailtoList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isDkimTxt(data: string): boolean {
  const text = unwrapTxt(data);
  // Require a non-empty public key. example.com publishes v=DKIM1; p= placeholders.
  const match = /\bp=([^;\s]*)/i.exec(text);
  if (!match) return false;
  const key = match[1].replace(/\s+/g, "");
  return key.length >= 20;
}

export function evaluateEmailDns(input: {
  domain: string;
  mx: string[];
  txt: string[];
  dmarcTxt: string[];
  dkim: Array<{ selector: string; records: string[] }>;
  mtaStsTxt: string[];
  tlsRptTxt: string[];
  bimiTxt: string[];
}): EmailCheck[] {
  const checks: EmailCheck[] = [];

  // —— MX ——
  const mxParsed = input.mx.map(parseMxData).filter((m): m is MxRecord => m != null);
  const nullMx = mxParsed.some((m) => m.host === "" || m.host === ".");
  if (mxParsed.length === 0) {
    checks.push({
      id: "mx",
      label: "MX",
      status: "fail",
      detail: "No MX records",
    });
  } else if (nullMx && mxParsed.length === 1) {
    checks.push({
      id: "mx",
      label: "MX",
      status: "warn",
      detail: "Null MX (domain declines mail)",
      records: mxParsed.map((m) => `${m.priority} ${m.host || "."}`),
    });
  } else {
    const sorted = [...mxParsed].sort((a, b) => a.priority - b.priority);
    checks.push({
      id: "mx",
      label: "MX",
      status: "pass",
      detail: `${sorted.length} host${sorted.length === 1 ? "" : "s"}`,
      records: sorted.map((m) => `${m.priority} ${m.host}`),
    });
  }

  // —— SPF ——
  const spf = parseSpf(input.txt);
  const spfCandidates = input.txt.map(unwrapTxt).filter((t) => /^v=spf1(?:\s|$)/i.test(t));
  if (!spf) {
    checks.push({
      id: "spf",
      label: "SPF",
      status: "fail",
      detail: "No v=spf1 TXT",
    });
  } else if (spfCandidates.length > 1) {
    checks.push({
      id: "spf",
      label: "SPF",
      status: "fail",
      detail: `Multiple SPF records (${spfCandidates.length})`,
      records: spfCandidates,
    });
  } else {
    let status: CheckStatus = "pass";
    let detail = "v=spf1";
    if (spf.allQualifier === "+") {
      status = "fail";
      detail = "+all (permits anyone)";
    } else if (spf.allQualifier === "?") {
      status = "warn";
      detail = "?all (neutral)";
    } else if (spf.allQualifier === "~") {
      status = "warn";
      detail = "~all (softfail)";
    } else if (spf.allQualifier === "-") {
      status = "pass";
      detail = "-all";
    } else if (spf.redirects.length) {
      status = "pass";
      detail = `redirect=${spf.redirects[0]}`;
    } else {
      status = "warn";
      detail = "No all/redirect term";
    }
    if (spf.includes.length) {
      detail += ` · ${spf.includes.length} include`;
    }
    checks.push({
      id: "spf",
      label: "SPF",
      status,
      detail,
      records: [spf.raw],
    });
  }

  // —— DKIM ——
  const found = input.dkim.filter((d) => d.records.some((r) => isDkimTxt(r)));
  if (found.length === 0) {
    checks.push({
      id: "dkim",
      label: "DKIM",
      status: "warn",
      detail: `None of ${COMMON_DKIM_SELECTORS.length} common selectors`,
    });
  } else {
    checks.push({
      id: "dkim",
      label: "DKIM",
      status: "pass",
      detail: found.map((d) => d.selector).join(", "),
      records: found.flatMap((d) =>
        d.records.map((r) => `${d.selector}: ${unwrapTxt(r).slice(0, 120)}`),
      ),
    });
  }

  // —— DMARC ——
  const dmarc = parseDmarc(input.dmarcTxt);
  if (!dmarc) {
    checks.push({
      id: "dmarc",
      label: "DMARC",
      status: "fail",
      detail: "No _dmarc TXT",
    });
  } else {
    let status: CheckStatus = "pass";
    let detail = `p=${dmarc.policy ?? "?"}`;
    if (dmarc.policy === "none") {
      status = "warn";
      detail = "p=none (monitor only)";
    } else if (dmarc.policy === "quarantine" || dmarc.policy === "reject") {
      status = "pass";
      detail = `p=${dmarc.policy}`;
    } else {
      status = "warn";
      detail = `p=${dmarc.policy ?? "missing"}`;
    }
    if (dmarc.subdomainPolicy) detail += ` · sp=${dmarc.subdomainPolicy}`;
    if (dmarc.pct != null && dmarc.pct < 100) {
      status = "warn";
      detail += ` · pct=${dmarc.pct}`;
    }
    if (dmarc.rua.length) detail += ` · rua`;
    else {
      status = status === "pass" ? "warn" : status;
      detail += " · no rua";
    }
    if (dmarc.ruf.length) detail += " · ruf";
    checks.push({
      id: "dmarc",
      label: "DMARC",
      status,
      detail,
      records: [dmarc.raw],
    });
  }

  // —— Optional: MTA-STS ——
  const mtaSts = input.mtaStsTxt.map(unwrapTxt).find((t) => /^v=STSv1\b/i.test(t));
  checks.push(
    mtaSts
      ? {
          id: "mta-sts",
          label: "MTA-STS",
          status: "pass",
          detail: "v=STSv1",
          records: [mtaSts],
        }
      : {
          id: "mta-sts",
          label: "MTA-STS",
          status: "info",
          detail: "No _mta-sts TXT",
        },
  );

  // —— Optional: TLS-RPT ——
  const tlsRpt = input.tlsRptTxt.map(unwrapTxt).find((t) => /^v=TLSRPTv1\b/i.test(t));
  checks.push(
    tlsRpt
      ? {
          id: "tls-rpt",
          label: "TLS-RPT",
          status: "pass",
          detail: "v=TLSRPTv1",
          records: [tlsRpt],
        }
      : {
          id: "tls-rpt",
          label: "TLS-RPT",
          status: "info",
          detail: "No _smtp._tls TXT",
        },
  );

  // —— Optional: BIMI ——
  const bimi = input.bimiTxt.map(unwrapTxt).find((t) => /^v=BIMI1\b/i.test(t));
  checks.push(
    bimi
      ? {
          id: "bimi",
          label: "BIMI",
          status: "pass",
          detail: "v=BIMI1",
          records: [bimi],
        }
      : {
          id: "bimi",
          label: "BIMI",
          status: "info",
          detail: "No default._bimi TXT",
        },
  );

  return checks;
}
