import { describe, expect, it } from "vitest";
import { assetTypeOfFile } from "../src/lib/use-scene-drop";

describe("assetTypeOfFile", () => {
  it("routes pictures, clips and audio to their slots", () => {
    expect(assetTypeOfFile("frame.png")).toBe("IMAGE");
    expect(assetTypeOfFile("clip.mp4")).toBe("VIDEO");
    expect(assetTypeOfFile("narration.mp3")).toBe("VOICE");
  });

  it("ignores case and earlier dots in the name", () => {
    expect(assetTypeOfFile("Scene 01.FINAL.MOV")).toBe("VIDEO");
  });

  it("returns null for a file it cannot place", () => {
    expect(assetTypeOfFile("notes.pdf")).toBeNull();
    expect(assetTypeOfFile("README")).toBeNull();
  });
});
