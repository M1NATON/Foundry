/**
 * Копирует текст в буфер обмена. navigator.clipboard требует secure context
 * (https или localhost) — на http/IP он либо отсутствует, либо молча
 * отклоняет запись, поэтому здесь есть fallback через устаревший
 * document.execCommand("copy"), который работает без secure context.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyWithFallback(text);
  }
}

function copyWithFallback(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}
