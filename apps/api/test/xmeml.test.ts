import { describe, expect, it } from "vitest";
import { secondsToFrames } from "../src/export/timeline";
import { toXmeml, } from "../src/export/xmeml";
import type { TimelineClip } from "../src/export/timeline";

function clip(patch: Partial<TimelineClip> = {}): TimelineClip {
  return {
    order: 1,
    name: "Opening beat",
    startFrames: 0,
    durationFrames: secondsToFrames(12),
    videoPath: "/srv/foundry/uploads/frame.png",
    audioPath: null,
    note: null,
    ...patch,
  };
}

describe("toXmeml", () => {
  it("emits an xmeml v4 sequence Premiere can import", () => {
    const xml = toXmeml("Deep Sea", [clip()]);

    expect(xml).toContain('<xmeml version="4">');
    expect(xml).toContain("<sequence");
    expect(xml).toContain("<name>Deep Sea</name>");
  });

  it("normalizes Windows paths so media resolves on import", () => {
    const xml = toXmeml("P", [
      clip({ videoPath: "C:\\Users\\ARS\\up loads\\a b.png" }),
    ]);

    expect(xml).toContain(
      "<pathurl>file:///C:/Users/ARS/up%20loads/a%20b.png</pathurl>",
    );
  });

  it("writes portrait dimensions for shorts", () => {
    const xml = toXmeml("P", [clip()], [], { width: 1080, height: 1920 });

    expect(xml).toContain("<width>1080</width>");
    expect(xml).toContain("<height>1920</height>");
  });

  it("keeps timeline positions absolute so a scene without picture leaves a hole", () => {
    const xml = toXmeml("P", [
      clip({ videoPath: null, audioPath: "/u/voice.wav" }),
      clip({ order: 2, startFrames: secondsToFrames(12) }),
    ]);

    // Второй клип стартует в кадре 360, а не в нуле — дыра сохранена.
    expect(xml).toContain("<start>360</start>");
  });

  it("puts the motion note into a clip marker", () => {
    const xml = toXmeml("P", [clip({ note: "slow push-in" })]);

    expect(xml).toContain("<marker>");
    expect(xml).toContain("Motion: slow push-in");
  });

  it("escapes special characters in scene names", () => {
    const xml = toXmeml("Tom & Jerry", [clip({ name: 'Scene "one"' })]);

    expect(xml).toContain("Scene &quot;one&quot;");
    expect(xml).toContain("Tom &amp; Jerry");
  });

  it("does not emit transition items — Premiere sets dissolves by hand", () => {
    const xml = toXmeml("P", [
      clip(),
      clip({ order: 2, startFrames: secondsToFrames(12) }),
    ]);

    expect(xml).not.toContain("<transition");
  });
});
