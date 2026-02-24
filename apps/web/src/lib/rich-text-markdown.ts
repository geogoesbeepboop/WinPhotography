function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeMarkdownOutput(markdown: string): string {
  return markdown
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatInlineMarkdownToHtml(text: string): string {
  let output = escapeHtml(text);

  output = output.replace(
    /\[([^\]]+)\]\(([^)\s]+(?:\s[^)]+)?)\)/g,
    '<a href="$2">$1</a>',
  );
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  output = output.replace(/_([^_\n]+)_/g, "<em>$1</em>");

  return output;
}

export function isLikelyMarkdown(input: string): boolean {
  const text = input.trim();
  if (!text) return false;
  return /(^|\n)\s{0,3}(#{1,3}\s|\d+\.\s|[-*+]\s|>\s)|(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/.test(
    text,
  );
}

export function markdownToHtml(markdown: string): string {
  const source = markdown.replace(/\r\n/g, "\n");
  const lines = source.split("\n");
  const html: string[] = [];
  const paragraphLines: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    html.push(`<p>${paragraphLines.join("<br />")}</p>`);
    paragraphLines.length = 0;
  };

  const closeLists = () => {
    if (inUnorderedList) {
      html.push("</ul>");
      inUnorderedList = false;
    }
    if (inOrderedList) {
      html.push("</ol>");
      inOrderedList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      closeLists();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeLists();
      const level = headingMatch[1].length;
      const text = formatInlineMarkdownToHtml(headingMatch[2]);
      html.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    const blockQuoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (blockQuoteMatch) {
      flushParagraph();
      closeLists();
      const text = formatInlineMarkdownToHtml(blockQuoteMatch[1]);
      html.push(`<blockquote><p>${text}</p></blockquote>`);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (inOrderedList) {
        html.push("</ol>");
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        html.push("<ul>");
        inUnorderedList = true;
      }
      html.push(`<li>${formatInlineMarkdownToHtml(unorderedMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (inUnorderedList) {
        html.push("</ul>");
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        html.push("<ol>");
        inOrderedList = true;
      }
      html.push(`<li>${formatInlineMarkdownToHtml(orderedMatch[1])}</li>`);
      continue;
    }

    closeLists();
    paragraphLines.push(formatInlineMarkdownToHtml(trimmed));
  }

  flushParagraph();
  closeLists();

  return html.join("\n");
}

function inlineNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes)
    .map((child) => inlineNodeToMarkdown(child))
    .join("");

  switch (tag) {
    case "strong":
    case "b":
      return `**${children}**`;
    case "em":
    case "i":
      return `*${children}*`;
    case "code":
      return `\`${children}\``;
    case "a": {
      const href = element.getAttribute("href") || "";
      return href ? `[${children}](${href})` : children;
    }
    case "br":
      return "\n";
    default:
      return children;
  }
}

function listItemToMarkdown(item: HTMLElement): string {
  return Array.from(item.childNodes)
    .map((child) => inlineNodeToMarkdown(child))
    .join("")
    .replace(/\n+/g, " ")
    .trim();
}

function blockNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").trim();
    return text ? `${text}\n\n` : "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes);

  switch (tag) {
    case "h1":
      return `# ${children.map((child) => inlineNodeToMarkdown(child)).join("").trim()}\n\n`;
    case "h2":
      return `## ${children.map((child) => inlineNodeToMarkdown(child)).join("").trim()}\n\n`;
    case "h3":
      return `### ${children.map((child) => inlineNodeToMarkdown(child)).join("").trim()}\n\n`;
    case "p": {
      const text = children.map((child) => inlineNodeToMarkdown(child)).join("").trim();
      return text ? `${text}\n\n` : "\n";
    }
    case "blockquote": {
      const innerMarkdown = children.map((child) => blockNodeToMarkdown(child)).join("").trim();
      if (!innerMarkdown) return "";
      const quoted = innerMarkdown
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => `> ${line}`)
        .join("\n");
      return `${quoted}\n\n`;
    }
    case "ul": {
      const listItems = Array.from(element.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((child) => `- ${listItemToMarkdown(child as HTMLElement)}`)
        .join("\n");
      return listItems ? `${listItems}\n\n` : "";
    }
    case "ol": {
      const listItems = Array.from(element.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((child, index) => `${index + 1}. ${listItemToMarkdown(child as HTMLElement)}`)
        .join("\n");
      return listItems ? `${listItems}\n\n` : "";
    }
    case "div": {
      const hasBlockChildren = children.some(
        (child) =>
          child.nodeType === Node.ELEMENT_NODE &&
          ["h1", "h2", "h3", "p", "ul", "ol", "blockquote", "div"].includes(
            (child as HTMLElement).tagName.toLowerCase(),
          ),
      );

      if (hasBlockChildren) {
        return children.map((child) => blockNodeToMarkdown(child)).join("");
      }

      const inline = children.map((child) => inlineNodeToMarkdown(child)).join("").trim();
      return inline ? `${inline}\n\n` : "";
    }
    default:
      return children.map((child) => blockNodeToMarkdown(child)).join("");
  }
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return "";

  if (typeof window === "undefined") {
    return normalizeMarkdownOutput(html.replace(/<[^>]+>/g, " "));
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const markdown = Array.from(doc.body.childNodes)
    .map((node) => blockNodeToMarkdown(node))
    .join("");

  return normalizeMarkdownOutput(markdown);
}
