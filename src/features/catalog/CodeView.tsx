import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "@/shared/hooks/useTheme";

const baseTheme = EditorView.theme({
  "&": { backgroundColor: "transparent", fontSize: "14px" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)", lineHeight: "1.6" },
  ".cm-gutters": { backgroundColor: "transparent", border: "none" },
  ".cm-content": { padding: "12px 0" },
});

/**
 * Code in a READ-ONLY CodeMirror editor: syntax colours, line numbers, selectable and copyable, not editable.
 *
 * This file is the heavy part (the editor library is large), so it is loaded with React.lazy by CodeBlock: only a page
 * that shows an editor downloads it. It has a default export because React.lazy needs one.
 */
export default function CodeView({ code }: { code: string }) {
  const host = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  // CodeMirror is not React: it builds its own DOM inside `host`. The effect creates the editor and the cleanup destroys it.
  // A new code sample or a theme change simply makes a new editor (cheap for a few dozen lines).
  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: code,
        extensions: [
          lineNumbers(),
          javascript({ jsx: true, typescript: true }),
          baseTheme,
          resolved === "dark" ? oneDark : syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
        ],
      }),
    });
    return () => view.destroy();
  }, [code, resolved]);

  // tabIndex 0: a box that scrolls sideways must be reachable with the keyboard (a read-only editor is not focusable by itself).
  return <div ref={host} tabIndex={0} role="region" aria-label="Code, read only" className="overflow-x-auto" />;
}
