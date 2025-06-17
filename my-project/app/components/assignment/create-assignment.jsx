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
  form,
  Spinner,
} from "@heroui/react";
import React, { useEffect } from "react";
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
import { getClasses, fetchStudentsForClass } from "../../dashboard/api";
export default function CreateAssignmentPage({ session, classes }) {
  const [formData, setFormData] = React.useState({
    classId: "",
    title: "",
    description: "",

    selectedStudentIds: [],
    codeTemplate:
      "// Write your code template here\nfunction example() {\n  // This line can be locked\n  console.log('Hello world');\n}\n",
    dueDate: null,
    startDate: null,
    testcases: [],
    lockedLines: [],
    hiddenLines: [],
    allowLateSubmission: false,
    autoGrade: false,
    allowAutocomplete: false,
    showResults: false,
    allowCopyPaste: false,
    checkStyle: false,
  });

  const [selectedLanguage, setSelectedLanguage] = React.useState("Java");
  const editorRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For submission loading state
  const [isLoading, setIsLoading] = React.useState(false);
  const [students, setStudents] = useState([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (formData.classId) {
        setIsLoading(true);

        const fetchedStudents = await fetchStudentsForClass(formData.classId);
        console.log("students for class:", fetchedStudents);
        setStudents(fetchedStudents);
      } else {
        setStudents([]);
      }
      setIsLoading(false);
    };

    fetchStudents();
  }, [formData.classId]);

  const selectedClass = classes?.find((c) => c.id === formData.classId) || null;

  const handleClassChange = (classId) => {
    // updates class Id
    setFormData((prev) => ({
      ...prev,
      classId,
      selectedStudentIds: [],
    }));
  };
  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
    const allStudentIds = students.map((s) => s.student_id);
    console.log("all student ids:", allStudentIds);
    const allSelected = students.length === formData.selectedStudentIds.length;

    setFormData((prev) => ({
      ...prev,
      selectedStudentIds: allSelected ? [] : allStudentIds,
    }));
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
      class_id: formData.classId, // need to update thsi
      teacher_id: formData.teacherId,
      title: formData.title,
      description: formData.description, // Assuming this holds the text content from RichTextEditor
      language: selectedLanguage,
      code_template: code,
      hints: "", // To be implemented
      open_at: formData.startDate,
      due_at: formData.dueDate,
      created_at: new Date().toISOString(),
      status: "inactive",
      testcases: formData.testcases,
      locked_lines: formData.lockedLines,
      hidden_lines: formData.hiddenLines,
      allow_late_submission: formData.allowLateSubmission,
      allow_copy_paste: formData.allowCopyPaste,
      allow_auto_complete: formData.allowAutocomplete,
      auto_grade: formData.autoGrade,
      show_results: formData.showResults,
      check_style: formData.checkStyle,
    };

    console.log("Submitting assignmentData to the database:", assignmentData);

    // try {
    //   const { data: assignmentResult, error: assignmentError } = await supabase
    //     .from("assignments")
    //     .insert([assignmentData])
    //     .select();

    //   if (assignmentError) {
    //     console.error("Error inserting assignment:", assignmentError);
    //     alert(`Error creating assignment: ${assignmentError.message}`);
    //     setIsSubmitting(false); // Stop loading
    //     return;
    //   }

    //   console.log("Assignment created successfully:", assignmentResult);

    //   if (assignmentResult && assignmentResult.length > 0) {
    //     const newAssignmentId = assignmentResult[0].id;

    //     if (
    //       formData.selectedStudentIds &&
    //       formData.selectedStudentIds.length > 0
    //     ) {
    //       const assignmentStudentData = formData.selectedStudentIds.map(
    //         (studentId) => ({
    //           assignment_id: newAssignmentId,
    //           student_id: studentId,
    //         })
    //       );

    //       console.log(
    //         "Submitting assignmentStudentData:",
    //         assignmentStudentData
    //       );

    //       const {
    //         data: studentAssignmentResult,
    //         error: studentAssignmentError,
    //       } = await supabase
    //         .from("assignment_students")
    //         .insert(assignmentStudentData);

    //       if (studentAssignmentError) {
    //         console.error(
    //           "Error inserting student assignments:",
    //           studentAssignmentError
    //         );
    //         alert(
    //           `Error assigning to students: ${studentAssignmentError.message}`
    //         );
    //         // Note: Here, the assignment is created, but student association failed.
    //         // You might want to inform the user or handle this case specifically.
    //         setIsSubmitting(false); // Stop loading
    //         return;
    //       }
    //       console.log(
    //         "Student assignments created successfully:",
    //         studentAssignmentResult
    //       );
    //     } else {
    //       console.log("No students selected for this assignment.");
    //     }
    //     alert("Assignment created successfully!");
    //   } else {
    //     console.error(
    //       "Assignment creation returned no result or empty result array."
    //     );
    //     alert("Error creating assignment: No result returned.");
    //   }
    // } catch (error) {
    //   console.error("An unexpected error occurred during submission:", error);
    //   alert(`An unexpected error occurred: ${error.message}`);
    // } finally {
    //   setIsSubmitting(false); // Stop loading in all cases
    // }
  };

  const handlePreview = () => {
    console.log("Preview assignment:", formData);
    // Implementation for preview functionality
  };

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
                {classes &&
                  classes.length > 0 &&
                  classes.map((classInfo) => (
                    <SelectItem key={classInfo.id} value={classInfo.id}>
                      {classInfo.name}
                    </SelectItem>
                  ))}
              </Select>
            </div>

            {/* Students */}

            {students && formData.classId && (
              <div className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-medium font-medium">Students</h3>
                      <Button
                        className="mb-3"
                        color="primary"
                        variant="flat"
                        onPress={handleSelectAllStudents}
                      >
                        {students.length === formData.selectedStudentIds.length
                          ? "Unselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    <ScrollShadow className="max-h-[200px]">
                      <div className="space-y-2">
                        {students && students.length > 0 ? (
                          students.map((student) => (
                            <div
                              key={student.student_id}
                              className="flex items-center justify-between rounded-medium border border-zinc-700 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  isSelected={formData.selectedStudentIds.includes(
                                    student.student_id
                                  )}
                                  onValueChange={() =>
                                    handleToggleStudent(student.student_id)
                                  }
                                />
                                <div>
                                  <div className="font-medium">
                                    {student.full_name}
                                  </div>
                                  <div className="text-small text-zinc-400">
                                    {student.student_email || "No email"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-small text-red-400 w-full flex justify-center">
                            This class has no students. Please add students in
                            the classroom page.
                          </div>
                        )}
                      </div>
                    </ScrollShadow>

                    {classes.length === 0 && (
                      <div className="mt-2 text-small text-zinc-400">
                        {/* Number of selected students of total (total is second) */}
                        {formData.selectedStudentIds.length} of{" "}
                        {students.length || "0"} selected
                      </div>
                    )}
                  </div>
                )}
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
                    isRequired={true}
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
                formData={formData}
                setFormData={setFormData}
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
                      <Checkbox
                        value={formData.autoGrade}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, autoGrade: value }))
                        }
                      >
                        Auto-grade test cases
                      </Checkbox>
                      <Checkbox
                        value={formData.checkStyle}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            checkStyle: value,
                          }))
                        }
                      >
                        Check for code style
                      </Checkbox>

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
                          value={formData.allowAutocomplete}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              allowAutocomplete: value,
                            }))
                          }
                        >
                          Disable autocomplete
                        </Checkbox>
                      </Tooltip>
                      <Checkbox
                        value={formData.allowCopyPaste}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            allowCopyPaste: value,
                          }))
                        }
                      >
                        Allow copy & paste
                      </Checkbox>
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
                        isSelected={formData.allowLateSubmission}
                        onValueChange={(value) =>
                          handleFormChange("allowLateSubmission", value)
                        }
                      >
                        Allow late submissions
                      </Checkbox>
                      <Tooltip content="Displays testcases results to students immediately after submission">
                        <Checkbox
                          value={formData.showResults}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              showResults: value,
                            }))
                          }
                        >
                          Show results immediately
                        </Checkbox>
                      </Tooltip>
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
              <Button
                color="primary"
                size="lg"
                type="submit"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                spinner={<Spinner />}
              >
                {isSubmitting ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
