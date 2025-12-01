// Server-side syntax highlighting for article content
import { load } from "cheerio";
import { common, createLowlight } from "lowlight";
import { toHtml } from "hast-util-to-html";

const lowlight = createLowlight(common);

/**
 * Highlight code blocks in HTML content
 * Parses the HTML, finds <pre><code> blocks, and applies syntax highlighting
 */
export function highlightCodeBlocks(html: string): string {
  const $ = load(html, null, false);

  $("pre code").each((_, element) => {
    const $code = $(element);
    const code = $code.text();

    // Try to detect language from class (e.g., "language-javascript")
    const classAttr = $code.attr("class") || "";
    const languageMatch = classAttr.match(/language-(\w+)/);
    const language = languageMatch?.[1];

    try {
      let highlighted;
      if (language && lowlight.registered(language)) {
        highlighted = lowlight.highlight(language, code);
      } else {
        // Auto-detect language
        highlighted = lowlight.highlightAuto(code);
      }

      const highlightedHtml = toHtml(highlighted);
      $code.html(highlightedHtml);

      // Add hljs class to the code element
      if (!$code.hasClass("hljs")) {
        $code.addClass("hljs");
      }
    } catch (error) {
      // If highlighting fails, leave the code as-is
      console.error("Syntax highlighting error:", error);
    }
  });

  return $.html();
}
