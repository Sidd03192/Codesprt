import React, { useState, useEffect, useMemo, useRef } from "react";
import { Accordion, AccordionItem, Button, Divider, ScrollShadow, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
// --- Helper Components & Icons ---

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-green-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ExclamationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-yellow-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const CodeBlock = ({ content, language = "text", className = "" }) => {
  const formatContent = (value) => {
    if (value === null || value === undefined) return String(value);
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <pre
      className={`bg-zinc-800  rounded-2xl p-4 text-sm  overflow-x-auto ${className}`}
    >
      <code className={`language-javascript `}>{formatContent(content)}</code>
    </pre>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold ">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// --- Reusable Accordion Section ---
const AccordionSection = ({
  title,
  items,
  itemOverrides,
  onOverrideChange,
  viewMode,
  icon
}) => {
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    const initialOpenState = {};
    items.forEach((item, index) => {
      if (item.status === "failed" || item.status === "errored") {
        initialOpenState[index] = true;
      }
    });
    setOpenItems(initialOpenState);
  }, [items]);

  const toggleItem = (index) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const sectionPoints = items.reduce(
    (acc, item, index) =>
      acc + (parseFloat(itemOverrides[index]) || item.pointsAchieved),
    0
  );
  const sectionMaxPoints = items.reduce((acc, item) => acc + item.maxPoints, 0);

  return (
    <Accordion  className="mb-4"       
>
      
      <AccordionItem className="border border-divider rounded-2xl px-3"
      startContent={        <Icon icon= "lucide-list" className="text-xl text-secondary " />
}
        title={
        
        < >
                <h3 className="text-lg font-semibold ">{title}</h3>
        </>}

      >
        {items.map((item, index) => (
          <Accordion
          isCompact
            key={index}
            className="border border-divider  rounded-lg overflow-hidden mb-2"
          >
            <AccordionItem
            
            title={
            <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
                {item.status === "passed" && <Icon icon="lucide-check" color="green" className="text-xl" ></Icon>}
                {item.status === "failed" && <Icon icon="lucide-x" color= "red"  className="text-xl" />}
                {item.status === "errored" && <Icon icon="lucide-triangle-alert" color="yellow"  className="text-xl" /> }
                <span className="font-medium ">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {viewMode === "teacher" ? (
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="number"
                          value={itemOverrides[index] ?? item.pointsAchieved}
                          onChange={(e) =>
                            onOverrideChange(index, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="bg-zinc-700/60 border-[.5px] border-zinc-600 rounded-xl max-w-12 p-1 text-center font-semibold focus:border-default "
                        />
                        <span className="text-gray-400">
                          / {item.maxPoints} pts
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">
                        {item.pointsAchieved} / {item.maxPoints} pts
                      </span>
                    )}
                
              </div> </div>
            }
            
            >
<div className="p-4 ">
                {item.status === "errored" ? (
                  <div>
                    <h4 className="font-semibold text-red-300 mb-2">
                      Error Log
                    </h4>
                    <CodeBlock
                      content={item.message}
                      className="bg-red-900/40 border border-red-800"
                    />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold  mb-2">
                        Expected Output
                      </h4>
                      <CodeBlock className="border border-default-700" content={item.expected} />
                    </div>
                    <div>
                      <h4 className="font-semibold  mb-2">
                        Your Output (Got)
                      </h4>
                      <CodeBlock
                        content={item.actual}
                        className={
                          item.status === "failed"
                            ? "border border-danger"
                            : "border border-success"
                        }
                      />
                    </div>
                    {item.status === "failed" && item.message && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-yellow-300 mb-2">
                          Failure Details
                        </h4>
                        <CodeBlock
                          content={item.message}
                          className="bg-yellow-900/40 border border-yellow-800"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AccordionItem>
              
              
            
          </Accordion>
        ))}
      </AccordionItem>
    </Accordion>
  );
};

const GradingResults = ({ gradingOutput, viewMode = "student" }) => {
  const [feedback, setFeedback] = useState(gradingOutput.teacherFeedback || "");
  
  // --- MODIFICATION START ---
  const [overallOverrideScore, setOverallOverrideScore] = useState(
     gradingOutput.gradeOverride != null ? String(gradingOutput.gradeOverride) : ""
  );
  // --- MODIFICATION END ---
  
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [rubricContent, setRubricContent] = useState(
    gradingOutput.rubric || ""
  );

  const [testPointOverrides, setTestPointOverrides] = useState({});
  const [stylingPointOverrides, setStylingPointOverrides] = useState({});
  const [reqPointOverrides, setReqPointOverrides] = useState({});

  const calculatedTotalPoints = useMemo(() => {
    const sumPoints = (items, overrides) =>
      items.reduce((acc, item, index) => {
        const overriddenValue = parseFloat(overrides[index]);
        return (
          acc + (isNaN(overriddenValue) ? item.pointsAchieved : overriddenValue)
        );
      }, 0);

    const testPoints = sumPoints(gradingOutput.testResults, testPointOverrides);
    const stylingPoints = sumPoints(
      gradingOutput.stylingResults,
      stylingPointOverrides
    );
    const reqPoints = sumPoints(
      gradingOutput.requirementsResults,
      reqPointOverrides
    );

    return testPoints + stylingPoints + reqPoints;
  }, [
    gradingOutput,
    testPointOverrides,
    stylingPointOverrides,
    reqPointOverrides,
  ]);

  const maxTotalPoints = useMemo(() => {
    return [
      ...gradingOutput.testResults,
      ...gradingOutput.stylingResults,
      ...gradingOutput.requirementsResults,
    ].reduce((acc, item) => acc + item.maxPoints, 0);
  }, [gradingOutput]);

  // --- MODIFICATION START ---
  const finalScore =
    overallOverrideScore !== "" && !isNaN(parseFloat(overallOverrideScore))
      ? parseFloat(overallOverrideScore)
      : calculatedTotalPoints;
  // --- MODIFICATION END ---
  
  const scorePercentage =
    maxTotalPoints > 0 ? (finalScore / maxTotalPoints) * 100 : 0;

  const getStatusBadge = () => {
    if (gradingOutput.error) {
      return (
        <span className="inline-block bg-red-800 text-red-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          Error
        </span>
      );
    }
    if (scorePercentage >= 80) {
      return (
        <span className="inline-block bg-green-800 text-green-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          Passed
        </span>
      );
    }
    if (scorePercentage > 0) {
      return (
        <span className="inline-block bg-yellow-800 text-yellow-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          Partial Credit
        </span>
      );
    }
    return (
      <span className="inline-block bg-red-800 text-red-200 text-xs font-semibold px-2.5 py-1 rounded-full">
        Failed
      </span>
    );
  };

  const handleSaveFeedback = () => {
    console.log("Saving feedback:", feedback);
    alert("Feedback saved!");
  };
  const handleOverrideGrade = () => {
    console.log("Overriding grade to:", overallOverrideScore);
    alert(`Grade overridden to ${overallOverrideScore}!`);
  };
  const handleSaveRubric = () => {
    console.log("Saving rubric:", rubricContent);
    alert("Rubric saved!");
    setIsRubricModalOpen(false);
  };
  const handleUploadRubric = () => {
    alert("File upload simulation!");
  };

  return (
    <div className="font-sans  mx-auto">
      {/* Header */}
      <div className="p-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Grading Results</h2>
          <p className="text-sm text-gray-400 mt-1 ml-1">
            Graded on: {new Date(gradingOutput.gradedAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <div className="text-3xl font-bold \">
             {/* --- MODIFICATION START --- */}
              {viewMode === "teacher" ? (
                <div className="flex items-baseline ">
                  <input
                    type="number"
                    value={overallOverrideScore}
                    onChange={(e) => setOverallOverrideScore(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={calculatedTotalPoints.toFixed(0)}
                    className="bg-zinc-700/60 border-[.5px] border-zinc-600 rounded-xl max-w-20 p-1 text-center font-semibold focus:border-default mr-2 "
                  />
                  <span className="text-xl \">
                    / {maxTotalPoints}
                  </span>
                </div>
              ) : (
                <div className="text-3xl font-bold \">
                  {finalScore.toFixed(2)}{" "}
                  <span className="text-xl \">
                    / {maxTotalPoints}
                  </span>
                </div>
              )}
              {/* --- MODIFICATION END --- */}
            </div> 
          </div>
          <div className="mt-2">{getStatusBadge()}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        {/* ... (rest of the component remains the same) ... */}
        {gradingOutput.error && (
          <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-red-300">Compilation Error</h3>
            <CodeBlock
              content={gradingOutput.error}
              className="mt-2 bg-red-900/70"
            />
          </div>
        )}

        {viewMode === "teacher" && (
          <div className="mb-8">
            <div className="flex justify-between items-center"><h3 className="text-lg font-semibold mb-2 ">
              Teacher Controls
            </h3>
              <Button
                    onClick={() => setIsRubricModalOpen(true)}
                    variant="flat"
                    color="secondary"
                    className="max-w-28"
                  >
                    Rubric
                  </Button>
            </div>
            
            <div className="">
              <div className=" ">
                  <label className="block text-md font-medium  mb-1">
                  Feedback
                </label>
                  
                
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback..."
                  variant="bordered"
                  size="lg"
                  
                  className="w-full p-8   rounded-lg p-3 min-h-32 text-xl"
                />
                
              </div>
              
            </div>
            <Divider/>
          </div>
        )}

        {viewMode === "student" && gradingOutput.teacherFeedback && (
          <div className="mb-8 bg-zinc-800/30 border border-divider p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Feedback from Instructor
            </h3>
            <p className="whitespace-pre-wrap">
              {gradingOutput.teacherFeedback}
            </p>
          </div>
        )}

        {viewMode === "student" && rubricContent && (
          <div className="mb-8 bg-gray-zinc/30 border border-divider p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">
              Grading Rubric
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {rubricContent}
            </p>
          </div>
        )}
        {viewMode === "teacher" &&
        <div className="flex justify-between items-center  mb-4">
                  <label className="block text-lg font-medium  mb-1">
                  Testcases
                </label>
                   <Button
                  onClick={() => setIsLogsModalOpen(true)}
                  variant="flat"
                  color="primary"
                >
                  View Raw Logs
                </Button>
                </div>
        }
        
      
        <AccordionSection
          title="Test Cases"
          items={gradingOutput.testResults}
          itemOverrides={testPointOverrides}
          onOverrideChange={(index, value) =>
            setTestPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
          icon="test-tube"
        />
        <AccordionSection
          title="Styling"
          items={gradingOutput.stylingResults}
          itemOverrides={stylingPointOverrides}
          onOverrideChange={(index, value) =>
            setStylingPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
          icon="braces"
        />
        <AccordionSection
          title="Requirements"
          items={gradingOutput.requirementsResults}
          itemOverrides={reqPointOverrides}
          onOverrideChange={(index, value) =>
            setReqPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
          icon="list-check"
        />
        <div className="flex justify-end gap-2">

          <Button
                  onClick={handleSaveFeedback}
                  variant="flat"
                  color="primary"
                >
                  Save & Next
                </Button>
        </div>
        
                
      </div>

      {/* Modals */}
      <Modal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        title="Raw Execution Logs"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">
              Standard Output (stdout)
            </h4>
            <CodeBlock
              content={gradingOutput.rawStdout || "(No standard output)"}
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">
              Standard Error (stderr)
            </h4>
            <CodeBlock
              content={gradingOutput.rawStderr || "(No standard error)"}
              className="bg-yellow-900/40 border border-yellow-800"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Exit Code</h4>
            <p className="text-gray-200">{gradingOutput.exitCode}</p>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
        title="Manage Rubric"
      >
        <div className="space-y-4">
          <textarea
            value={rubricContent}
            onChange={(e) => setRubricContent(e.target.value)}
            placeholder="Enter rubric here (Markdown is supported)..."
            className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 h-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="flex justify-between items-center">
            <button
              onClick={handleUploadRubric}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md"
            >
              Upload File
            </button>
            <button
              onClick={handleSaveRubric}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Save Rubric
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
const SimpleStudentScroller = ({ students }) => {
  const scrollContainerRef = useRef(null);

  // This function scrolls the container left or right
  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  return (


// Assuming 'Icon', 'students', and 'scroll' are defined elsewhere

// --- Corrected Component Layout ---
<>

<div className="flex items-center w-full max-w-4xl my-3 mx-auto">

  {/* Left Arrow Button */}
  <Button isIconOnly onClick={() => scroll(-300)} className="bg-transparent">
    <Icon icon={"lucide-chevron-left"} className="text-xl" />
  </Button>

  {/* Stretchy Middle Section */}
  <div className="flex-1 min-w-0"> {/* This is the key fix */}
    <ScrollShadow
      ref={scrollContainerRef}
      orientation="horizontal"
      
      className="custom-scrollbar" 
    >
      {/* The ref on this div was removed */}
      <div className="flex gap-4 p-2">
        {students.map((student, index) => (
          <Button variant="flat" key={index} className="flex-shrink-0 rounded-full">
            {student}
          </Button>
        ))}
      </div>
    </ScrollShadow>
  </div>

  {/* Right Arrow Button */}
  <Button isIconOnly onClick={() => scroll(300)} className="bg-transparent">
    <Icon icon={"lucide-chevron-right"} className="text-xl" />
  </Button>

 
</div>
<Divider></Divider>
</>
  );
};

export default SimpleStudentScroller;

// --- Example Usage Wrapper ---
export const Results = () => {
  const sampleGradingOutput = {
    totalPointsAchieved: 23,
    gradeOverride: null,
    rawStdout:
      "[INFO] Running tests...\n✅ Test with positive numbers passed.\n❌ Test with zero failed.\n✅ Styling check passed.\n",
    rawStderr: "Warning: Deprecated feature used.",
    exitCode: 0,
    gradedAt: "2025-07-13T04:56:00.000Z",
    error: null,
    testResults: [
      {
        name: "Test with positive numbers",
        status: "passed",
        message: "",
        expected: "5",
        actual: "5",
        pointsAchieved: 8,
        maxPoints: 8,
      },
      {
        name: "Test with zero",
        status: "failed",
        message: "AssertionError: expected: <0> but was: <1>",
        expected: "0",
        actual: "1",
        pointsAchieved: 0,
        maxPoints: 12,
      },
      {
        name: "Test with user object",
        status: "failed",
        message: "AssertionError: property 'age' doesn't match.",
        expected: { name: "Alice", age: 30 },
        actual: { name: "Alice", age: 31 },
        pointsAchieved: 0,
        maxPoints: 10,
      },
      {
        name: "Test with large numbers",
        status: "errored",
        message: "NullPointerException at Solution.java:15",
        expected: "2000000000",
        actual: null,
        pointsAchieved: 0,
        maxPoints: 5,
      },
    ],
    stylingResults: [
      {
        name: "Check for appropriate variable names",
        status: "passed",
        message: "",
        expected: "N/A",
        actual: "N/A",
        pointsAchieved: 5,
        maxPoints: 5,
      },
      {
        name: "Code is correctly indented",
        status: "passed",
        message: "",
        expected: "N/A",
        actual: "N/A",
        pointsAchieved: 5,
        maxPoints: 5,
      },
    ],
    requirementsResults: [
      {
        name: "Function 'calculateTotal' is implemented",
        status: "passed",
        message: "",
        expected: "true",
        actual: "true",
        pointsAchieved: 10,
        maxPoints: 10,
      },
      {
        name: "Handles array input",
        status: "failed",
        message: "Did not return correct sum for array.",
        expected: "15",
        actual: "10",
        pointsAchieved: 0,
        maxPoints: 10,
      },
    ],
    teacherFeedback:
      "Good effort, but be careful with your edge cases around zero. Also, you have a null pointer exception when handling large numbers. Check your object comparison logic as well.",
    rubric:
      "### Grading Rubric\n\n- **Correctness (25 pts):** Based on automated test cases.\n- **Styling (10 pts):** Code is clean and follows style guidelines.\n- **Requirements (20 pts):** All functional requirements are met.",
  };

  const [currentView, setCurrentView] = useState("teacher");
const students = [
    'Emma Johnson', 'Liam Smith', 'Olivia Davis', 'Noah Wilson', 'Ava Brown',
    'William Jones', 'Sophia Garcia', 'James Miller', 'Isabella Rodriguez', 
    'Benjamin Martinez', 'Charlotte Anderson', 'Lucas Taylor', 'Amelia Thomas',
    'Mason Jackson', 'Harper White', 'Ethan Lee', 'Mia Clark', 'Alexander Lewis'
  ];
  return (
    <div className=" ">
        <SimpleStudentScroller students={students}/>
      <GradingResults className="pb-10"
        gradingOutput={sampleGradingOutput}
        viewMode={currentView}
      />
    </div>
  );
};
