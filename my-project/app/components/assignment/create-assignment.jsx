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
import React from "react";
import { Code , WandSparkles, LassoSelect,Upload, ArrowUpFromLine,FlaskConical ,FileSliders,MonitorCog   } from "lucide-react";
import { Icon } from "@iconify/react";
import { RichTextEditor } from "./RichText/rich-description";
import { useRef } from "react";
import CodeEditor from "../editor/code-editor";

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
  const [allowAutocomplete, setAllowAutocomplete] = React.useState(true);
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
    // update form data with the code. 
    const code = editorRef.current.getValue(); // double check that thsi works
    // Here you would typically send the data to your backend
  };
  
  const handlePreview = () => {
    console.log("Preview assignment:", formData);
    // Implementation for preview functionality
  };
  
  const languages = [
   { key: "python", name: "Python" },
   { key: "java",   name: "Java"   },
   { key: "cpp",    name: "C++"    },
  { key: "c",      name: "C"      },
 ];

  return (
    <div className=" bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]  text-zinc-100">

      
      
      <main className="mx-auto w-full p-4 pb-5">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Assignment Details Card */}
          <Card  className="bg-zinc-800/40 p-6 w-full">
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
                <DatePicker isRequired
                    hideTimeZone
                    showMonthAndYearPickers
                    label="Open Assignment at"
                    variant="bordered"
                  granularity="minute"
                     value={formData.startDate}
                    onValueChange={(value) => handleFormChange("startDate", value)}
                      />
                <DatePicker
                    hideTimeZone isRequired
                    showMonthAndYearPickers
                    label="Close Assignment at"
                    variant="bordered"
                  granularity="minute"
                     value={formData.dueDate}
                    onValueChange={(value) => handleFormChange("dueDate", value)}
                />
                
              </div>
              
                
               
              <RichTextEditor className="md:col-span-2 bg-zinc-200" isRequired />
              
              


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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Code Template Section - 60% width */}
            <Card className="col-span-1 lg:col-span-3 bg-zinc-800/40 p-6">
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
                  />            </Card>
              
            {/* Assignment Settings & Test Cases - 40% width */}
            <Card className="col-span-1 lg:col-span-2 bg-zinc-800/40 p-6">
              <h2 className="mb-6 text-xl font-semibold">Assignment Settings</h2>
                <Tabs
                  color="default"
                  variant="bordered"
              >
                {/* Test Cases Section */}
                <Tab
                  key="photos"
                  title={
                    <div className="flex items-center space-x-1">
                      <FlaskConical size={15} />
                      <span>Test Cases</span>
                      
                    </div>
                  }
                > <div className="space-y-6">
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
                </Tab>
                  
                  <Tab
                  key="items"
                  title={
                    <div className="flex items-center space-x-1">
                      <MonitorCog  size={15}/>
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
                      <Checkbox defaultSelected>
                        Auto-grade test cases
                      </Checkbox>
                      <Checkbox>
                        Check for code style
                      </Checkbox>
                      
                      <Tooltip className="max-w-[300px]" content={<div>
                          {"Includes class methods & variable names"}
                          <br/>
                          {"(its harmless)"}
                        </div>}>
                        <Checkbox value={allowAutocomplete} onValueChange={(value) => setAllowAutocomplete(value)}>
                        Disable autocomplete
                        </Checkbox>
                        
                      </Tooltip>
                      <Checkbox>
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
                  <h3 className="mb-2 text-medium font-medium">Submission Options</h3>
                  <div className="space-y-2">
                    <Checkbox defaultSelected>
                      Allow multiple submissions
                    </Checkbox>
                    <Checkbox>
                      Show test results immediately
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

