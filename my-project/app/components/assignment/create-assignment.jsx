// ... existing imports ...
import { supabase } from "../../supabase-client";

import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  ScrollShadow,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Textarea,
  DatePicker,
  Form,
  Tooltip,
} from "@heroui/react";
import React from "react";
import {
  Code,
  WandSparkles,
  LassoSelect,
  Upload,
  ArrowUpFromLine,
  FlaskConical,
  FileSliders,
  MonitorCog,
} from "lucide-react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { RichTextEditor } from "./RichText/rich-description";
import { useRef } from "react";
import { executeCode } from "../editor/api";
import CodeEditor from "../editor/code-editor";
import { Testcase } from "./testcases";

export default function CreateAssignmentPage() {
  // Placeholder for current user ID - replace with actual implementation
  const getCurrentUserId = () => {
    // For now, returning a hardcoded UUID.
    // Replace this with actual logic to get the logged-in user's ID.
    return "123e4567-e89b-12d3-a456-426614174000"; // Example UUID
  };

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    dueDate: null,
    startDate: null,
    classId: "",
    selectedStudentIds: [],
    codeTemplate:
      "// Write your code template here\nfunction example() {\n  // This line can be locked\n  console.log('Hello world');\n}\n",
    testCases: [],
    allowPartialSubmission: false,
    allowLateSubmission: false,
  });

  const [selectedLanguage, setSelectedLanguage] = React.useState("Java");
  const editorRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For submission loading state

  const [allowAutocomplete, setAllowAutocomplete] = React.useState(true);
  // Mock class data
  const [classes] = React.useState([
    {
      id: "cs101",
      name: "CS101: Introduction to Programming",
      students: [
        {
          id: "s1",
          name: "John Doe",
          email: "john@example.com",
          selected: false,
        },
        {
          id: "s2",
          name: "Jane Smith",
          email: "jane@example.com",
          selected: false,
        },
        {
          id: "s3",
          name: "Bob Johnson",
          email: "bob@example.com",
          selected: false,
        },
        {
          id: "s4",
          name: "Alice Brown",
          email: "alice@example.com",
          selected: false,
        },
      ],
    },
    {
      id: "cs202",
      name: "CS202: Data Structures",
      students: [
        {
          id: "s5",
          name: "Mike Wilson",
          email: "mike@example.com",
          selected: false,
        },
        {
          id: "s6",
          name: "Sarah Lee",
          email: "sarah@example.com",
          selected: false,
        },
        {
          id: "s7",
          name: "Tom Davis",
          email: "tom@example.com",
          selected: false,
        },
      ],
    },
  ]);

  const selectedClass = classes.find((c) => c.id === formData.classId);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // Add click handler for line locking
    editor.onMouseDown((e) => {
      // Check if click is in the line number area (gutter)
      if (e.target.type === 2) {
        // Monaco editor gutter area type
        const lineNumber = e.target.position.lineNumber;
        handleToggleLockLine(lineNumber);
      }
    });
  };

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleClassChange = (classId) => {
    setFormData((prev) => ({
      ...prev,
      classId,
      selectedStudentIds: [], // Reset selected students when class changes
    }));
  };

  const handleToggleStudent = (studentId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedStudentIds.includes(studentId);
      return {
        ...prev,
        selectedStudentIds: isSelected
          ? prev.selectedStudentIds.filter((id) => id !== studentId)
          : [...prev.selectedStudentIds, studentId],
      };
    });
  };

  const handleSelectAllStudents = () => {
    if (!selectedClass) return;

    const allStudentIds = selectedClass.students.map((s) => s.id);
    const allSelected =
      selectedClass.students.length === formData.selectedStudentIds.length;

    setFormData((prev) => ({
      ...prev,
      selectedStudentIds: allSelected ? [] : allStudentIds,
    }));
  };

  const handleToggleLockLine = (lineNumber) => {
    // This function would be implemented to mark lines as locked
    // For demonstration purposes, we'll just log the action
    console.log(`Toggled lock on line ${lineNumber}`);
  };

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    const code = editorRef.current?.getValue?.();
    if (!code || !selectedLanguage) {
      setOutput("Please select a language and write some code.");
      return;
    }

    try {
      setIsRunning(true);
      const result = await executeCode(selectedLanguage, code);
      const runResult = result.run || {};
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      handleFormChange("codeTemplate", content);
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading
    console.log("Form submitted:", formData);

    const code = editorRef.current.getValue();

    const assignmentData = {
      class_id: formData.classId,
      teacher_id: getCurrentUserId(),
      title: formData.title,
      description: formData.description, // Assuming this holds the text content from RichTextEditor
      language: selectedLanguage,
      code_template: code,
      locked_lines: [], // To be implemented
      hints: "", // To be implemented
      open_at: formData.startDate,
      due_at: formData.dueDate,
      status: "published", // Or 'draft' based on some condition
    };

    console.log("Submitting assignmentData:", assignmentData);

    try {
      const { data: assignmentResult, error: assignmentError } =
        await supabase
          .from("assignments")
          .insert([assignmentData])
          .select();

      if (assignmentError) {
        console.error("Error inserting assignment:", assignmentError);
        alert(`Error creating assignment: ${assignmentError.message}`);
        setIsSubmitting(false); // Stop loading
        return;
      }

      console.log("Assignment created successfully:", assignmentResult);

      if (assignmentResult && assignmentResult.length > 0) {
        const newAssignmentId = assignmentResult[0].id;

        if (formData.selectedStudentIds && formData.selectedStudentIds.length > 0) {
          const assignmentStudentData = formData.selectedStudentIds.map(
            (studentId) => ({
              assignment_id: newAssignmentId,
              student_id: studentId,
            })
          );

          console.log("Submitting assignmentStudentData:", assignmentStudentData);

          const {
            data: studentAssignmentResult,
            error: studentAssignmentError,
          } = await supabase
            .from("assignment_students")
            .insert(assignmentStudentData);

          if (studentAssignmentError) {
            console.error(
              "Error inserting student assignments:",
              studentAssignmentError
            );
            alert(
              `Error assigning to students: ${studentAssignmentError.message}`
            );
            // Note: Here, the assignment is created, but student association failed.
            // You might want to inform the user or handle this case specifically.
            setIsSubmitting(false); // Stop loading
            return;
          }
          console.log(
            "Student assignments created successfully:",
            studentAssignmentResult
          );
        } else {
          console.log("No students selected for this assignment.");
        }
        alert("Assignment created successfully!");
      } else {
        console.error("Assignment creation returned no result or empty result array.");
        alert("Error creating assignment: No result returned.");
      }
    } catch (error) {
      console.error("An unexpected error occurred during submission:", error);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Stop loading in all cases
    }
  };

  const handlePreview = () => {
    console.log("Preview assignment:", formData);
    // Implementation for preview functionality
  };

  // useEffect for testing handleSubmit with Supabase
  React.useEffect(() => {
    console.log("Test: useEffect triggered for handleSubmit simulation.");

    const mockEditorRef = {
      current: {
        getValue: () => "// Simulated code from editor\nconsole.log('Hello test!');",
      },
    };

    const testFormData = {
      title: "Test Assignment from Subtask useEffect",
      description: "This is a test description from useEffect.",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      startDate: new Date().toISOString(),
      classId: "cs101", // Valid based on existing mock data
      selectedStudentIds: ["s1", "s2"], // Valid based on existing mock data
      // codeTemplate is intentionally omitted here as handleSubmit gets it from editorRef
      testCases: [{ input: "1,2", output: "3", hidden: false, points: 10 }],
      allowPartialSubmission: true,
      allowLateSubmission: false,
    };

    const testSelectedLanguage = "javascript";

    // Simulate the event object
    const mockEvent = { preventDefault: () => console.log("Test: event.preventDefault called") };

    // Update component state for the test
    // Note: In a real test environment, you'd mock these setters or use a testing library.
    // For this subtask, direct state update is acceptable.
    setFormData(prevFormData => ({ ...prevFormData, ...testFormData }));
    setSelectedLanguage(testSelectedLanguage);

    // Call handleSubmit after a short delay to simulate state updates being processed
    const testTimeoutId = setTimeout(async () => {
      console.log("Test: Simulating form submission with (current formData state):", formData, "and language:", selectedLanguage);

      // Temporarily assign the mock ref for the duration of the call
      const originalEditorRefCurrent = editorRef.current;
      editorRef.current = mockEditorRef.current;

      try {
        await handleSubmit(mockEvent);
      } catch (e) {
        console.error("Test: Error during simulated handleSubmit:", e);
      } finally {
         // Restore the original ref
        editorRef.current = originalEditorRefCurrent;
        console.log("Test: Simulated form submission finished. editorRef restored.");
      }
    }, 500); // Increased delay slightly to be safer with state updates

    // Cleanup timeout if component unmounts
    return () => {
      clearTimeout(testTimeoutId);
      console.log("Test: useEffect cleanup. Cleared test timeout.");
      // Optional: Restore original editorRef if it was changed and component unmounts mid-test
      // However, the primary restoration is in the finally block of the setTimeout.
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const languages = [
    { key: "python", name: "Python" },
    { key: "java", name: "Java" },
    { key: "cpp", name: "C++" },
    { key: "c", name: "C" },
    { key: "javascript", name: "Javascript" },
  ];

  return (
    <div className=" bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]  text-zinc-100">
      <main className="mx-auto w-full p-4 pb-5">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Assignment Details Card */}
          <Card className="bg-zinc-800/40 p-6 w-full">
            <h2 className="mb-6 text-xl font-semibold">Assignment Details</h2>
            <div className="grid  gap-6 lg:grid-cols-2">
              <Input
                isRequired
                label="Assignment Title"
                placeholder="Enter assignment title"
                value={formData.title}
                variant="bordered"
                onValueChange={(value) => handleFormChange("title", value)}
              />
              <div className="flex  gap-4 ">
                <DatePicker
                  isRequired
                  hideTimeZone
                  showMonthAndYearPickers
                  label="Open Assignment at"
                  variant="bordered"
                  granularity="minute"
                  value={formData.startDate}
                  onValueChange={(value) =>
                    handleFormChange("startDate", value)
                  }
                />
                <DatePicker
                  hideTimeZone
                  isRequired
                  showMonthAndYearPickers
                  label="Close Assignment at"
                  variant="bordered"
                  granularity="minute"
                  value={formData.dueDate}
                  onValueChange={(value) => handleFormChange("dueDate", value)}
                />
              </div>

              <RichTextEditor
                className="md:col-span-2 bg-zinc-200 max-h-[400px]"
                isRequired
              />

              <Select
                isRequired
                className="md:col-span-2 "
                variant="bordered"
                label="Class"
                placeholder="Select a class"
                selectedKeys={formData.classId ? [formData.classId] : []}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                {classes.map((classInfo) => (
                  <SelectItem key={classInfo.id} value={classInfo.id}>
                    {classInfo.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Students */}
            {selectedClass && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-medium font-medium">Students</h3>
                  <Button
                    className="mb-3"
                    color="primary"
                    variant="flat"
                    onPress={handleSelectAllStudents}
                  >
                    {selectedClass.students.length ===
                    formData.selectedStudentIds.length
                      ? "Unselect All"
                      : "Select All"}
                  </Button>
                </div>

                <ScrollShadow className="max-h-[200px]">
                  <div className="space-y-2">
                    {selectedClass.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-medium border border-zinc-700 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            isSelected={formData.selectedStudentIds.includes(
                              student.id
                            )}
                            onValueChange={() =>
                              handleToggleStudent(student.id)
                            }
                          />
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-small text-zinc-400">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>

                <div className="mt-2 text-small text-zinc-400">
                  {formData.selectedStudentIds.length} of{" "}
                  {selectedClass.students.length} students selected
                </div>
              </div>
            )}
          </Card>

          {/* Code Template and Settings Split Screen */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Code Template Section - 60% width */}
            <Card className="col-span-1 xl:col-span-3 bg-zinc-800/40 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Code Template</h2>
                <div className="flex items-center gap-2 w-fit">
                  <Select
                    placeholder="Select a language"
                    className="min-w-[120px]"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    {languages.map((lang) => (
                      <SelectItem key={lang.key} value={lang.key}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Button
                    variant="flat"
                    color="primary"
                    className="min-w-[100px] "
                    onPress={triggerFileUpload}
                  >
                    <Icon icon="lucide:upload" className="" />
                    Upload
                  </Button>

                  <Button
                    variant="flat"
                    color="success"
                    className="min-w-[100px]"
                    onPress={runCode}
                    isDisabled={isRunning}
                  >
                    <Icon icon="lucide:play" />
                    {isRunning ? "Running..." : "Run"}
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".js,.py,.java,.ts,.cs,.cpp,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <p className="mb-4 text-small text-zinc-400">
                Click on the line numbers to lock/unlock lines for students.
              </p>

              <CodeEditor
                language={selectedLanguage}
                editorRef={editorRef}
                enabledAutocomplete={allowAutocomplete}
              />

              {output && (
                <div className="mt-4 p-4 bg-black text-white rounded-lg">
                  <h3 className="text-sm text-zinc-400 mb-2">Output:</h3>
                  <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
              )}
            </Card>

            {/* Assignment Settings & Test Cases - 40% width */}
            <Card className="col-span-1 xl:col-span-2 bg-zinc-800/40 p-6">
              <h2 className="mb-6 text-xl font-semibold">
                Assignment Settings
              </h2>
              <Tabs color="default" variant="bordered">
                {/* Test Cases Section */}
                <Tab
                  key="photos"
                  title={
                    <div className="flex items-center space-x-1">
                      <FlaskConical size={15} />
                      <span>Test Cases</span>
                    </div>
                  }
                >
                  {" "}
                  <Testcase formData={formData} setFormData={setFormData} />
                </Tab>

                <Tab
                  key="items"
                  title={
                    <div className="flex items-center space-x-1">
                      <MonitorCog size={15} />
                      <span>Settings</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Grading Options</h3>
                    <p className="text-zinc-400">
                      Configure how this assignment will be graded.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Checkbox defaultSelected>Auto-grade test cases</Checkbox>
                      <Checkbox>Check for code style</Checkbox>

                      <Tooltip
                        className="max-w-[300px]"
                        content={
                          <div>
                            {"Includes class methods & variable names"}
                            <br />
                            {"(its harmless)"}
                          </div>
                        }
                      >
                        <Checkbox
                          value={allowAutocomplete}
                          onValueChange={(value) => setAllowAutocomplete(value)}
                        >
                          Disable autocomplete
                        </Checkbox>
                      </Tooltip>
                      <Checkbox>Allow copy & paste</Checkbox>
                    </div>

                    <div className="space-y-4 pt-4">
                      <Input
                        classNames={{
                          input: "bg-zinc-700",
                          inputWrapper: "bg-zinc-700",
                        }}
                        label="Points per test case"
                        placeholder="10"
                        type="number"
                        min="0"
                        variant="bordered"
                      />
                      <Input
                        classNames={{
                          input: "bg-zinc-700",
                          inputWrapper: "bg-zinc-700",
                        }}
                        label="Style points"
                        placeholder="5"
                        type="number"
                        min="0"
                        variant="bordered"
                      />
                    </div>
                  </div>
                </Tab>

                {/* Grading Options Section */}
              </Tabs>
            </Card>
          </div>

          {/* Submissions Section */}
          <Card className="bg-zinc-800/40 p-6">
            <h2 className="mb-6 text-xl font-semibold">Submissions</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-medium font-medium">
                    Submission Options
                  </h3>
                  <div className="space-y-2">
                    <Checkbox defaultSelected>
                      Allow multiple submissions
                    </Checkbox>
                    <Checkbox>Show test results immediately</Checkbox>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-medium font-medium">
                    Submission Limits
                  </h3>
                  <div className="space-y-4">
                    <Input
                      classNames={{
                        input: "bg-zinc-700",
                        inputWrapper: "bg-zinc-700",
                      }}
                      label="Maximum Attempts"
                      placeholder="Unlimited"
                      type="number"
                      min="0"
                      variant="bordered"
                    />
                    <div className="mt-6 flex flex-wrap gap-4">
                      <Checkbox
                        isSelected={formData.allowPartialSubmission}
                        onValueChange={(value) =>
                          handleFormChange("allowPartialSubmission", value)
                        }
                      >
                        Allow partial submissions
                      </Checkbox>
                      <Checkbox
                        isSelected={formData.allowLateSubmission}
                        onValueChange={(value) =>
                          handleFormChange("allowLateSubmission", value)
                        }
                      >
                        Allow late submissions
                      </Checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button
              size="lg"
              variant="flat"
              // startContent={<Icon icon="lucide:eye" />}
              onPress={handlePreview}
            >
              See Preview
            </Button>

            <div className="flex gap-2">
              <Button size="lg" variant="flat">
                Export
              </Button>
              <Button color="primary" size="lg" type="submit" isDisabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
