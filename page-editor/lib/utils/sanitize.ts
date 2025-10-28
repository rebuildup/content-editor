const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "http://localhost");
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  return isSafeUrl(url) ? url : "";
}

export function sanitizeHtml(html: string): string {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}
