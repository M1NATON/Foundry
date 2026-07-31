"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Этап пайплайна — это ВИД, а не оверлей: одновременно смонтирован ровно
 * один из них. Всё состояние сцен и скрипта живёт в кеше React Query,
 * поэтому размонтирование вида ничего не теряет.
 */
export type EditorStep = "research" | "script" | "storyboard" | "producing";

/** Фокус инспектора внутри Producing — какой тип ассета показывать. */
export type EditorTool = "frames" | "clip" | "voice" | "music" | null;

export type Theme = "light" | "dark";

/** Дефолтный масштаб таймлайна, пикселей на секунду. */
export const DEFAULT_TIMELINE_ZOOM = 40;

const THEME_STORAGE_KEY = "foundry-theme";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

interface EditorState {
  step: EditorStep;
  setStep: (step: EditorStep) => void;
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

export function EditorProvider({
  children,
  initialStep = "producing",
  initialSelectedSceneId = null,
}: {
  children: React.ReactNode;
  /** Стартовый вид — задаётся из тестов и потенциально из ссылки на этап. */
  initialStep?: EditorStep;
  initialSelectedSceneId?: string | null;
}) {
  const [step, setStep] = useState<EditorStep>(initialStep);
  const [tool, setTool] = useState<EditorTool>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    initialSelectedSceneId,
  );
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
      step,
      setStep,
      tool,
      setTool,
      selectedSceneId,
      setSelectedSceneId,
      timelineZoom,
      setTimelineZoom,
      theme,
      setTheme,
    }),
    [step, tool, selectedSceneId, timelineZoom, theme],
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
