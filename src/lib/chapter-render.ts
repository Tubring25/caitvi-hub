import { Marked } from "marked";
import type { Token, Tokens } from "marked";

import { VOICE_LINK_PREFIX, isVoiceFileName, speakerTone, voiceUrl } from "@/lib/voice";
import type { RenderedChapter, VoiceClip } from "@/types/work";

const SAFE_LINK_PATTERN = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;

const PLAY_ICON =
  '<svg class="voice-line__icon voice-line__icon--play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z"/></svg>';
const PAUSE_ICON =
  '<svg class="voice-line__icon voice-line__icon--pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Flattens inline tokens to the words a reader sees, for the player's caption. */
function inlineText(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((token) => {
      if ("tokens" in token && token.tokens) return inlineText(token.tokens);
      if (token.type === "br") return " ";
      if (token.type === "html") return "";
      return "text" in token && typeof token.text === "string" ? token.text : "";
    })
    .join("");
}

/**
 * Renders a chapter's Markdown to HTML and collects its voiced lines in reading order.
 *
 * A voiced line is an ordinary Markdown link whose target starts with `voice:`:
 *
 *   ["You're hot, Cupcake."](voice:vi-01.mp3 "Vi")
 *
 * The link title is the speaker. Raw HTML in the source is escaped, not passed through.
 */
export function renderChapter(
  body: string,
  workSlug: string,
  chapterNumber: number,
): RenderedChapter {
  const clips: VoiceClip[] = [];
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      html({ text }: Tokens.HTML | Tokens.Tag): string {
        return escapeHtml(text);
      },

      image({ text }: Tokens.Image): string {
        // Chapters are text only for now; keep the alt text so nothing silently disappears.
        return escapeHtml(text);
      },

      link({ href, title, tokens }: Tokens.Link): string {
        const inner = this.parser.parseInline(tokens);

        if (href.startsWith(VOICE_LINK_PREFIX)) {
          const fileName = href.slice(VOICE_LINK_PREFIX.length).trim();
          // A malformed clip name degrades to plain prose rather than a dead button.
          if (!isVoiceFileName(fileName)) return inner;

          const speaker = title?.trim() || "Voice";
          const index = clips.length;
          const tone = speakerTone(speaker);
          clips.push({
            index,
            src: voiceUrl(workSlug, chapterNumber, fileName),
            speaker,
            text: decodeEntities(inlineText(tokens)).trim(),
            tone,
          });

          return (
            `<span class="voice-line" data-voice-index="${index}" data-tone="${tone}">` +
            `<button type="button" class="voice-line__btn" ` +
            `aria-label="Play this line, voiced as ${escapeHtml(speaker)}">${PLAY_ICON}${PAUSE_ICON}</button>` +
            `<span class="voice-line__text">${inner}</span>` +
            `</span>`
          );
        }

        if (!SAFE_LINK_PATTERN.test(href)) return inner;
        const isExternal = /^https?:\/\//i.test(href);
        const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
        const externalAttributes = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeHtml(href)}"${titleAttribute}${externalAttributes}>${inner}</a>`;
      },
    },
  });

  const html = marked.parse(body, { async: false });
  return { html, clips };
}
