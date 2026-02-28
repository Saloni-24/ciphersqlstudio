import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import './SQLEditor.scss';

// Monaco editor options — tuned for SQL
const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontLigatures: true,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  cursorStyle: 'line',
  padding: { top: 16, bottom: 16 },
  lineNumbers: 'on',
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  suggestOnTriggerCharacters: true,
  quickSuggestions: { other: true, comments: false, strings: false },
  // Enable basic SQL autocomplete
  suggest: { showKeywords: true },
};

export default function SQLEditor({ value, onChange, onExecute, isLoading }) {
  const editorRef = useRef(null);

  function handleMount(editor, monaco) {
    editorRef.current = editor;

    // Register Ctrl+Enter / Cmd+Enter to run query
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute && onExecute();
    });

    // Add SQL keywords for basic autocomplete
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: () => {
        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT',
          'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
          'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'ON',
          'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
          'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
          'IN', 'NOT IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL',
          'WITH', 'ASC', 'DESC', 'COALESCE', 'NULLIF', 'CAST',
          'ROUND', 'UPPER', 'LOWER', 'TRIM', 'LENGTH',
          'DATE', 'NOW', 'EXTRACT',
        ];
        return {
          suggestions: keywords.map((k) => ({
            label: k,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: k,
          })),
        };
      },
    });

    // Dark theme customisation on top of vs-dark
    monaco.editor.defineTheme('cipher-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword.sql',       foreground: '00c8ff', fontStyle: 'bold' },
        { token: 'string.sql',        foreground: '00e57a' },
        { token: 'number',            foreground: 'ffd166' },
        { token: 'comment',           foreground: '3d526a', fontStyle: 'italic' },
        { token: 'identifier.sql',    foreground: 'e2eaf4' },
      ],
      colors: {
        'editor.background':           '#111722',
        'editor.foreground':           '#e2eaf4',
        'editor.lineHighlightBackground': '#16202e',
        'editor.selectionBackground':  '#00c8ff22',
        'editorCursor.foreground':     '#00c8ff',
        'editorLineNumber.foreground': '#3d526a',
        'editorLineNumber.activeForeground': '#7a93b0',
        'editor.inactiveSelectionBackground': '#00c8ff11',
      },
    });

    monaco.editor.setTheme('cipher-dark');
  }

  return (
    <div className="sql-editor">
      {/* Editor toolbar */}
      <div className="sql-editor__toolbar">
        <div className="sql-editor__toolbar-left">
          <span className="sql-editor__lang-badge">SQL</span>
          <span className="sql-editor__hint-text">
            Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run
          </span>
        </div>

        <button
          className={`btn btn--run ${isLoading ? 'btn--loading' : ''}`}
          onClick={onExecute}
          disabled={isLoading || !value?.trim()}
          aria-label="Execute SQL query"
        >
          {!isLoading && (
            <>
              <span aria-hidden="true">▶</span>
              <span>RUN QUERY</span>
            </>
          )}
        </button>
      </div>

      {/* Monaco editor */}
      <div className="sql-editor__editor-wrap">
        <Editor
          language="sql"
          value={value}
          onChange={onChange}
          onMount={handleMount}
          options={EDITOR_OPTIONS}
          theme="cipher-dark"
          loading={
            <div className="sql-editor__loading">
              <div className="spinner" />
            </div>
          }
        />
      </div>
    </div>
  );
}