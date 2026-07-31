import { describe, expect, it } from "vitest";
import {
  EXPORT_FPS,
  secondsToFrames,
  timecode,
  toEdl,
  toFcpxml,
  type TimelineClip,
} from "../src/export/timeline";

function clip(patch: Partial<TimelineClip> = {}): TimelineClip {
  return {
    order: 1,
    name: "Opening beat",
    startFrames: 0,
    durationFrames: secondsToFrames(12),
    videoPath: "/srv/foundry/uploads/frame.png",
    audioPath: null,
    ...patch,
  };
}

describe("secondsToFrames", () => {
  it("converts whole seconds to whole frames", () => {
    expect(secondsToFrames(12)).toBe(12 * EXPORT_FPS);
  });

  it("never collapses a scene to zero frames", () => {
    expect(secondsToFrames(0)).toBe(1);
  });
});

describe("toFcpxml", () => {
  it("writes durations as frame rationals, never as decimal seconds", () => {
    const xml = toFcpxml("Deep Sea", [clip()]);

    // 12s при 30 fps — 360 кадров. Десятичные секунды монтажка отвергает
    // как «not on edit frame boundary», поэтому только дроби.
    expect(xml).toContain(`duration="36000/3000s"`);
    expect(xml).not.toMatch(/duration="\d+\.\d+s"/);
  });

  it("references media as file URLs and escapes names", () => {
    const xml = toFcpxml("Tom & Jerry", [
      clip({ name: `Scene "one"`, videoPath: "/srv/up loads/a b.mp4" }),
    ]);

    expect(xml).toContain("file:///srv/up%20loads/a%20b.mp4");
    expect(xml).toContain("Tom &amp; Jerry");
    expect(xml).toContain("Scene &quot;one&quot;");
  });

  it("keeps still images out of the frame-rate format", () => {
    const stills = toFcpxml("P", [clip({ videoPath: "/u/frame.png" })]);
    const clips = toFcpxml("P", [clip({ videoPath: "/u/clip.mp4" })]);

    // frameDuration у неподвижного кадра ломает импорт в Resolve.
    expect(stills).toContain('<asset id="r1" name="frame.png"');
    expect(stills).not.toMatch(/name="frame.png"[^>]*format="r0"/);
    expect(clips).toMatch(/name="clip.mp4"[^>]*format="r0"/);
  });

  it("leaves a gap for a scene with no picture so later scenes keep their time", () => {
    const xml = toFcpxml("P", [
      clip({ videoPath: null }),
      clip({ order: 2, startFrames: secondsToFrames(12) }),
    ]);

    expect(xml).toContain("<gap ");
    expect(xml).toContain(`offset="36000/3000s"`);
  });

  it("puts the voice on its own lane under the picture", () => {
    const xml = toFcpxml("P", [clip({ audioPath: "/u/voice.mp3" })]);

    expect(xml).toContain('lane="-1"');
    expect(xml).toContain('audioRole="dialogue"');
    expect(xml).toContain('hasAudio="1"');
  });
});

describe("timecode", () => {
  it("formats CMX3600 timecode at the export frame rate", () => {
    expect(timecode(0)).toBe("00:00:00:00");
    expect(timecode(EXPORT_FPS)).toBe("00:00:01:00");
    expect(timecode(EXPORT_FPS * 61 + 5)).toBe("00:01:01:05");
    expect(timecode(EXPORT_FPS * 3600)).toBe("01:00:00:00");
  });
});

describe("toEdl", () => {
  it("numbers events and records both source and record timecode", () => {
    const edl = toEdl("Deep Sea", [
      clip(),
      clip({ order: 2, startFrames: secondsToFrames(12), name: "Descent" }),
    ]);

    expect(edl).toContain("TITLE: Deep Sea");
    expect(edl).toContain("001  AX       V     C        00:00:00:00 00:00:12:00 00:00:00:00 00:00:12:00");
    expect(edl).toContain("002  AX       V     C        00:00:00:00 00:00:12:00 00:00:12:00 00:00:24:00");
    expect(edl).toContain("* SCENE 02: Descent");
  });

  it("marks a scene without a picture as black", () => {
    expect(toEdl("P", [clip({ videoPath: null })])).toContain(
      "* FROM CLIP NAME: BLACK",
    );
  });
});
