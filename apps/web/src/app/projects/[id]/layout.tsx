import { EditorProvider } from "@/lib/editor-store";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EditorProvider>{children}</EditorProvider>;
}
