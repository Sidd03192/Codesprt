'use client';

import React, { useEffect, useState , useCallback,useRef} from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { javaLibMethods,javaKeywords, pythonLibMethods, pythonKeywords,extraPythonModules } from './constants';
import {PenOff } from 'lucide-react'



export default function CodeEditor({ language, editorRef, enabledAutocomplete, }) {
  const monacoRef = useRef(null);
  const monaco = useMonaco();
  const editor = editorRef.current;
  const [val, setVal] = useState('');
  const [lockedLines, setLockedLines] = useState([]);
  const [hiddenLines, setHiddenLines] = useState([]);
  const [checkedLines, setCheckedLines] = useState(new Set());
    const [decorIds, setDecorIds] = useState([]);
 
    function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // turn on glyphMargin and keep line numbers on
    editor.updateOptions({
      glyphMargin: true,
      lineNumbers: 'on'
    });

    // click‐handler for both the glyph margin **and** the line numbers gutter
    editor.onMouseDown(e => {
      const t = e.target.type;
      if (
        t === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        t === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
      ) {
        const line = e.target.position?.lineNumber;
        if (!line) return;

        setCheckedLines(prev => {
          const next = new Set(prev);
          if (next.has(line)) next.delete(line);
          else next.add(line);
          return next;
        });
      }
    });
  }


  // whenever checkedLines changes, update the decorations
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // build one decoration per checked line
    const newDecs = Array.from(checkedLines).map(line => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        glyphMarginClassName: 'checkboxGlyph',
        glyphMarginHoverMessage: { value: 'locked' }
      }
    }));

    // apply them, replacing the old ones
    const newIds = editor.deltaDecorations(decorIds, newDecs);
    setDecorIds(newIds);
  }, [checkedLines]);
  // lock styles
useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .monaco-editor .checkboxGlyph {
        background: url('./llee.svg') no-repeat center center;
        
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
}, []);
  
useEffect(() => {
    if (!monaco || !editor) return;  
    let provider;

    if (enabledAutocomplete) {
       // ─── Java provider ───────────────────────────────────────────────
    if (language === 'java') {
      provider = monaco.languages.registerCompletionItemProvider('java', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
          const suggestions = [];
          const text = model.getValue();

          // 1) Build instance → class map
          const instMap = {};
          const genRe  = /\b\w+<[^>]*>\s+(\w+)\s*=\s*new\s+(\w+)/g;
          const simpRe = /\b(\w+)\s+(\w+)\s*=\s*[^;]+;/g;
          let m;
          while ((m = genRe.exec(text)))  instMap[m[1]] = m[2];
          while ((m = simpRe.exec(text))) instMap[m[2]] = m[1];

          // 2) Are we after a dot?
          const line     = model
            .getLineContent(position.lineNumber)
            .slice(0, position.column - 1);
          const dotMatch = /(\w+)\.$/.exec(line);

          if (dotMatch) {
            // 3) Only methods for that instance
            const instName = dotMatch[1];
            const cls      = instMap[instName] || '';
            const methods  = javaLibMethods[cls] || [];
            methods.forEach(fn => {
              suggestions.push({
                label: fn,
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: `${fn}($0)`,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: `${cls}.${fn}()`,
              });
            });
            return { suggestions };
          }

          // 4) Otherwise: keywords first…
          const prefix = model.getWordUntilPosition(position).word;
          javaKeywords
            .filter(k => k.startsWith(prefix) && k !== prefix)
            .forEach(k =>
              suggestions.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: k,
              })
            );

          // 5) …then your vars & classes
          const keys = [
            ...Object.keys(instMap),
            ...Object.keys(javaLibMethods),
            ...extraJavaClasses
          ];
          keys
            .filter(w => w.startsWith(prefix) && w !== prefix)
            .forEach(w => {
              const isVar   = instMap[w] !== undefined;
              const isClass = javaLibMethods[w] !== undefined;
              suggestions.push({
                label: w,
                kind: isVar
                  ? monaco.languages.CompletionItemKind.Variable
                  : isClass
                  ? monaco.languages.CompletionItemKind.Class
                  : monaco.languages.CompletionItemKind.Module,
                insertText: w,
              });
            });

          return { suggestions };
        },
      });
    }

    // ─── Python provider ─────────────────────────────────────────────
    else if (language === 'python') {
      provider = monaco.languages.registerCompletionItemProvider('python', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
          const suggestions = [];
          const text = model.getValue();

          // 1) Build instance → type map from assignments `x = ClassName(...)`
          const instMap = {};
          const assignRe = /\b(\w+)\s*=\s*([A-Za-z_]\w*)\s*\(/g;
          let m;
          while ((m = assignRe.exec(text))) {
            instMap[m[1]] = m[2];
          }

          // 2) Dot context?
          const line     = model
            .getLineContent(position.lineNumber)
            .slice(0, position.column - 1);
          const dotMatch = /(\w+)\.$/.exec(line);

          if (dotMatch) {
            // 3) Only methods for that instance or module
            const instName = dotMatch[1];
            let methods = [];

            // class-based methods
            if (instMap[instName] && pythonLibMethods[instMap[instName]]) {
              methods = pythonLibMethods[instMap[instName]];
            }
            // module-based functions (e.g. math, random…)
            else if (pythonLibMethods[instName]) {
              methods = pythonLibMethods[instName];
            }

            methods.forEach(fn => {
              suggestions.push({
                label: fn,
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: `${fn}($0)`,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: `${instName}.${fn}()`,
              });
            });
            return { suggestions };
          }

          // 4) Otherwise: keywords first
          const prefix = model.getWordUntilPosition(position).word;
          pythonKeywords
            .filter(k => k.startsWith(prefix) && k !== prefix)
            .forEach(k =>
              suggestions.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: k,
              })
            );

          // 5) then variables
          Object.keys(instMap)
            .filter(v => v.startsWith(prefix) && v !== prefix)
            .forEach(v =>
              suggestions.push({
                label: v,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: v,
              })
            );

          // 6) then modules
          extraPythonModules
            .filter(mo => mo.startsWith(prefix) && mo !== prefix)
            .forEach(mo =>
              suggestions.push({
                label: mo,
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: mo,
              })
            );

          return { suggestions };
        },
      });
    }
    }
   
  // locks ui -----------------------------
 
}, [monaco,editor, language, ]);


  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/40">
      
      <Editor
        height="600px"
        language={language}
        theme="vs-dark"
        value={val}
        onMount={handleEditorMount}
        onChange={v => setVal(v)}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: true,
          fontSize: 15,
          lineNumbers: 'on',
          lineNumbersMinChars:3,
         
        }}
        
      />
    </div>
  );
}
