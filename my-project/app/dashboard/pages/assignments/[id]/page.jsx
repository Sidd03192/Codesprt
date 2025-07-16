'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import { Icon } from "@iconify/react";
import CodeEditor from "../../../../components/editor/code-editor";
import {
  Play, RotateCcw, Settings, ChevronRight, GripVertical, CloudUpload, Save,
} from "lucide-react";
import {
  Button,ScrollShadow, Tabs, Tab, Select, SelectItem, Card, CardBody, CardHeader, Tooltip,
  Spinner, Skeleton, addToast, code,
} from "@heroui/react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
} from "@heroui/react";
import Countdown from "react-countdown";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);

function AutograderAccordion(student) {
  const [open, setOpen] = useState(false);
  const editorRef = useRef(null);

  const testCases = [
    {
      name: "Test with positive numbers",
      status: "pass",
      error: null,
    },
    {
      name: "Test with zero",
      status: "fail",
      error: null,
    },
    {
      name: "Test with user object",
      status: "fail",
      error: null,
    },
    {
      name: "Test with large numbers",
      status: "warn",
      error: "NullPointerException at Solution.java:15",
    },
  ];

  return (
    <div className="bg-zinc-900/70 border-b border-white/10">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-3 text-white font-semibold hover:bg-white/10 transition"
      >
        <span>Autograder Results</span>
        <span className="text-white/50">{open ? "▲" : "▼"}</span>
      </button>
      {/* Accordion Content */}
      {open && (
        <>
        <div className="bg-gray-800 px-3 py-1 flex items-center space-x-2">
        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
      </div>

      <div className="flex-1 bg-black text-green-400 font-mono p-4 overflow-y-auto">
        <pre>
          <code>
            {`$ javac Student.java
  $ java Student
  Hello, ${student.name}!
  Autograder running...
  Test 1: ✅ Passed
  Test 2: ✅ Passed
  Test 3: ❌ Failed
  `}
          </code>
        </pre>
      </div>
      <div className="bg-gray-800 px-3 py-1 flex items-center space-x-2"><p>AutoGrader Score: 50/100 marks</p></div>
        </>
      )}
      
    </div>
  );
}


