export type UtmParams = {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

export const UTM_PRESETS: Array<{
  id: string;
  label: string;
  source: string;
  medium: string;
}> = [
  { id: "google-ads", label: "Google Ads", source: "google", medium: "cpc" },
  { id: "facebook", label: "Facebook", source: "facebook", medium: "social" },
  { id: "x", label: "X / Twitter", source: "twitter", medium: "social" },
  { id: "linkedin", label: "LinkedIn", source: "linkedin", medium: "social" },
  { id: "email", label: "Email", source: "newsletter", medium: "email" },
  { id: "partner", label: "Partner", source: "partner", medium: "referral" },
];

export const UTM_SAMPLE: UtmParams = {
  url: "https://example.com/landing",
  source: "newsletter",
  medium: "email",
  campaign: "spring-sale",
  term: "",
  content: "header-cta",
};

export function buildUtmUrl(params: UtmParams): { url: string; error: string | null } {
  const raw = params.url.trim();
  if (!raw) return { url: "", error: null };
  try {
    const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withProtocol);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { url: "", error: "Only http(s) URLs." };
    }
    const set = (key: string, value: string) => {
      const v = value.trim();
      if (v) u.searchParams.set(key, v);
      else u.searchParams.delete(key);
    };
    set("utm_source", params.source);
    set("utm_medium", params.medium);
    set("utm_campaign", params.campaign);
    set("utm_term", params.term);
    set("utm_content", params.content);
    return { url: u.toString(), error: null };
  } catch {
    return { url: "", error: "Invalid URL." };
  }
}
