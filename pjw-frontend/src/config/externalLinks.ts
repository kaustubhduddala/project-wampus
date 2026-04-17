const PLACEHOLDER_PREFIX = "__PASTE_";

export const EXTERNAL_LINKS = {
  DONATION_URL: "__PASTE_DONATION_URL_HERE__",
  PARTNER_FORM_URL: "__PASTE_PARTNER_FORM_URL_HERE__",
  PETITION_URL: "__PASTE_PETITION_URL_HERE__",
  CONTACT_REP_URL: "__PASTE_CONTACT_REP_URL_HERE__",
} as const;

export function isConfiguredExternalUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith(PLACEHOLDER_PREFIX)) return false;
  return /^https?:\/\//i.test(url);
}

export function openExternalUrl(url: string, label: string): void {
  if (!isConfiguredExternalUrl(url)) {
    window.alert(`${label} link is not configured yet.`);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function appendQueryParam(url: string, key: string, value: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

export function getDonationUrl(amount?: number): string {
  const baseUrl = EXTERNAL_LINKS.DONATION_URL;
  if (!isConfiguredExternalUrl(baseUrl)) return baseUrl;
  if (amount == null) return baseUrl;
  return appendQueryParam(baseUrl, "amount", String(amount));
}