export default function AssignmentDetailPage() {
  const { id } = useParams();
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState("results");
  const [time, setTime] = useState("-");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [leftWidth, setLeftWidth] = useState(55); // percentage
  const [topHeight, setTopHeight] = useState(65);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUp, setTimeUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [assignmentData, setAssignmentData] = useState(null);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);
  const isDragging = useRef(false);
  const dragType = useRef(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const students = [
    { id: 's1', name: 'Alice' },
    { id: 's2', name: 'Bob' },
    { id: 's3', name: 'Charlie' },
  ]; // Replace with real data later

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      if (dragType.current === "vertical") {
        const newLeftWidth = (e.clientX / window.innerWidth) * 100;
        if (newLeftWidth > 10 && newLeftWidth < 90) {
          setLeftWidth(newLeftWidth);
        }
      } else if (dragType.current === "horizontal") {
        const newTopHeight = (e.clientY / window.innerHeight) * 100;
        if (newTopHeight > 10 && newTopHeight < 90) {
          setTopHeight(newTopHeight);
        }
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      dragType.current = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = useCallback(
    (type) => (e) => {
      isDragging.current = true;
      dragType.current = type;
      e.preventDefault();
    },
    []
  );

  useEffect(() => {
    if (!id) return;
    async function fetchAssignment() {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Supabase error:', error);
        setError('Assignment not found');
      } else {
        setAssignment(data);
      }
    }
    fetchAssignment();
  }, [id]);

  const runCode = async () => {
    const code = editorRef.current?.getValue?.();
    if (!code) {
      setOutput("Please select a language and write some code.");
      return;
    }
    try {
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
      console.error("Execution failed:", error);
      setOutput("Execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (initialCode) {
      editorRef.current?.setValue(initialCode);
    } else {
      addToast({
        title: "No initial code available",
        description: "There is no initial code to reset to.",
        duration: 3000,
        color: "warning",
        variant: "flat",
      });
    }
  };

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <span className="text-red-500 font-bold">Assignment is past due.</span>
      );
    } else {
      const isUrgent = days === 0 && hours === 0 && minutes < 5
        ? "text-red-500 font-bold animate-pulse"
        : "";
      const pad = (num) => num.toString().padStart(2, "0");
      return (
        <span className={isUrgent}>
          {days > 0 && `${days}d `}
          {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
        </span>
      );
    }
  };

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!assignment) return <p className="p-6">Loading...</p>;

  return (
    <form>
      <div className="h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] p-4 flex gap-2">
        {/* Left Panel */}
        <Card
          className="backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden bg-zinc-800/40"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-0 pt-4 px-2 border-b border-white/10 bg-black/20 rounded-t-2xl min-h-[50px]">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                aria-label="Problem Sections"
                color="secondary"
                variant="underlined"
                className="font-medium"
              >
                <Tab key="results" title="Results & Submissions" />
                <Tab key="Description" title="Description" />
              </Tabs>
            </CardHeader>

            {activeTab === "Description" && (
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <h1 className="text-3xl font-bold text-white">
                  {assignmentData?.title || "Assignment Title"}
                </h1>
                <div className="space-y-4 mt-6">
                  <div dangerouslySetInnerHTML={{ __html: assignmentData?.description || "" }} />
                </div>
              </div>
            )}

            {activeTab === "results" && (
                <div className="w-full h-full bg-zinc-900/80 rounded-lg border border-white/10 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="py-3 px-4 bg-zinc-800 border-b border-white/10 text-white font-semibold flex justify-between items-center">
                    {selectedStudent ? (
                      <>
                        <span>Grading: {selectedStudent.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null);
                          }}
                          className="text-sm text-blue-400 hover:underline"
                        >
                          ← Back to Student List
                        </button>
                      </>
                    
                    ) : (
                      <>
                        <span>Students</span>
                        <span className="text-red-400">🎓</span>
                      </>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {!selectedStudent ? (
                      // Student Tab List View
                      <div className="flex flex-col divide-y divide-white/10 w-full">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`w-full cursor-pointer px-6 py-4 text-sm transition-all ${
                              selectedStudent?.id === student.id
                                ? "bg-purple-600/30 text-white font-semibold border-l-4 border-purple-500"
                                : "hover:bg-white/10 text-gray-300"
                            }`}
                          >
                            {student.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Grading UI
                      <div className="space-y-8 text-white">
                        {/* Feedback + Rubric */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            )}

          </div>
        </Card>

        {/* Vertical Drag Handle */}
        <div
          className="w-1.5 bg-white/10 hover:bg-purple-500/50 active:bg-purple-500/50 cursor-col-resize rounded-full transition-colors duration-200 flex items-center justify-center group"
          onMouseDown={handleMouseDown("vertical")}
        >
          <GripVertical size={16} className="text-white/30 group-hover:text-blue-400/70" />
        </div>

        {/* Right Panel */}
        {selectedStudent && (
          <Card
            className="backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden right-panel bg-zinc-800/50"
            style={{ width: `${100 - leftWidth - 1}%` }}
          >
            {/* Accordion for Autograder Results */}
            <AutograderAccordion student={selectedStudent} />

            {/* Code Editor Section */}
            <div style={{ height: `${topHeight}%` }} className="flex flex-col">
              <CardHeader className="flex items-center justify-between py-2 px-6 border-b border-white/10 bg-black/20 rounded-t-2xl h-14">
                <div className="text-white font-semibold">
                  {selectedStudent.name}'s Code
                </div>
              </CardHeader>

              <div className="flex-1 bg-black/30 pt-2">
                <CodeEditor
                  language="java"
                  editorRef={editorRef}
                  role="student"
                  disableMenu={false}
                  starterCode={`// Student code for ${selectedStudent.name}`}
                  isDisabled={false}
                />
              </div>
            </div>

            {/* Horizontal Resize Handle */}
            <div
              className="h-1.5 bg-white/10 hover:bg-blue-400/50 cursor-row-resize transition-colors duration-200 flex items-center justify-center group"
              onMouseDown={handleMouseDown("horizontal")}
            >
              <div className="w-8 h-0.5 bg-white/30 group-hover:bg-blue-400/70 rounded-full"></div>
            </div>

            {/* Console Section */}
            <div style={{ height: `${100 - topHeight}%` }} className="flex flex-col">
              <div className="flex-1 p-6 bg-black/20 overflow-y-auto custom-scrollbar">
                <div className="text-gray-200 text-lg">
                  {output != null ? (
                    <div>Output: {output}</div>
                  ) : (
                    'Click "Run Code" to see output here...'
                  )}
                </div>
              </div>
            </div>
            {/* Action Bar */}
<div className="flex items-center justify-between px-6 py-4 bg-black/30 border-t border-white/10 rounded-b-2xl">
  <div className="text-sm text-gray-400 bg-gray-800/40 px-4 py-2 rounded-lg border border-gray-700/30">
    ⏱️ {time}
  </div>
  <div className="flex items-center gap-4 ">
    <Button
      onPress={runCode}
      isDisabled={isRunning}
      startContent={
        (isRunning && <Spinner color="secondary" size="sm" />) || (
          <Play size={16} />
        )
      }
      color="secondary"
      variant="flat"
    >
      Run
    </Button>
    <Button
      color="primary"
      variant="flat"
      onPress={() => saveAssignmentData(false)}
      isDisabled={isSubmitting || saving || timeUp}
      startContent={
        saving ? (
          <Spinner size="sm" color="primary" />
        ) : (
          <Save size={16} />
        )
      }
    >
      Save
    </Button>
    <Button
      onPress={onOpen}
      isDisabled={isSubmitting || timeUp}
      startContent={
        (isSubmitting && <Spinner color="success" size="sm" />) || (
          <CloudUpload size={16} />
        )
      }
      color="success"
      variant="flat"
    >
      Submit
    </Button>

    {/* Submission Confirmation Modal */}
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Submit Assignment
            </ModalHeader>
            <ModalBody>
              <Card className="border-spacing-3 border-large border-yellow-400 p-5 bg-zinc-850">
                <p className="text-yellow-500">
                  Are you sure you want to submit this assignment?
                  This action cannot be undone.
                </p>
              </Card>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
              >
                Close
              </Button>
              <Button
                onPress={() => saveAssignmentData(true)}
                disabled={isSubmitting}
                startContent={
                  (isSubmitting && (
                    <Spinner color="success" size="sm" />
                  )) || <CloudUpload size={16} />
                }
                color="success"
                variant="flat"
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  </div>
</div>

          </Card>
        )}

        {/* Scrollbar Style */}
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
    </form>
  );
}
