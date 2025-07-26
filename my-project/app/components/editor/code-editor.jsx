"use client";


import React, { useEffect, useState, useCallback, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { addToast } from "@heroui/react";


export default function StyledCodeEditor({
  language = "javascript",
  editorRef,
  initialLockedLines,
  role,
  onLockedLinesChange,
  starterCode,
  height,
  disableMenu,
  isDisabled,
}) {
  const monacoRef = useRef(null);
  const monaco = useMonaco();
  const [lockedLines, setLockedLines] = useState(
    () => new Set(initialLockedLines || [])
  );


  const lockedLinesRef = useRef(lockedLines);
  useEffect(() => {
    lockedLinesRef.current = lockedLines;
  }, [lockedLines]);


  const isUndoing = useRef(false);
  const allowNextChange = useRef(false);


  const handleEditorMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;


      // Define your exact custom theme
      monaco.editor.defineTheme("modernDark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
          { token: "string", foreground: "ce9178" },
          { token: "number", foreground: "b5cea8" },
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
          { token: "variable", foreground: "9cdcfe" },
          { token: "function", foreground: "dcdcaa" },
          { token: "type", foreground: "4ec9b0" },
          { token: "constant", foreground: "4fc1ff" },
          { token: "delimiter", foreground: "d4d4d4" },
          { token: "operator", foreground: "d4d4d4" },
        ],
        colors: {
          "editor.background": "#1e1e1e",
          "editor.foreground": "#d4d4d4",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#c6c6c6",
          "editor.lineHighlightBackground": "#2d2d30",
          "editor.selectionBackground": "#264f78",
          "editor.selectionHighlightBackground": "#3a3d41",
          "editorCursor.foreground": "#aeafad",
        },
      });


      monaco.editor.setTheme("modernDark");


      editor.updateOptions({
        glyphMargin: true,
        lineNumbers: "on",
        contextmenu: !disableMenu,
        fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
        fontSize: 14,
        lineHeight: 22,
        minimap: { enabled: false }, // Disable minimap
      });


      editor.onKeyDown((e) => {
        if (role === "teacher") return;
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;
        const isPasteKey = e.keyCode === monaco.KeyCode.KeyV;
        const isCopyKey = e.keyCode === monaco.KeyCode.KeyC;
        const isCutKey = e.keyCode === monaco.KeyCode.KeyX;
        if (isCtrlOrCmd && (isPasteKey || isCopyKey || isCutKey)) {
          e.preventDefault();
          e.stopPropagation();
        }
      });


      editor.onDidChangeModelContent((e) => {
        if (isUndoing.current) return;


        if (role === "student") {
          if (allowNextChange.current) {
            allowNextChange.current = false;
          } else {
            let shouldUndo = false;
            const currentLockedLines = lockedLinesRef.current;
            for (const change of e.changes) {
              const startLine = change.range.startLineNumber;
              const endLine = change.range.endLineNumber;
              for (let i = startLine; i <= endLine; i++) {
                if (currentLockedLines.has(i)) {
                  shouldUndo = true;
                  addToast({
                    title: "Disallowed Action",
                    description: "You may not edit locked lines.",
                    color: "warning",
                    duration: 5000,
                    variant: "solid",
                  });
                  break;
                }
              }
              if (shouldUndo) break;
            }
            if (shouldUndo) {
              isUndoing.current = true;
              editor.trigger("prevent-edit", "undo", null);
              isUndoing.current = false;
              return;
            }
          }
        }
      });
    },
    [editorRef, role, disableMenu]
  );


  return (
    <div className="flex flex-col bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden h-[calc(100vh-16px)] m-2">
      <div className="flex items-center bg-gradient-to-r from-[#2d2d2d] to-[#1e1e1e] h-10 px-4 border-b border-[#333] backdrop-blur">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
          </div>
          <div className="flex items-center text-xs font-medium text-white ml-4">
            <div className="w-fit px-1 h-4 bg-yellow-400 rounded flex items-center justify-center text-[10px] font-bold text-black mr-2">
              {language?.toUpperCase() || "CODE"}
            </div>
            script.{language}
          </div>
        </div>
      </div>


      <div className="flex-1 relative">
        <Editor
          height={height || "100%"}
          width="100%"
          language={language}
          theme="modernDark"
          defaultValue={starterCode || ""}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false }, // Ensure minimap disabled
            readOnly: isDisabled,
            smoothScrolling: true,
            cursorSmoothCaretAnimation: true,
            formatOnType: true,
            formatOnPaste: true,
            renderWhitespace: "selection",
            renderLineHighlight: "all",
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>


      <div className="flex items-center justify-between bg-[#007acc] h-6 px-4 text-xs text-white">
        <div className="flex items-center space-x-4">
          <span>{language?.toUpperCase()}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}