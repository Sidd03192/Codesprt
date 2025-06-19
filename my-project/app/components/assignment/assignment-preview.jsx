import React from "react";
import { Card, Button } from "@heroui/react"; // Add other necessary imports
import { Icon } from "@iconify/react";
import Editor from "@monaco-editor/react";

export const AssignmentPreview = ({ assignment, onClose }) => {
  const isDark = true;

  // Ensure assignment and its properties are defined before accessing them
  const title = assignment?.title || "Assignment Preview";
  const description = assignment?.description || "No description provided.";
  const codeTemplate =
    assignment?.code_template || "// No code template provided.";
  const language = assignment?.language || "javascript"; // Default to javascript if not provided

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card
        className={`w-full max-w-4xl h-[90vh] flex flex-col ${
          isDark ? "bg-zinc-900" : "bg-white"
        } text-${isDark ? "white" : "black"}`}
      >
        <div
          className={`flex justify-between items-center p-4 border-b ${
            isDark ? "border-zinc-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button auto flat onClick={onClose} icon={<Icon icon="lucide:x" />} />
        </div>

        <div className="flex-1 flex overflow-hidden p-4">
          {/* Left Panel: Description */}
          <div
            className={`w-2/5 pr-4 overflow-y-auto ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <div dangerouslySetInnerHTML={{ __html: description }} />
            {/* Add other relevant details like constraints if available in 'assignment' prop */}
          </div>

          {/* Right Panel: Code Editor */}
          <div className="w-3/5 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language}
                value={codeTemplate}
                theme={isDark ? "vs-dark" : "light"}
                options={{
                  readOnly: true, // Make editor read-only for preview
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        </div>
        <div
          className={`p-4 border-t ${
            isDark ? "border-zinc-700" : "border-gray-200"
          } flex justify-end`}
        >
          <Button color="primary" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </Card>
    </div>
  );
};
