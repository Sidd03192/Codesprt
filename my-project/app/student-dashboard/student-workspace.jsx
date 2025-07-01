"use client";
import React, { useState, useRef, useCallback, act } from "react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Placeholder } from "@tiptap/extensions";
import { all, createLowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Countdown from "react-countdown";

import Heading from "@tiptap/extension-heading";
import {
  Play,
  RotateCcw,
  Settings,
  ChevronRight,
  GripVertical,
  CloudUpload,
  Save,
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
  Spinner,
  Skeleton,
  addToast,
  code,
} from "@heroui/react";
import { supabase } from "../supabase-client";
import Editor from "@monaco-editor/react";
import { getAssignmentDetails, saveAssignment } from "./api";
import { executeCode } from "../components/editor/api";
import "../components/assignment/RichText/editor-styles.css"; // Import highlight.js theme
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import CodeEditor from "../components/editor/code-editor";
import { RichTextEditor } from "../components/assignment/RichText/rich-description";
import { Icon } from "@iconify/react";

export const CodingInterface = ({ session, id, isPreview, previewData }) => {
  const [activeTab, setActiveTab] = useState("Description");
  const [consoleTab, setConsoleTab] = useState("testcases");
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(45); // percentage
  const [topHeight, setTopHeight] = useState(65); // percentage of right panel
  const [time, setTime] = useState("-");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialCode, setInitialCode] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const [formData, setFormData] = useState({
    submitted_code: "",
  });

  const [assignmentData, setAssignmentData] = useState(null);
  const fetchDataForAssignment = useCallback(async () => {
    if (isPreview) {
      setAssignmentData(previewData);
      console.log("Preview mode, skipping data fetch.");
      return;
    }
    if (!id) {
      console.log("No assignment ID provided.");
      return;
    }
    if (sessionStorage.getItem(`assignment-${id}`)) {
      setIsLoading(false);
      console.log("Loading assignment data from session storage for ID:", id);
      console.log(
        "Assignment data in session storage:",
        sessionStorage.getItem(`assignment-${id}`)
      );
      const savedData = sessionStorage.getItem(`assignment-${id}`);
      console.log("Saved data:", savedData);
      if (savedData) {
        console.log("Parsing saved data from session storage...");
        setAssignmentData(JSON.parse(savedData));
        const due_time = new Date(assignmentData?.due_at).getTime();
        if (due_time < Date.now()) {
          setTimeUp(true);
          setActiveTab("results");
        }
        return;
      }
    } else {
      console.log("No assignment data found in session storage for ID:", id);
    }
    try {
      console.log("Fetching assignment data...", id);
      setIsLoading(true);
      const data = await getAssignmentDetails(id);
      setAssignmentData(data);
      setInitialCode(data.code_template || "");
      console.log("Initial code set:", data.code_template || "");
      console.log("Assignment data fetched:", data);
      setIsLoading(false);
      const due_time = new Date(assignmentData?.due_at).getTime();
      if (due_time < Date.now()) {
        setTimeUp(true);
        setActiveTab("results");
      }
    } catch (error) {
      console.error("Error fetching assignment data:", error);
    }
  }, []);

  const saveAssignmentData = async (isSubmit) => {
    if (isPreview) {
      console.warn("Preview mode, skipping save/submit.");
      return;
    }
    const submit = isSubmit || false;
    const due_time = new Date(assignmentData?.due_at).getTime();
    if (Date.now() - 60 * 300 > due_time || !assignmentData) {
      console.warn("Assignment is past due, cannot submit."); // one minute buffer
      setSaving(false);

      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const student_id = user?.id;
    console.log("Current user ID:", student_id);
    console.log("time ", Date.now().toLocaleString(), "due time", due_time);
    console.log(" Attempting to save assignment data:", assignmentData);
    if (isSubmitting) {
      setIsSubmitting(true);
    } else {
      setSaving(true);
    }
    const student_code = editorRef?.current?.getValue()
      ? editorRef?.current?.getValue()
      : assignmentData?.code_template;
    const data = await saveAssignment(
      student_code,
      student_id,
      id,
      submit,
      new Date().toISOString() // Use current date and time for submission
    );
    if (data) {
      if (submit) {
        setIsSubmitting(false);
      } else {
        setSaving(false);
      }
      if (submit) {
        console.log("Assignment data submitted successfully:", data);

        addToast({
          title: "Assignment Submitted",
          description: "Your assignment has been submitted successfully.",
          status: "success",
          color: "success",
          variant: "bordered",
          duration: 3000,
        });
      } else {
        console.log("Assignment data saved successfully:", data);

        addToast({
          title: "Assignment Saved",
          description: "Your assignment progress has been saved.",
          status: "success",
          color: "success",
          variant: "bordered",
          duration: 3000,
        });
      }
    } else {
      if (submit) {
        setIsSubmitting(false);
      } else {
        setSaving(false);
      }
      if (submit) {
        console.error("Failed to submit assignment data.");
        addToast({
          title: "Submission Failed",
          description: "There was an error submitting your assignment.",
          status: "error",
          duration: 3000,
          color: "danger",
          variant: "bordered",
        });
      } else {
        console.error("Failed to save assignment data.");
        addToast({
          title: "Save Failed",
          description: "There was an error saving your assignment progress.",
          status: "error",
          duration: 3000,
          color: "danger",
          variant: "bordered",
        });
      }
      setSaving(false);
    }
    if (isSubmit) {
      onClose();
    }
    setSaving(false);
  };

  React.useEffect(() => {
    fetchDataForAssignment();
  }, [fetchDataForAssignment, id]);

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
  const handleResetCode = () => {
    if (initialCode) {
      editorRef.current?.setValue(initialCode);
    } else {
      addToast({
        title: "No initial code available",
        description:
          "There is no initial code to reset to. This may be an error",
        duration: 3000,
        color: "warning",
        variant: "flat",
      });
    }
  };
  const [output, setOutput] = useState(null);

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

  // // track user refreshing or going back.
  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (editorRef.current?.getValue() != assignmentData?.code_template) {
        const updatedData = {
          ...assignmentData,
          code_template: editorRef.current?.getValue(),
        };
        console.log("Saving assignment data to session storage:", updatedData);

        sessionStorage.setItem(`assignment-${id}`, JSON.stringify(updatedData));

        event.preventDefault();
        // Modern browsers show a generic message and ignore the custom one.
        event.returnValue = "hello";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id, assignmentData, editorRef]);

  const lowlight = createLowlight(all); // You can also use `common` or individual
  lowlight.register("javascript", js);
  const extensions = [
    StarterKit.configure({
      bulletList: false,
      codeBlock: false,
      heading: false,
    }),
    Placeholder.configure({
      placeholder: "Enter assignment guidelines",
      showOnlyCurrent: true,
      HTMLAttributes: {
        class: "text-default-400 bg-red-500 italic",
      },
    }),

    // Inline formatting
    Underline,
    Superscript,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline cursor-pointer",
      },
    }),

    // Images (base64 allowed)
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: "rounded-md max-w-full",
      },
    }),

    // Bullet list (we disabled it above, so re‐enable with custom styles)
    BulletList.configure({
      HTMLAttributes: {
        class: "list-disc pl-6",
      },
    }),
    ListItem.configure({
      HTMLAttributes: {
        class: "my-2 ",
      },
    }),

    // Code block with syntax highlighting
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: "javascript",
      languageClassPrefix: "language-",
      HTMLAttributes: {
        class:
          "bg-gray-900 rounded-md p-4 my-2 font-mono text-sm overflow-x-auto",
      },
    }),

    Heading.configure({
      levels: [1, 2],
      HTMLAttributes: {
        class: "prose prose-slate dark:prose-invert my-4",
      },
    }),
    TextStyle,
    Color.configure({
      types: ["textStyle"],
    }),
  ];
  const convertJsonToHtml = (jsonContent) => {
    if (!jsonContent) {
      return "";
    }

    // Use TipTap's utility to generate an HTML string from the JSON
    return generateHTML(jsonContent, extensions);
  };
  const descriptionHtml = convertJsonToHtml(assignmentData?.description);

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <span className="text-red-500 font-bold">Assignment is past due.</span>
      );
    } else {
      const isUrgent =
        days === 0 && hours === 0 && minutes < 5
          ? "text-red-500 font-bold animate-pulse" // Urgent state styles
          : ""; // Normal state styles

      const pad = (num) => num.toString().padStart(2, "0");
      return (
        <>
          {" "}
          <span className={isUrgent}>
            {days > 0 && `${days}d `}
            {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
          </span>
        </>
      );
    }
  };

  return (
    <form>
      <div className="h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] p-4 flex gap-2">
        {/* Left Panel - Problem Description */}
        <Card
          className="backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden bg-zinc-800/40"
          style={{ width: `${leftWidth}%` }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner color="secondary" />
            </div>
          ) : (
            // FIX #1: This wrapper div must become a flex container that fills the card.
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
                  <Tab key={"Description"} title={"Description"} />
                  <Tab key={"results"} title={"Results & Submissions"} />
                </Tabs>
              </CardHeader>

              {/* Problem Content */}
              {activeTab === "Description" && (
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="space-y-8">
                    {/* Title and Difficulty */}
                    <div className="space-y-4">
                      <h1 className="text-3xl font-bold text-white">
                        {assignmentData?.title || "Assignment Title"}
                      </h1>
                      <div className="flex items-center gap-3"></div>
                    </div>

                    {/* The content that will overflow and cause scrolling */}
                    <div className="space-y-4">
                      <div
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "results" && (
                <div className="w-full h-full flex justify-center items-center p-8 custom-scrollbar">
                  <div className="space-y-4 text-center">
                    <Icon
                      icon="lucide:bubbles"
                      className="mx-auto text-6xl text-foreground-400 mb-2"
                    />
                    <p className="text-gray-400">
                      Relaxxx.... No grades or results available yet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
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
          className="backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden right-panel bg-zinc-800/50"
          style={{ width: `${100 - leftWidth - 1}%` }}
        >
          {/* Code Editor Section */}
          <div style={{ height: `${topHeight}%` }} className="flex flex-col">
            {/* Code Editor Header */}
            <CardHeader className="flex items-center justify-between  py-2 px-6 border-b border-white/10 bg-black/20 rounded-t-2xl h-14">
              <Select
                defaultSelectedKeys={[`${assignmentData?.language || "java"}`]}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-800/60 text-white w-36 rounded-lg  "
                size="sm"
                isDisabled
              >
                <SelectItem key={"python"}>🐍 Python</SelectItem>
                <SelectItem key={"java"}>☕ Java</SelectItem>
              </Select>
              <div className="text-sm text-gray-400 font-semibold bg-gray-800/40 px-4 py-2 rounded-lg border border-gray-700/30">
                <span>⏰</span>
                {timeUp ? (
                  <span className="text-red-500 font-bold">
                    Assignment is past due
                  </span>
                ) : (
                  <Countdown
                    date={assignmentData?.due_at}
                    renderer={countdownRenderer}
                    onComplete={() => {
                      saveAssignmentData(true);
                      setTimeUp(true);
                    }}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Tooltip content="Reset Code" color="danger">
                  <Button
                    onPress={handleResetCode}
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : (
              <div className="flex-1 bg-black/30 pt-2">
                <CodeEditor
                  language={selectedLanguage || "java"}
                  editorRef={editorRef}
                  role="student"
                  // TODO : make this dynamic
                  disableMenu={true}
                  starterCode={assignmentData?.code_template || ""}
                  initialLockedLines={new Set([])}
                  isDisabled={timeUp}
                />
              </div>
            )}
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
                color="secondary"
                variant="underlined"
                className="font-medium"
              >
                {[
                  {
                    key: "console",
                    id: "console",
                    label: "Console",
                    icon: "💻",
                  },
                ].map((tab) => (
                  <Tab
                    key="console"
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

              <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Submit Assignment
                      </ModalHeader>
                      <ModalBody>
                        <Card className="border-spacing-3 border-large border-yellow-400 p-5 bg-zinc-850">
                          <p className="text-yellow-500 ">
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
};
