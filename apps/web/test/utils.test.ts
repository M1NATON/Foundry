import { describe, expect, it, vi } from "vitest";
import { cn } from "../src/lib/utils";
import { mergeHandlers } from "../src/lib/use-drag-reorder";

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

describe("mergeHandlers", () => {
  it("keeps both listeners for the same event", () => {
    // Ровно эта коллизия однажды тихо убрала перестановку сцен: приём файла
    // и reorder оба слушают dragenter, и spread оставлял только последний.
    const reorder = vi.fn();
    const dropFile = vi.fn();
    const event = { type: "dragenter" };

    const merged = mergeHandlers(
      { draggable: true, onDragEnter: reorder },
      { onDragEnter: dropFile },
    );
    merged.onDragEnter(event);

    expect(reorder).toHaveBeenCalledWith(event);
    expect(dropFile).toHaveBeenCalledWith(event);
    expect(merged.draggable).toBe(true);
  });

  it("runs the first set before the second", () => {
    const calls: string[] = [];

    mergeHandlers(
      { onDragOver: () => calls.push("reorder") },
      { onDragOver: () => calls.push("drop") },
    ).onDragOver();

    expect(calls).toEqual(["reorder", "drop"]);
  });

  it("carries over handlers only one side declares", () => {
    const onDrop = vi.fn();
    const onDragStart = vi.fn();

    const merged = mergeHandlers({ onDragStart }, { onDrop });
    merged.onDragStart();
    merged.onDrop();

    expect(onDragStart).toHaveBeenCalledOnce();
    expect(onDrop).toHaveBeenCalledOnce();
  });

  it("lets a plain value from the second set win", () => {
    expect(mergeHandlers({ draggable: true }, { draggable: false }).draggable).toBe(
      false,
    );
  });
});
