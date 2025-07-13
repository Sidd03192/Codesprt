import React, { useState, useEffect, useMemo } from "react";
import { Accordion, AccordionItem } from "@heroui/react";
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
      className={`bg-gray-800 rounded-md p-4 text-sm text-gray-200 overflow-x-auto ${className}`}
    >
      <code className={`language-${language}`}>{formatContent(content)}</code>
    </pre>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
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
    <Accordion variant="splitted" className="mb-4">
      {/* <button>
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-300">
            {sectionPoints} / {sectionMaxPoints} pts
          </span>
          <svg
            // className={`h-5 w-5 text-gray-400 transition-transform ${
            //   isSectionOpen ? "rotate-180" : ""
            // }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button> */}
      <AccordionItem
        title={<h3 className="text-lg font-semibold text-gray-200">{title}</h3>}
        className="space-y-2 font-bold p-4 border border-t-0 border-gray-700 rounded-b-lg"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.status === "passed"}
                {item.status === "failed"}
                {item.status === "errored"}
                <span className="font-medium text-gray-200">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {viewMode === "teacher" ? (
                  <input
                    type="number"
                    value={itemOverrides[index] ?? item.pointsAchieved}
                    onChange={(e) => onOverrideChange(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-900 border border-gray-600 rounded-md w-16 p-1 text-center font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-300">
                    {item.pointsAchieved} / {item.maxPoints} pts
                  </span>
                )}
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    openItems[index] ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>
            {openItems[index] && (
              <div className="p-4 bg-gray-900">
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
                      <h4 className="font-semibold text-gray-300 mb-2">
                        Expected Output
                      </h4>
                      <CodeBlock content={item.expected} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-2">
                        Your Output (Got)
                      </h4>
                      <CodeBlock
                        content={item.actual}
                        className={
                          item.status === "failed"
                            ? "border border-red-700"
                            : ""
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
            )}
          </div>
        ))}
      </AccordionItem>
    </Accordion>
  );
};

// --- Main GradingResults Component ---
const GradingResults = ({ gradingOutput, viewMode = "student" }) => {
  const [feedback, setFeedback] = useState(gradingOutput.teacherFeedback || "");
  const [overallOverrideScore, setOverallOverrideScore] = useState(
    gradingOutput.gradeOverride || ""
  );
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

  const finalScore = gradingOutput.gradeOverride ?? calculatedTotalPoints;
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
    <div className="   font-sans  my-8 text-white  mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Grading Results</h2>
          <p className="text-sm text-gray-400 mt-1">
            Graded on: {new Date(gradingOutput.gradedAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            {viewMode === "teacher" && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={overallOverrideScore}
                  onChange={(e) => setOverallOverrideScore(e.target.value)}
                  placeholder="Pts"
                  className="bg-gray-800 border border-gray-600 rounded-md w-20 p-2 text-center text-lg font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleOverrideGrade}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
                >
                  Override
                </button>
              </div>
            )}
            <p className="text-3xl font-bold text-gray-100">
              {finalScore}{" "}
              <span className="text-xl text-gray-400">/ {maxTotalPoints}</span>
            </p>
          </div>
          <div className="mt-2">{getStatusBadge()}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
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
            <h3 className="text-lg font-semibold mb-2 text-gray-200">
              Teacher Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 h-28 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveFeedback}
                  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                >
                  Save Feedback
                </button>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Rubric
                  </label>
                  <button
                    onClick={() => setIsRubricModalOpen(true)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Manage Rubric
                  </button>
                </div>
                <button
                  onClick={() => setIsLogsModalOpen(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  View Raw Logs
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === "student" && gradingOutput.teacherFeedback && (
          <div className="mb-8 bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">
              Feedback from Instructor
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {gradingOutput.teacherFeedback}
            </p>
          </div>
        )}

        {viewMode === "student" && rubricContent && (
          <div className="mb-8 bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">
              Grading Rubric
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">{rubricContent}</p>
          </div>
        )}

        <AccordionSection
          title="Test Cases"
          items={gradingOutput.testResults}
          itemOverrides={testPointOverrides}
          onOverrideChange={(index, value) =>
            setTestPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
        />
        <AccordionSection
          title="Styling"
          items={gradingOutput.stylingResults}
          itemOverrides={stylingPointOverrides}
          onOverrideChange={(index, value) =>
            setStylingPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
        />
        <AccordionSection
          title="Requirements"
          items={gradingOutput.requirementsResults}
          itemOverrides={reqPointOverrides}
          onOverrideChange={(index, value) =>
            setReqPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
        />
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

  const [currentView, setCurrentView] = useState("student");

  return (
    <div className="  ">
      <div className="max-w-4xl mx-auto mb-6">
        {/* <div className="flex justify-center bg-gray-800 rounded-lg p-1 w-fit mx-auto">
          <button
            onClick={() => setCurrentView("student")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === "student"
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Student View
          </button>
          <button
            onClick={() => setCurrentView("teacher")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === "teacher"
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Teacher View
          </button>
        </div> */}
      </div>
      <GradingResults
        gradingOutput={sampleGradingOutput}
        viewMode={currentView}
      />
    </div>
  );
};
