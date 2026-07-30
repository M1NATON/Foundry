"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type EditorTool =
  | "script"
  | "storyboard"
  | "frames"
  | "clip"
  | "voice"
  | "music"
  | null;

export type Theme = "light" | "dark";

/** Дефолтный масштаб таймлайна, пикселей на секунду. */
export const DEFAULT_TIMELINE_ZOOM = 40;

const THEME_STORAGE_KEY = "foundry-theme";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

interface EditorState {
  tool: EditorTool;
  setTool: (tool: EditorTool) => void;
  selectedSceneId: string | null;
  setSelectedSceneId: (id: string | null) => void;
  timelineZoom: number;
  setTimelineZoom: (fn: (zoom: number) => number) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const EditorContext = createContext<EditorState | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [tool, setTool] = useState<EditorTool>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [timelineZoom, setTimelineZoom] = useState(DEFAULT_TIMELINE_ZOOM);
  const [theme, setTheme] = useState<Theme>("light");

  // Тема читается из localStorage только на клиенте, чтобы не расходиться
  // с SSR-разметкой (сервер всегда рендерит light).
  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<EditorState>(
    () => ({
      tool,
      setTool,
      selectedSceneId,
      setSelectedSceneId,
      timelineZoom,
      setTimelineZoom,
      theme,
      setTheme,
    }),
    [tool, selectedSceneId, timelineZoom, theme],
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor(): EditorState {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
}
