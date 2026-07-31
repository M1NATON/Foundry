import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AutoGrowTextarea } from "../src/components/ui/auto-grow-textarea";

const TYPOGRAPHY = "font-display text-lg leading-relaxed";

function render(value: string): string {
  return renderToStaticMarkup(
    <AutoGrowTextarea
      value={value}
      onChange={() => {}}
      className={`w-full bg-transparent ${TYPOGRAPHY}`}
    />,
  );
}

describe("AutoGrowTextarea", () => {
  it("mirrors the whole value — the mirror is what sets the height", () => {
    const html = render(
      "Imagine launching a submarine.\n\nIt is blind to the ocean floor.",
    );

    expect(html).toContain("Imagine launching a submarine.");
    expect(html).toContain("It is blind to the ocean floor.");
  });

  it("gives the mirror the same typography as the field", () => {
    // Разойдутся шрифт, кегль или интерлиньяж — разойдётся и высота,
    // а хвост текста снова окажется срезан.
    const occurrences = render("Any text").split(TYPOGRAPHY).length - 1;

    expect(occurrences).toBe(2);
  });

  it("keeps the mirror out of the accessibility tree", () => {
    expect(render("Any text")).toContain('aria-hidden="true"');
  });

  it("holds room for a trailing empty line", () => {
    // Без замыкающего пробела последний перевод строки не занимает высоты,
    // и поле не прокручивается к каретке.
    expect(render("Line\n")).toContain("Line\n ");
  });
});
