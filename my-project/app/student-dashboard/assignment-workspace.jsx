import React from "react";
import { Card, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";
import Editor from "@monaco-editor/react";

export const AssignmentWorkspace = ({ assignment }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [language, setLanguage] = React.useState("javascript");
  const [code, setCode] = React.useState("// Your code here");
  const [output, setOutput] = React.useState("");
  const [isRunning, setIsRunning] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const languageOptions = [
    { key: "javascript", name: "JavaScript", icon: "logos:javascript" },
    { key: "python", name: "Python", icon: "logos:python" },
    { key: "java", name: "Java", icon: "logos:java" },
    { key: "cpp", name: "C++", icon: "logos:c-plusplus" },
  ];

  const handleLanguageChange = (key) => {
    setLanguage(key);
    // Here you would typically load a language-specific template
    setCode("// Your code here");
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setOutput("Output: Hello, World!");
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setIsSaving(true);
    // Simulate submission
    setTimeout(() => {
      setIsSaving(false);
      // Here you would typically send the code to the server
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel: Assignment Description */}
      <div className={`w-2/5 p-4 overflow-y-auto border-r ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {assignment.description}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Example</h2>
            <Card className={isDark ? "bg-gray-800" : "bg-gray-50"}>
              <CardBody>
                <pre className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {assignment.example}
                </pre>
              </CardBody>
            </Card>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Constraints</h2>
            <ul className={`list-disc list-inside text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {assignment.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel: Code Editor and Output */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4">
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                color={isDark ? "success" : "primary"}
                startContent={<Icon icon={languageOptions.find(l => l.key === language).icon} />}
              >
                {languageOptions.find(l => l.key === language).name}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Language selection" 
              onAction={handleLanguageChange}
              selectedKeys={[language]}
            >
              {languageOptions.map((lang) => (
                <DropdownItem 
                  key={lang.key} 
                  startContent={<Icon icon={lang.icon} />}
                >
                  {lang.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <div className="flex gap-2">
            <Button
              color={isDark ? "success" : "primary"}
              variant="flat"
              startContent={<Icon icon="lucide:play" />}
              onPress={handleRunCode}
              isLoading={isRunning}
            >
              Run
            </Button>
            <Button
              color={isDark ? "success" : "primary"}
              startContent={<Icon icon="lucide:send" />}
              onPress={handleSubmit}
              isLoading={isSaving}
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={code}
            theme={isDark ? "vs-dark" : "light"}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className={`h-1/3 p-4 overflow-y-auto ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <pre className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {output || "Run your code to see the output here."}
          </pre>
        </div>
      </div>
    </div>
  );
};