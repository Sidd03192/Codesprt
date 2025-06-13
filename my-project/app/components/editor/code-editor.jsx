'use client';

import React, { useEffect, useState , useCallback,useRef} from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { javaLibMethods,javaKeywords, pythonLibMethods, pythonKeywords,extraPythonModules } from './constants';
import { PenOff, Eye } from 'lucide-react'

export default function CodeEditor({ language, editorRef, enabledAutocomplete, }) {
  const monacoRef = useRef(null);
  const monaco = useMonaco();
  const editor = editorRef.current;
  const [val, setVal] = useState('');
  const [lockedLines, setLockedLines] = useState([]);
  const [hiddenLines, setHiddenLines] = useState([]);
  const [checkedLines, setCheckedLines] = useState(new Set());
  const [eyeLines, setEyeLines] = useState(new Set()); // New state for eye icons
  const [decorIds, setDecorIds] = useState([]);
  const [hoveredLine, setHoveredLine] = useState(null); // Track hovered line
 
  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // turn on glyphMargin and keep line numbers on
    editor.updateOptions({
      glyphMargin: true,
      lineNumbers: 'on'
    });

    // Mouse move handler for hover effects
    editor.onMouseMove(e => {
      const t = e.target.type;
      if (t === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const line = e.target.position?.lineNumber;
        setHoveredLine(line || null);
      } else {
        setHoveredLine(null);
      }
    });

    // Mouse leave handler to clear hover
    editor.onMouseLeave(() => {
      setHoveredLine(null);
    });

    // click‐handler for both the glyph margin **and** the line numbers gutter
  // Replace the click handler in your handleEditorMount function with this:

editor.onMouseDown(e => {
  const t = e.target.type;
  if (
    t === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
    t === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
  ) {
    const line = e.target.position?.lineNumber;
    if (!line) return;

    // Use a ref to track what action we need to take
    let hasEyeIcon = false;
    let hasCheckbox = false;

    // Check current state
    setEyeLines(currentEyeLines => {
      hasEyeIcon = currentEyeLines.has(line);
      if (hasEyeIcon) {
        // Remove eye icon
        const updated = new Set(currentEyeLines);
        updated.delete(line);
        return updated;
      }
      return currentEyeLines;
    });

    // Only handle checkbox if no eye icon was found
    if (!hasEyeIcon) {
      setCheckedLines(currentCheckedLines => {
        hasCheckbox = currentCheckedLines.has(line);
        if (hasCheckbox) {
          // Remove checkbox
          const updated = new Set(currentCheckedLines);
          updated.delete(line);
          return updated;
        } else {
          // Add checkbox
          const updated = new Set(currentCheckedLines);
          updated.add(line);
          return updated;
        }
      });
    }
  }
});
  }

  // Function to add eye icons to selected lines
  const addEyeToSelection = useCallback(() => {
    if (!editor) return;
    
    const selection = editor.getSelection();
    if (!selection) return;

    const startLine = selection.startLineNumber;
    const endLine = selection.endLineNumber;
    
    setEyeLines(prev => {
      const next = new Set(prev);
      for (let i = startLine; i <= endLine; i++) {
        next.add(i);
        // Remove from checked lines if it exists there
        setCheckedLines(prevChecked => {
          const nextChecked = new Set(prevChecked);
          nextChecked.delete(i);
          return nextChecked;
        });
      }
      return next;
    });
  }, [editor]);

  // whenever checkedLines or eyeLines changes, update the decorations
useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // Get current model and line count
    const model = editor.getModel();
    if (!model) return;
    
    const totalLines = model.getLineCount();
    
    // Filter out lines that don't exist anymore
    const validCheckedLines = Array.from(checkedLines).filter(line => line <= totalLines);
    const validEyeLines = Array.from(eyeLines).filter(line => line <= totalLines);
    
    const newDecs = [];
    
    // Add decorations for checked lines (checkbox icons)
    validCheckedLines.forEach(line => {
      newDecs.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          glyphMarginClassName: 'checkboxGlyph',
          glyphMarginHoverMessage: { value: 'Locked line' },
          className: 'locked-line-highlight',
          isWholeLine: true,
          stickiness: monaco.editor.TrackedRangeStickiness.GrowsOnlyWhenTypingBefore
        }
      });
    });

    // Add decorations for eye lines
    validEyeLines.forEach(line => {
      newDecs.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          glyphMarginClassName: 'eyeGlyph',
          glyphMarginHoverMessage: { value: 'Hidden line' },
          className: 'hidden-line-highlight',
          isWholeLine: true,
          stickiness: monaco.editor.TrackedRangeStickiness.GrowsOnlyWhenTypingBefore
        }
      });
    });

    // Add hover decoration for lines that don't have icons
    if (hoveredLine && !validCheckedLines.includes(hoveredLine) && !validEyeLines.includes(hoveredLine)) {
      newDecs.push({
        range: new monaco.Range(hoveredLine, 1, hoveredLine, 1),
        options: {
          glyphMarginClassName: 'hoverGlyph',
          isWholeLine: false,
        }
      });
    }

    // apply them, replacing the old ones
    const newIds = editor.deltaDecorations(decorIds, newDecs);
    setDecorIds(newIds);
  }, [checkedLines, eyeLines, hoveredLine]);

  // Styles for all the glyph icons
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .monaco-editor .checkboxGlyph {
        background: url('./1.svg') no-repeat center center;
        background-size: 14px;
        cursor: pointer;
        margin-left: 2px;
        width: 20px !important;
        height: 20px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .monaco-editor .locked-line-highlight {
        background-color: rgba(217, 72, 15, 0.4);
      }
      
      .monaco-editor .eyeGlyph {
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>') no-repeat center center;
        background-size: 14px;
        cursor: pointer;
        margin-left: 2px;
        width: 20px !important;
        height: 20px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      .monaco-editor .eyeGlyph:hover {
        background-color: rgba(59, 130, 246, 0.6);
      }
      .monaco-editor .hidden-line-highlight {
        background-color: rgba(59, 130, 246, 0.3);
      }
      
      .monaco-editor .hoverGlyph {
        background: url('./2.svg') no-repeat center center;
        background-size: 12px;
        cursor: pointer;
        margin-left: 2px;
        width: 20px !important;
        height: 20px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        opacity: 0.5;
      }
      .monaco-editor .hoverGlyph:hover {
        background-color: rgba(156, 163, 175, 0.3);
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  useEffect(() => {
    if (!monaco || !editor) return;  
    let provider;

    if (true) {
       // ─── Java provider ───────────────────────────────────────────────
    if (language === 'java') {
  provider = monaco.languages.registerCompletionItemProvider('java', {
    triggerCharacters: ['.'],
    provideCompletionItems: (model, position) => {
      const suggestions = [];
      const text = model.getValue();
      const allSuggestions = new Set(); // Global set to prevent ALL duplicates

      // 1) Build instance → class map
      const instMap = {};
      
      // Fixed regex patterns for better space handling
      const genRe = /\b(\w+)\s*<[^>]+>\s+(\w+)\s*=\s*new\s+\1/g;
      const simpRe = /\b(\w+)\s+(\w+)\s*=\s*[^;]+/g;
      
      let m;
      while ((m = genRe.exec(text))) {
        instMap[m[2]] = m[1]; // Map instance to class
      }
      while ((m = simpRe.exec(text))) {
        // Avoid mapping keywords as classes
        if (!javaKeywords.includes(m[1])) {
          instMap[m[2]] = m[1];
        }
      }

      // 2) Are we after a dot?
      const line = model
        .getLineContent(position.lineNumber)
        .slice(0, position.column - 1);
      const dotMatch = /(\w+)\s*\.$/.exec(line); // Allow spaces before dot

      if (dotMatch) {
        // 3) Suggest methods for the instance
        const instName = dotMatch[1];
        const cls = instMap[instName] || '';
        const methods = javaLibMethods[cls] || [];
        
        methods.forEach(fn => {
          const suggestionKey = `method_${fn}`;
          if (!allSuggestions.has(suggestionKey)) {
            allSuggestions.add(suggestionKey);
            suggestions.push({
              label: fn,
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: `${fn}($0)`,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: `${cls}.${fn}()`,
            });
          }
        });
        return { suggestions };
      }

      // 4) Otherwise: keywords first
      const prefix = model.getWordUntilPosition(position).word;
      
      javaKeywords
        .filter(k => k.startsWith(prefix) && k !== prefix)
        .forEach(k => {
          const suggestionKey = `keyword_${k}`;
          if (!allSuggestions.has(suggestionKey)) {
            allSuggestions.add(suggestionKey);
            suggestions.push({
              label: k,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: k,
            });
          }
        });

      // 5) Variables and classes
      const keys = [
        ...Object.keys(instMap),
        ...Object.keys(javaLibMethods),
        ...extraJavaClasses,
      ];
      
      keys
        .filter(w => w.startsWith(prefix) && w !== prefix)
        .forEach(w => {
          const isVar = instMap[w] !== undefined;
          const isClass = javaLibMethods[w] !== undefined;
          
          // Create unique key based on type and name
          let suggestionKey;
          let kind;
          
          if (isVar) {
            suggestionKey = `var_${w}`;
            kind = monaco.languages.CompletionItemKind.Variable;
          } else if (isClass) {
            suggestionKey = `class_${w}`;
            kind = monaco.languages.CompletionItemKind.Class;
          } else {
            suggestionKey = `module_${w}`;
            kind = monaco.languages.CompletionItemKind.Module;
          }
          
          if (!allSuggestions.has(suggestionKey)) {
            allSuggestions.add(suggestionKey);
            suggestions.push({
              label: w,
              kind: kind,
              insertText: w,
            });
          }
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

      // 1) Build instance → type map from various assignment patterns
      const instMap = {};
      
      const patterns = [
        // Standard constructor: x = ClassName(...)
        /\b(\w+)\s*=\s*([A-Za-z_]\w*)\s*\(/g,
        // Module import usage: x = module.ClassName(...)
        /\b(\w+)\s*=\s*\w+\.([A-Za-z_]\w*)\s*\(/g,
        // List/dict comprehensions and built-ins: x = [...]
        /\b(\w+)\s*=\s*\[/g, // For lists
        /\b(\w+)\s*=\s*\{/g, // For dicts/sets
        // String literals: x = "..." or x = '...'
        /\b(\w+)\s*=\s*["']/g,
        // Numeric literals: x = 123
        /\b(\w+)\s*=\s*\d+/g,
        // Function calls without parentheses captured: x = some_function
        /\b(\w+)\s*=\s*([A-Za-z_]\w*)(?!\s*\()/g,
      ];

      // Apply patterns to build instance map
      patterns.forEach((pattern, index) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text))) {
          if (match[1] && match[2]) {
            instMap[match[1]] = match[2];
          } else if (match[1]) {
            // For patterns that don't capture a type, infer common types
            switch (index) {
              case 2: instMap[match[1]] = 'list'; break;
              case 3: instMap[match[1]] = 'dict'; break;
              case 4: instMap[match[1]] = 'str'; break;
              case 5: instMap[match[1]] = 'int'; break;
            }
          }
        }
      });

      // 2) Dot context?
      const line = model
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

        // Deduplicate methods
        const uniqueMethods = [...new Set(methods)];
        
        uniqueMethods.forEach(fn => {
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
      
      // Filter and deduplicate keywords
      const filteredKeywords = [...new Set(
        pythonKeywords.filter(k => k.startsWith(prefix) && k !== prefix)
      )];
      
      filteredKeywords.forEach(k =>
        suggestions.push({
          label: k,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: k,
        })
      );

      // 5) then variables
      const filteredVars = [...new Set(
        Object.keys(instMap).filter(v => v.startsWith(prefix) && v !== prefix)
      )];
      
      filteredVars.forEach(v =>
        suggestions.push({
          label: v,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: v,
        })
      );

      // 6) then modules and classes
      const allModulesAndClasses = [
        ...extraPythonModules,
        ...Object.keys(pythonLibMethods)
      ];
      
      const filteredModules = [...new Set(
        allModulesAndClasses.filter(mo => mo.startsWith(prefix) && mo !== prefix)
      )];
      
      filteredModules.forEach(mo => {
        const isModule = extraPythonModules.includes(mo);
        suggestions.push({
          label: mo,
          kind: isModule 
            ? monaco.languages.CompletionItemKind.Module
            : monaco.languages.CompletionItemKind.Class,
          insertText: mo,
        });
      });

      return { suggestions };
    },
  });
}
    }
   
  // locks ui -----------------------------
 
}, [monaco,editor, language, ]);

  // Clean up invalid locked lines when content changes  // Handle content changes and line number updates
  useEffect(() => {
    if (!editor || !monaco) return;
    
    const model = editor.getModel();
    if (!model) return;

    // Handle model content changes
    const disposable = model.onDidChangeContent(e => {
      const changes = e.changes;
      
      // Update checked lines based on line number changes
      setCheckedLines(prev => {
        const next = new Set();
        
        prev.forEach(line => {
          let newLine = line;
          
          // Apply each change to determine new line numbers
          for (const change of changes) {
            if (change.range.startLineNumber <= line) {
              const lineDelta = 
                change.text.split('\n').length - 1 - 
                (change.range.endLineNumber - change.range.startLineNumber);
              
              if (line >= change.range.startLineNumber) {
                newLine += lineDelta;
              }
            }
          }
          
          // Only keep the line if it still exists
          if (newLine > 0 && newLine <= model.getLineCount()) {
            next.add(newLine);
          }
        });
        
        return next;
      });

      // Update eye lines the same way
      setEyeLines(prev => {
        const next = new Set();
        
        prev.forEach(line => {
          let newLine = line;
          
          // Apply each change to determine new line numbers
          for (const change of changes) {
            if (change.range.startLineNumber <= line) {
              const lineDelta = 
                change.text.split('\n').length - 1 - 
                (change.range.endLineNumber - change.range.startLineNumber);
              
              if (line >= change.range.startLineNumber) {
                newLine += lineDelta;
              }
            }
          }
          
          // Only keep the line if it still exists
          if (newLine > 0 && newLine <= model.getLineCount()) {
            next.add(newLine);
          }
        });
        
        return next;
      });
    });

    return () => disposable.dispose();
  }, [editor, monaco]);

  // Clean up invalid lines when content changes
  useEffect(() => {
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const totalLines = model.getLineCount();
    setCheckedLines(prev => {
      const next = new Set([...prev].filter(line => line <= totalLines));
      return next.size === prev.size ? prev : next;
    });
    setEyeLines(prev => {
      const next = new Set([...prev].filter(line => line <= totalLines));
      return next.size === prev.size ? prev : next;
    });
  }, [val, editor]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/40">
      {/* Button to add eye icons to selection */}
      <div className="p-2 border-b border-zinc-700 bg-zinc-900/50">
        <button type='button'
          onClick={addEyeToSelection}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Eye size={16} />
          Hide Selection
        </button>
      </div>
      
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