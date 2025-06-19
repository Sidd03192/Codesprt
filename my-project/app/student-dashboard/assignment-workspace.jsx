"use client";
import React, { useState, useRef, useCallback } from "react";
import {
  Play,
  RotateCcw,
  Settings,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import {
  Button,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
} from "@heroui/react";
import Editor from "@monaco-editor/react";
import { executeCode } from "../components/editor/api";
import CodeEditor from "../components/editor/code-editor";

const CodingInterface = ({ session, assignment }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [consoleTab, setConsoleTab] = useState("testcases");
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(45); // percentage
  const [topHeight, setTopHeight] = useState(65); // percentage of right panel
  const [time, setTime] = useState("-");
  const editorRef = React.useRef(null);

  const isDragging = useRef(false);
  const dragType = useRef("");

  const handleMouseDown = useCallback(
    (type) => (e) => {
      isDragging.current = true;
      dragType.current = type;
      e.preventDefault();
    },
    []
  );
  const [output, setOutput] = useState("");

  const runCode = async () => {
    const code = editorRef.current?.getValue?.();
    console.log("Running code..:", code);

    if (!code) {
      setOutput("Please select a language and write some code.");
      return;
    }

    try {
      // TODO edit teh selecedLanguage
      setIsRunning(true);
      const startTime = performance.now();
      const result = await executeCode("java", code);
      const endTime = performance.now();

      const runResult = result.run || {};
      if (!runResult.stderr) {
        setTime((endTime - startTime).toFixed(2));
      }
      const finalOutput =
        runResult.output ||
        runResult.stdout ||
        runResult.stderr ||
        "No output.";

      setOutput(finalOutput);
    } catch (error) {
      console.error(error);
      console.error("Execution failed:", error);
      setOutput("Execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;

    if (dragType.current === "vertical") {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 25 && newWidth < 75) {
        setLeftWidth(newWidth);
      }
    } else if (dragType.current === "horizontal") {
      const rightPanel = document.querySelector(".right-panel");
      const rect = rightPanel.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      if (newHeight > 30 && newHeight < 85) {
        setTopHeight(newHeight);
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    dragType.current = "";
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 3000);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] p-4 flex gap-2">
      {/* Left Panel - Problem Description */}
      <Card
        className="backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl flex flex-col overflow-hidden bg-zinc-800/40"
        style={{ width: `${leftWidth}%` }}
      >
        {/* Header Tabs */}
        <CardHeader className="pb-0 pt-4 px-2 border-b border-white/10 bg-black/20 rounded-t-2xl min-h-[50px]">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            aria-label="Problem Sections"
            color="secondary"
            variant="underlined"
            className="font-medium"
          >
            {["description", "submissions", "hints"].map((tab) => (
              <Tab
                key={tab}
                title={tab.charAt(0).toUpperCase() + tab.slice(1)}
              />
            ))}
          </Tabs>
        </CardHeader>

        {/* Problem Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-8">
            {/* Title and Difficulty */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">1. Two Sum</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Easy
                </span>
                <span className="text-gray-400 text-sm">✓ 4.2M</span>
                <span className="text-gray-400 text-sm">📝 8.9M</span>
                <span className="text-yellow-400 text-sm">⭐ 85.2%</span>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-5 text-gray-300 leading-relaxed">
              <p>
                Given an array of integers{" "}
                <code className="bg-gray-800/60 px-2 py-1 rounded-lg text-orange-300 font-mono text-sm">
                  nums
                </code>{" "}
                and an integer{" "}
                <code className="bg-gray-800/60 px-2 py-1 rounded-lg text-orange-300 font-mono text-sm">
                  target
                </code>
                , return{" "}
                <em className="text-blue-300">
                  indices of the two numbers such that they add up to target
                </em>
                .
              </p>
              <p>
                You may assume that each input would have{" "}
                <strong className="text-white">exactly one solution</strong>,
                and you may not use the same element twice.
              </p>
              <p>You can return the answer in any order.</p>
            </div>

            {/* Examples */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Examples</h3>

              <div className="space-y-4">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h4 className="font-semibold text-gray-200 mb-4">
                    Example 1:
                  </h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div>
                      <span className="text-gray-400">Input:</span>{" "}
                      <span className="text-blue-300">
                        nums = [2,7,11,15], target = 9
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Output:</span>{" "}
                      <span className="text-emerald-300">[0,1]</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <span className="text-gray-400">Explanation:</span>{" "}
                      <span className="text-gray-300">
                        Because nums[0] + nums[1] == 9, we return [0, 1].
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h4 className="font-semibold text-gray-200 mb-4">
                    Example 2:
                  </h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div>
                      <span className="text-gray-400">Input:</span>{" "}
                      <span className="text-blue-300">
                        nums = [3,2,4], target = 6
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Output:</span>{" "}
                      <span className="text-emerald-300">[1,2]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Constraints</h3>
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    2 ≤ nums.length ≤ 10⁴
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    -10⁹ ≤ nums[i] ≤ 10⁹
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    -10⁹ ≤ target ≤ 10⁹
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Only one valid answer exists.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Vertical Resize Handle */}
      <div
        className="w-1.5 bg-white/10 hover:bg-purple-500/50 active:bg-purple-500/50 cursor-col-resize rounded-full transition-colors duration-200 flex items-center justify-center group"
        onMouseDown={handleMouseDown("vertical")}
      >
        <GripVertical
          size={16}
          className="text-white/30 group-hover:text-blue-400/70 transition-colors"
        />
      </div>

      {/* Right Panel - Code Editor and Console */}
      <Card
        className="backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl flex flex-col overflow-hidden right-panel bg-zinc-800/50"
        style={{ width: `${100 - leftWidth - 1}%` }}
      >
        {/* Code Editor Section */}
        <div style={{ height: `${topHeight}%` }} className="flex flex-col">
          {/* Code Editor Header */}
          <CardHeader className="flex items-center justify-between  py-2 px-6 border-b border-white/10 bg-black/20 rounded-t-2xl h-14">
            <Select
              defaultSelectedKeys={["🐍 Python"]}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-800/60 text-white w-36 rounded-lg  "
              size="sm"
            >
              <SelectItem key={"🐍 Python"}>🐍 Python</SelectItem>
              <SelectItem key="java">☕ Java</SelectItem>
            </Select>
            <div className="flex items-center gap-2">
              <Tooltip content="Reset Code" color="danger">
                <Button
                  isIconOnly
                  variant="light"
                  className=" hover:bg-white/10 rounded-xl transition-all duration-200 group"
                  size="sm"
                >
                  <RotateCcw
                    size={16}
                    className="text-gray-400 group-hover:text-white"
                  />
                </Button>
              </Tooltip>

              <Button
                isIconOnly
                variant="light"
                className=" hover:bg-white/10 rounded-xl transition-all duration-200 group"
                size="sm"
              >
                <Settings
                  size={16}
                  className="text-gray-400 group-hover:text-white"
                />
              </Button>
            </div>
          </CardHeader>

          {/* Code Editor */}
          <div className="flex-1 bg-black/30 pt-2">
            <CodeEditor
              language={selectedLanguage || "java"}
              editorRef={editorRef}
              role="student"
              // TODO : make this dynamic
              starterCode={
                "this is starter code \n and it is on multiple lines"
              }
              initialLockedLines={new Set([])}
            />
          </div>
        </div>

        {/* Horizontal Resize Handle */}
        <div
          className="h-1.5 bg-white/10 hover:bg-blue-400/50 cursor-row-resize transition-colors duration-200 flex items-center justify-center group"
          onMouseDown={handleMouseDown("horizontal")}
        >
          <div className="w-8 h-0.5 bg-white/30 group-hover:bg-blue-400/70 rounded-full transition-colors"></div>
        </div>

        {/* Console Section */}
        <div
          style={{ height: `${100 - topHeight}%` }}
          className="flex flex-col"
        >
          {/* Console Tabs */}
          <div className="px-2 pt-1 border-b border-white/10 bg-black/20">
            <Tabs
              selectedKey={consoleTab}
              onSelectionChange={setConsoleTab}
              defaultSelectedKey={"console"}
              aria-label="Console Sections"
              color="primary"
              variant="underlined"
              className="font-medium"
            >
              {[
                { key: "console", id: "console", label: "Console", icon: "💻" },
              ].map((tab) => (
                <Tab
                  key={tab.id}
                  title={
                    <span className="flex items-center gap-2">
                      {tab.icon}
                      {tab.label}
                    </span>
                  }
                />
              ))}
            </Tabs>
          </div>

          {/* Console Content */}
          <div className="flex-1 p-6 bg-black/20 overflow-y-auto custom-scrollbar">
            <div className=" text-gray-200 text-lg">
              {"Output: " + output || 'Click "Run Code" to see output here...'}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-t border-white/10 rounded-b-2xl">
          <div className="text-sm text-gray-400 bg-gray-800/40 px-4 py-2 rounded-lg border border-gray-700/30">
            ⏱️ {time}
          </div>
          <div className="flex items-center gap-4">
            <Button
              onPress={runCode}
              disabled={isRunning}
              startContent={<Play size={16} />}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isRunning
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700/60 text-white hover:bg-gray-600/60 border border-gray-600/50 hover:border-gray-500/50"
              }`}
            >
              {isRunning ? "Running..." : "Run Code"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              startContent={<ChevronRight size={16} />}
              color="success"
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isSubmitting
                  ? "bg-emerald-700/60 text-emerald-200 cursor-not-allowed"
                  : "bg-emerald-600/80 text-white hover:bg-emerald-500/80 border border-emerald-500/50 hover:border-emerald-400/50 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </Card>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CodingInterface;
