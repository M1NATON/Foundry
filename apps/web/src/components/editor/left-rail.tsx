"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FileText, Layers, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditor } from "@/lib/editor-store";

export function LeftRail() {
  const pathname = usePathname();
  const { step, setStep, tool, setTool } = useEditor();

  const items = [
    {
      key: "library",
      label: "Library",
      icon: Library,
      href: "/",
      active: pathname === "/",
    },
    {
      key: "script",
      label: "Script",
      icon: FileText,
      onClick: () => setStep("script"),
      active: step === "script",
    },
    {
      key: "assets",
      label: "Assets",
      icon: Layers,
      onClick: () => {
        setStep("producing");
        setTool(tool === "frames" ? null : "frames");
      },
      active: step === "producing" && tool === "frames",
    },
  ];

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-3">
      {items.map((item) => {
        const Icon = item.icon;
        const className = cn(
          "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          item.active
            ? "bg-accent-soft text-accent"
            : "text-secondary hover:bg-border/40 hover:text-primary",
        );
        return item.href ? (
          <Link
            key={item.key}
            href={item.href}
            aria-label={item.label}
            className={className}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        ) : (
          <button
            key={item.key}
            onClick={item.onClick}
            aria-label={item.label}
            className={className}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </button>
        );
      })}
    </nav>
  );
}
