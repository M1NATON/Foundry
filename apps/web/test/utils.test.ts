import { describe, expect, it } from "vitest";
import { cn } from "../src/lib/utils";

describe("cn", () => {
  it("combines conditional classes", () => {
    expect(cn("items-center", false && "hidden", { block: true })).toBe(
      "items-center block",
    );
  });

  it("resolves conflicting Tailwind utilities", () => {
    expect(cn("px-2 text-primary", "px-4")).toBe("text-primary px-4");
  });
});
