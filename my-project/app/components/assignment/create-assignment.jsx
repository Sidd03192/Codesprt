// ... existing imports ...

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
import Editor from "@monaco-editor/react";
import React from "react";
import { Code , WandSparkles, LassoSelect,Upload, ArrowUpFromLine } from "lucide-react";




export default function CreateAssignmentPage() {
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    dueDate: null,
    startDate: null,
    classId: "",
    selectedStudentIds: [],
    codeTemplate: "// Write your code template here\nfunction example() {\n  // This line can be locked\n  console.log('Hello world');\n}\n",
    testCases: [],
    allowPartialSubmission: false,
    allowLateSubmission: false,
  });
  
  const [selectedLanguage, setSelectedLanguage] = React.useState("Java");
  const editorRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [newTestCase, setNewTestCase] = React.useState({
    input: "",
    method: "",
    expectedOutput: "",
    isHidden: false,
  });
  
  // Mock class data
  const [classes] = React.useState([
    {
      id: "cs101",
      name: "CS101: Introduction to Programming",
      students: [
        { id: "s1", name: "John Doe", email: "john@example.com", selected: false },
        { id: "s2", name: "Jane Smith", email: "jane@example.com", selected: false },
        { id: "s3", name: "Bob Johnson", email: "bob@example.com", selected: false },
        { id: "s4", name: "Alice Brown", email: "alice@example.com", selected: false },
      ]
    },
    {
      id: "cs202",
      name: "CS202: Data Structures",
      students: [
        { id: "s5", name: "Mike Wilson", email: "mike@example.com", selected: false },
        { id: "s6", name: "Sarah Lee", email: "sarah@example.com", selected: false },
        { id: "s7", name: "Tom Davis", email: "tom@example.com", selected: false },
      ]
    },
  ]);
  
  const selectedClass = classes.find(c => c.id === formData.classId);
  
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Add click handler for line locking
    editor.onMouseDown((e) => {
      // Check if click is in the line number area (gutter)
      if (e.target.type === 2) { // Monaco editor gutter area type
        const lineNumber = e.target.position.lineNumber;
        handleToggleLockLine(lineNumber);
      }
    });
  };
  
  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleClassChange = (classId) => {
    setFormData(prev => ({
      ...prev,
      classId,
      selectedStudentIds: [] // Reset selected students when class changes
    }));
  };
  
  const handleToggleStudent = (studentId) => {
    setFormData(prev => {
      const isSelected = prev.selectedStudentIds.includes(studentId);
      return {
        ...prev,
        selectedStudentIds: isSelected
          ? prev.selectedStudentIds.filter(id => id !== studentId)
          : [...prev.selectedStudentIds, studentId]
      };
    });
  };
  
  const handleSelectAllStudents = () => {
    if (!selectedClass) return;
    
    const allStudentIds = selectedClass.students.map(s => s.id);
    const allSelected = selectedClass.students.length === formData.selectedStudentIds.length;
    
    setFormData(prev => ({
      ...prev,
      selectedStudentIds: allSelected ? [] : allStudentIds
    }));
  };
  
  const handleToggleLockLine = (lineNumber) => {
    // This function would be implemented to mark lines as locked
    // For demonstration purposes, we'll just log the action
    console.log(`Toggled lock on line ${lineNumber}`);
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
  
  const handleAddTestCase = () => {
    if (newTestCase.input && newTestCase.expectedOutput) {
      const testCase = {
        id: Date.now().toString(),
        ...newTestCase
      };
      
      setFormData(prev => ({
        ...prev,
        testCases: [...prev.testCases, testCase]
      }));
      
      setNewTestCase({
        input: "",
        expectedOutput: "",
        isHidden: false
      });
    }
  };
  
  const handleRemoveTestCase = (id) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter(tc => tc.id !== id)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
  };
  
  const handlePreview = () => {
    console.log("Preview assignment:", formData);
    // Implementation for preview functionality
  };
  
  const languages = [
    
    { key: "python", name: "Python" },
    { key: "java", name: "Java" },
    {key: "C++", name: "C++" },
    { key: "C", name: "C" },
   
  ];

  return (
    <div className=" bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]  text-zinc-100">
      <header className="sticky top-0 z-100 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
        <div className="mx-auto flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Code className="text-2xl" color="white"/>
            <h1 className="text-xl font-semibold">Assignment Creator</h1>
          </div>
        </div>
      </header>
      
      <main className="mx-auto w-full p-4 pb-5">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Assignment Details Card */}
          <Card  className="bg-zinc-800/40 p-6 ">
            <h2 className="mb-6 text-xl font-semibold">Assignment Details</h2>
            <div className="grid  gap-6 md:grid-cols-2">
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
                    hideTimeZone
                    showMonthAndYearPickers
                    label="Open Assignment at"
                    variant="bordered"
                  granularity="minute"
                     value={formData.startDate}
                    onValueChange={(value) => handleFormChange("startDate", value)}
                      />
                <DatePicker
                    hideTimeZone
                    showMonthAndYearPickers
                    label="Close Assignment at"
                    variant="bordered"
                  granularity="minute"
                     value={formData.dueDate}
                    onValueChange={(value) => handleFormChange("dueDate", value)}
                />
                
              </div>
              
                
                <Textarea
                isRequired
                className="md:col-span-2"
                label="Assignment Description"
                minRows={3}
                placeholder="Enter assignment guidelines"
                value={formData.description}
                variant="bordered"
                onValueChange={(value) => handleFormChange("description", value)}
                endContent={
                  <Tooltip
                    content={<p>Generates description using provided code templ</p> }
                    color="secondary"
                  >
                     <Button color="secondary" variant="flat" className="" endContent={<WandSparkles size={40} />} >Generate with AI</Button>

                  </Tooltip>

                }
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
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Checkbox
                isSelected={formData.allowPartialSubmission}
                onValueChange={(value) => handleFormChange("allowPartialSubmission", value)}
              >
                Allow partial submissions
              </Checkbox>
              <Checkbox
                isSelected={formData.allowLateSubmission}
                onValueChange={(value) => handleFormChange("allowLateSubmission", value)}
              >
                Allow late submissions
              </Checkbox>
            </div>
            
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
                    {selectedClass.students.length === formData.selectedStudentIds.length
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
                            isSelected={formData.selectedStudentIds.includes(student.id)}
                            onValueChange={() => handleToggleStudent(student.id)}
                          />
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-small text-zinc-400">{student.email}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
                
                <div className="mt-2 text-small text-zinc-400">
                  {formData.selectedStudentIds.length} of {selectedClass.students.length} students selected
                </div>
              </div>
            )}
          </Card>
          
          {/* Code Template and Settings Split Screen */}
          <div className="grid grid-cols-5 gap-6">
            {/* Code Template Section - 60% width */}
            <Card className="col-span-3 bg-zinc-800/40 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Code Template</h2>
                <div className="flex items-center gap-2">
                  <Select className="min-w-[120px]"      placeholder="Language"      defaultSelectedKeys={["Java"]}
 onChange={(e) => setSelectedLanguage(e.target.value)}>
                    {languages.map((language) => (
                      <SelectItem key={language.key}>{language.name}</SelectItem>
                    ))}
                  </Select>
                  {/* <Dropdown>
                    <DropdownTrigger>
                      <Button variant="flat" size="sm">
                        {languages.find((lang) => lang.key === selectedLanguage)?.name || "Language"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Programming Languages"
                      selectedKeys={[selectedLanguage]}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0]?.toString();
                        if (selected) setSelectedLanguage(selected);
                      }}
                    >
                      {languages.map((lang) => (
                        <DropdownItem key={lang.key}>{lang.name}</DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown> */}
                  
                  
                  <Button
                    variant="flat"
                    color="primary"
                    onPress={triggerFileUpload}
                  >
                    Upload
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
              
              <div className="rounded-medium border bg-zinc-800/40">
                <Editor
                  height="600px"
                  language={selectedLanguage}
                  theme="vs-dark"
                  value={formData.codeTemplate}
                  onChange={(value) => handleFormChange("codeTemplate", value || "")}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: "on",
                  }}
                />
              </div>
            </Card>
            
            {/* Assignment Settings & Test Cases - 40% width */}
            <Card className="col-span-2 bg-zinc-800/40 p-6">
              <h2 className="mb-6 text-xl font-semibold">Assignment Settings</h2>
              
              <ScrollShadow className="h-[600px] pr-2">
                <div className="space-y-8">
                  {/* Test Cases Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Test Cases</h3>
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <Textarea
                          classNames={{
                            input: "bg-zinc-700",
                            inputWrapper: "bg-zinc-700",
                          }}
                          label="Input"
                          placeholder="Test case input"
                          value={newTestCase.input}
                          variant="bordered"
                          onValueChange={(value) => setNewTestCase({...newTestCase, input: value})}
                        />
                        <Textarea
                          classNames={{
                            input: "bg-zinc-700",
                            inputWrapper: "bg-zinc-700",
                          }}
                          label="Expected Output"
                          placeholder="Expected output"
                          value={newTestCase.expectedOutput}
                          variant="bordered"
                          onValueChange={(value) => setNewTestCase({...newTestCase, expectedOutput: value})}
                        />
                        <div className="flex items-center justify-between">
                          <Checkbox
                            isSelected={newTestCase.isHidden}
                            onValueChange={(value) => setNewTestCase({...newTestCase, isHidden: value})}
                          >
                            Hidden from students
                          </Checkbox>
                          <Button color="primary" onPress={handleAddTestCase}>
                            Add Test Case
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Divider className="bg-zinc-700" />
                    
                    <div className="space-y-4">
                      <h3 className="text-medium font-medium">Test Cases ({formData.testCases.length})</h3>
                      {formData.testCases.length === 0 ? (
                        <p className="text-center text-zinc-400">No test cases added yet</p>
                      ) : (
                        <div className="space-y-3">
                          {formData.testCases.map((testCase) => (
                            <div
                              key={testCase.id}
                              className="rounded-medium border border-zinc-700 bg-zinc-800 p-4"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Test Case</span>
                                  {testCase.isHidden && (
                                    <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-tiny text-zinc-300">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                                <Button
                                  isIconOnly
                                  color="danger"
                                  size="sm"
                                  variant="light"
                                  onPress={() => handleRemoveTestCase(testCase.id)}
                                >
                                  {/* <Icon icon="lucide:trash-2" /> */}
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-small text-zinc-400">Input:</div>
                                  <div className="rounded bg-zinc-900 p-2 font-mono text-small">
                                    {testCase.input}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-small text-zinc-400">Expected Output:</div>
                                  <div className="rounded bg-zinc-900 p-2 font-mono text-small">
                                    {testCase.expectedOutput}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Divider className="bg-zinc-700" />
                  
                  {/* Grading Options Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Grading Options</h3>
                    <p className="text-zinc-400">
                      Configure how this assignment will be graded.
                    </p>
                    <div className="space-y-2">
                      <Checkbox defaultSelected>
                        Auto-grade test cases
                      </Checkbox>
                      <Checkbox>
                        Check for code style
                      </Checkbox>
                      <Checkbox>
                        Run plagiarism detection
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
                </div>
              </ScrollShadow>
            </Card>
          </div>
          
          {/* Submissions Section */}
          <Card className="bg-zinc-800/40 p-6">
            <h2 className="mb-6 text-xl font-semibold">Submissions</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-medium font-medium">Submission Options</h3>
                  <div className="space-y-2">
                    <Checkbox defaultSelected>
                      Allow multiple submissions
                    </Checkbox>
                    <Checkbox>
                      Show test results immediately
                    </Checkbox>
                    <Checkbox>
                      Require comments with submission
                    </Checkbox>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-medium font-medium">Submission Limits</h3>
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
                    <Select
                      classNames={{
                        trigger: "bg-zinc-700",
                      }}
                      label="Time Between Submissions"
                      placeholder="Select time limit"
                    >
                      <SelectItem key="none">No limit</SelectItem>
                      <SelectItem key="1min">1 minute</SelectItem>
                      <SelectItem key="5min">5 minutes</SelectItem>
                      <SelectItem key="15min">15 minutes</SelectItem>
                      <SelectItem key="30min">30 minutes</SelectItem>
                      <SelectItem key="1hour">1 hour</SelectItem>
                    </Select>
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
                Save Draft
              </Button>
              <Button color="primary" size="lg" type="submit">
                Create Assignment
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

