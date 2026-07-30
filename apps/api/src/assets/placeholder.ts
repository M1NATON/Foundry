import type { AssetType } from "@foundry/shared-types";

/**
 * Генерация без внешних ключей.
 *
 * Возвращает компактный SVG в виде data-URL: Asset.url в Prisma — обычный String,
 * поэтому картинка должна оставаться маленькой (~1–2КБ). Промпт обрезается,
 * целиком в SVG не кладётся.
 */

const MAX_PROMPT_CHARS = 90;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(value: string): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > MAX_PROMPT_CHARS
    ? `${flat.slice(0, MAX_PROMPT_CHARS - 1)}…`
    : flat;
}

/** Переносит обрезанный промпт на строки по ~34 символа — для читаемости в SVG. */
function wrap(value: string, perLine = 34): string[] {
  const words = value.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if ((line + word).length > perLine && line) {
      lines.push(line.trim());
      line = "";
    }
    line += `${word} `;
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Визуальная заглушка в токенах дизайн-системы — не серый прямоугольник. */
export function placeholderAsset(type: AssetType, prompt: string): string {
  const isPortrait = false;
  const w = isPortrait ? 720 : 1280;
  const h = isPortrait ? 1280 : 720;
  const lines = wrap(escapeXml(truncate(prompt)));

  const isAudio = type === "VOICE" || type === "MUSIC";

  const motif = isAudio
    ? `<path d="M120 ${h / 2} q 80 -90 160 0 t 160 0 t 160 0 t 160 0 t 160 0 t 160 0"
         fill="none" stroke="#B5651D" stroke-width="3" opacity="0.55"/>`
    : `<rect x="120" y="${h / 2 - 90}" width="${w - 240}" height="180"
         fill="none" stroke="#EAE5DD" stroke-width="2"/>
       <circle cx="${w / 2}" cy="${h / 2}" r="26" fill="none" stroke="#B5651D" stroke-width="2" opacity="0.7"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><pattern id="h" width="12" height="12" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
<line x1="0" y1="0" x2="0" y2="12" stroke="#EAE5DD" stroke-width="1.5"/></pattern></defs>
<rect width="${w}" height="${h}" fill="#FAF8F5"/>
<rect width="${w}" height="${h}" fill="url(#h)" opacity="0.4"/>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="#EAE5DD" stroke-width="2"/>
${motif}
<text x="64" y="88" font-family="Georgia,serif" font-size="26" fill="#78716C">${type}</text>
${lines
  .map(
    (line, i) =>
      `<text x="64" y="${h - 150 + i * 40}" font-family="Georgia,serif" font-size="32" fill="#1C1917">${line}</text>`,
  )
  .join("\n")}
<text x="64" y="${h - 48}" font-family="Georgia,serif" font-size="22" fill="#B5651D">foundry · placeholder</text>
</svg>`;

  return toDataUrl(svg);
}
