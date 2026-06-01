const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_TAGS = new Set([
  "a", "b", "blockquote", "br", "caption", "code", "col", "colgroup", "div", "em", "figcaption", "figure",
  "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "li", "mark", "ol", "p", "pre", "span", "strong",
  "sub", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul",
]);
const SAFE_ATTRS = new Set([
  "alt", "class", "colspan", "height", "href", "rel", "rowspan", "src", "style", "target", "title", "width",
]);

export function safeUrl(value?: string | null, fallback = "#") {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === "#") return fallback;

  try {
    const url = new URL(trimmed, "https://example.invalid");
    if (!SAFE_URL_PROTOCOLS.has(url.protocol)) return fallback;
    if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  } catch {
    return fallback;
  }

  return `https://${trimmed}`;
}

export function sanitizeHtml(html?: string | null) {
  const input = html ?? "";
  if (!input) return "";

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return stripDangerousHtml(input);
  }

  const document = new DOMParser().parseFromString(input, "text/html");
  cleanNode(document.body);
  return document.body.innerHTML;
}

function cleanNode(node: Node) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = child as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (!SAFE_TAGS.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith("on") || !SAFE_ATTRS.has(name)) {
        element.removeAttribute(attr.name);
        return;
      }
      if ((name === "href" || name === "src") && safeUrl(value, "") === "") {
        element.removeAttribute(attr.name);
        return;
      }
      if (name === "style") {
        const cleaned = cleanInlineStyle(value);
        if (cleaned) element.setAttribute("style", cleaned);
        else element.removeAttribute("style");
      }
      if (name === "target" && value !== "_blank") element.removeAttribute(attr.name);
    });

    if (tag === "a") {
      element.setAttribute("rel", "noopener noreferrer");
    }

    cleanNode(element);
  });
}

function cleanInlineStyle(value: string) {
  if (/expression\s*\(|javascript\s*:|vbscript\s*:|url\s*\(/i.test(value)) return "";
  return value
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .join("; ");
}

function stripDangerousHtml(value: string) {
  return value
    .replace(/<\s*(script|style|iframe|object|embed|form|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|meta|link)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*(javascript:|vbscript:|data:text\/html)[\s\S]*?\2/gi, "");
}
