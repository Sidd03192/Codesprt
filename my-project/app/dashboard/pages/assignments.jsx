"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Code, CircleX } from "lucide-react";
import CodeEditor from "../../components/editor/code-editor";
import { executeCode } from "../../components/editor/api";
import CreateAssignmentPage from "../../components/assignment/create-assignment";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);

export const Assignments = ({ session, classes }) => {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [viewSubmissionsOpen, setViewSubmissionsOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([
    {
      id: "1",
      student_name: "Alice Johnson",
      code: `def display_message(message):
      """Prints a given message to the console."""
      print("\\n" + message)
  
  def get_choice(options):
      """Presents options to the user and returns their valid choice."""
      while True:
          for i, option in enumerate(options):
              print(f"{i + 1}. {option}")
          try:
              choice = int(input("Enter your choice: "))
              if 1 <= choice <= len(options):
                  return choice
              else:
                  display_message("Invalid choice. Please enter a valid number.")
          except ValueError:
              display_message("Invalid input. Please enter a number.")
  
  def start_game():
      """Initializes and runs the game."""
      display_message("Welcome to the Mystical Forest Adventure!")
      display_message("You find yourself at the edge of a dark forest.")
  
      display_message("Do you dare to enter the forest or turn back?")
      choices_1 = ["Enter the forest", "Turn back"]
      player_choice_1 = get_choice(choices_1)
  
      if player_choice_1 == 1:
          display_message("You bravely step into the forest.")
          display_message("You encounter a fork in the path. Which way do you go?")
          choices_2 = ["Left path", "Right path"]
          player_choice_2 = get_choice(choices_2)
  
          if player_choice_2 == 1:
              display_message("You find a hidden treasure chest! You win!")
          else:
              display_message("You encounter a grumpy troll. Game over!")
      else:
          display_message("You decide to turn back and return to safety. Game over!")
  
  if __name__ == "__main__":
      start_game()`,
    },
    {
      id: "2",
      student_name: "Bob Lee",
      code: `const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1));
  
  console.log(factorial(5));`,
    },
    {
      id: "3",
      student_name: "Carla Smith",
      code: `// This is a placeholder for Carla's awesome code!
  console.log("Carla rules.");`,
    },
  ]);
  const [selectedStudentCode, setSelectedStudentCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorRef = React.useRef(null);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [comments, setComments] = useState({});
  const [activeLine, setActiveLine] = useState(null);
  const [newComment, setNewComment] = useState("");

  const fetchAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("teacher_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error) setAssignments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
    const subscription = supabase
      .channel("public:assignments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "assignments" },
        (payload) => {
          setAssignments((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedAssignmentId) return;
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", selectedAssignmentId);
      if (!error) setSubmissions(data);
    };

    if (viewSubmissionsOpen) {
      fetchSubmissions();
    }
  }, [viewSubmissionsOpen, selectedAssignmentId]);

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const runCode = async () => {
    const code = editorRef.current?.getValue?.();
    try {
      setIsRunning(true);
      const result = await executeCode("python", code);
      const runResult = result.run || {};
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

  const determineStatus = (assignment) => {
    const now = new Date();
    const openAt = new Date(assignment.open_at);
    const dueAt = new Date(assignment.due_at);
    if (now < openAt) return "inactive";
    if (now > dueAt) return "completed";
    return "active";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "primary";
      case "inactive":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const dynamicStatus = determineStatus(assignment);
    if (selected !== "all" && dynamicStatus !== selected) return false;
    if (
      searchValue &&
      !assignment.title?.toLowerCase().includes(searchValue.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:file-text" className="text-lg" />
            <h2 className="text-lg font-medium">Assignments</h2>
          </div>
          <Button
            color="secondary"
            variant="flat"
            onPress={() => setOpen(true)}
            className="flex items-center"
          >
            <Icon icon="lucide:plus" className="mr-1" />
            Create Assignment
          </Button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            closeButton={
              <Button isIconOnly variant="light" color="danger">
                <CircleX color="red" />
              </Button>
            }
            className="max-h-[90vh] max-w-[90vw] overflow-y-auto"
          >
            <ModalContent className="w-full">
              <ModalHeader className="flex border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-3">
                  <Code className="text-2xl" color="white" />
                  <h1 className="text-xl font-semibold">Assignment Creator</h1>
                </div>
              </ModalHeader>
              <CreateAssignmentPage
                session={session}
                classes={classes}
                onClose={() => setOpen(false)}
              />
            </ModalContent>
          </Modal>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <Input
              placeholder="Search assignments..."
              startContent={<Icon icon="lucide:search" />}
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full sm:max-w-xs"
            />
            <Tabs
              selectedKey={selected}
              onSelectionChange={setSelected}
              aria-label="Assignment status"
              classNames={{ base: "w-full sm:w-auto", tabList: "gap-2" }}
            >
              <Tab key="all" title="All" />
              <Tab key="active" title="Active" />
              <Tab key="draft" title="Draft" />
              <Tab key="inactive" title="Inactive" />
              <Tab key="completed" title="Completed" />
            </Tabs>
          </div>

          <div className="space-y-4">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => {
                const status = determineStatus(assignment);
                return (
                  <Card key={assignment.id} className="border border-divider">
                    <CardBody>
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{assignment.title}</h3>
                            <Chip
                              size="sm"
                              color={getStatusColor(status)}
                              variant="flat"
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Chip>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-foreground-500">
                            <span>Class ID: {assignment.class_id}</span>
                            <span>
                              Opens: {formatDateTime(assignment.open_at)}
                            </span>
                            <span>
                              Due: {formatDateTime(assignment.due_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                          <Button size="sm" variant="flat">
                            <Icon icon="lucide:eye" className="mr-1" />
                            View Submissions
                          </Button>
                          <Button size="sm" variant="flat">
                            <Icon icon="lucide:edit" className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => {
                              setAssignmentToDelete(assignment);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Icon icon="lucide:trash-2" />
                          </Button>
                          {status.toLowerCase() !== "draft" && (
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => {
                                setSelectedAssignmentId(assignment.id);
                                setViewSubmissionsOpen(true);
                              }}
                            >
                              <Icon
                                icon="lucide:folder-open"
                                className="mr-1"
                              />
                              View Submissions
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Icon
                  icon="lucide:file-question"
                  className="mx-auto text-4xl text-foreground-400 mb-2"
                />
                <p className="text-foreground-500">No assignments found</p>
                <p className="text-sm text-foreground-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Submissions Modal */}
      <Modal
        isOpen={viewSubmissionsOpen}
        onClose={() => {
          setViewSubmissionsOpen(false);
          setSelectedStudentCode(null);
        }}
        className="max-h-[95vh] max-w-[100vw] overflow-y-auto"
      >
        <ModalContent className="w-full">
          <ModalHeader className="bg-zinc-900 border-b border-zinc-800 text-white font-semibold text-lg">
            Student Submissions
          </ModalHeader>

          <div className="flex gap-4 p-4 h-[100vh]">
            {/* Left: Student Selector */}
            <div className="w-1/6 border-r border-zinc-700 pr-2 overflow-y-auto">
              <h4 className="text-white font-semibold text-sm mb-2">
                Students
              </h4>
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`cursor-pointer p-2 rounded-md mb-1 border ${
                    selectedStudentCode?.id === submission.id
                      ? "bg-zinc-800 border-white"
                      : "border-zinc-700 hover:bg-zinc-800"
                  }`}
                  onClick={() => {
                    setSelectedStudentCode(submission);
                    setComments({});
                    setActiveLine(null);
                  }}
                >
                  {submission.student_name}
                </div>
              ))}
            </div>

            {/* Center: Code + Comments */}
            <div className="w-2/3 px-4 overflow-y-auto">
              {selectedStudentCode ? (
                <>
                  <h3 className="mb-2 font-medium text-white">
                    Code from {selectedStudentCode.student_name}
                  </h3>
                  <div className="bg-black rounded-md border border-zinc-700 p-2 mb-4">
                    <CodeEditor
                      key={selectedStudentCode?.id}
                      language="python"
                      editorRef={editorRef}
                      initialLockedLines={[]}
                      role="viewer"
                      starterCode={
                        selectedStudentCode.code || "# No code submitted"
                      }
                      height="600px"
                      disableMenu={true}
                      onLineClick={(line) => setActiveLine(line)}
                    />
                  </div>
                  {activeLine !== null && (
                    <div className="mt-2 p-2 border-t border-zinc-600">
                      <p className="text-sm text-white mb-1">
                        Add comment for line {activeLine}:
                      </p>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="w-full text-black rounded-md p-2"
                        placeholder="Write your comment here..."
                      />
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="sm"
                          onPress={() => {
                            setComments((prev) => ({
                              ...prev,
                              [activeLine]: [
                                ...(prev[activeLine] || []),
                                newComment,
                              ],
                            }));
                            setNewComment("");
                            setActiveLine(null);
                          }}
                        >
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  )}
                  {Object.keys(comments).length > 0 && (
                    <div className="mt-4 bg-zinc-900 p-4 rounded-lg text-white text-sm">
                      <h3 className="font-medium mb-2">Inline Comments</h3>
                      <ul className="space-y-2">
                        {Object.entries(comments).map(([line, msgs]) => (
                          <li key={line}>
                            <span className="text-zinc-400">Line {line}:</span>
                            <ul className="ml-4 list-disc list-inside">
                              {msgs.map((msg, i) => (
                                <li key={i}>{msg}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    variant="flat"
                    color="success"
                    className="mt-4 min-w-[100px]"
                    onPress={runCode}
                    isDisabled={isRunning}
                  >
                    <Icon icon="lucide:play" />
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                  {output && (
                    <div className="mt-4 p-4 bg-black text-white rounded-lg">
                      <h3 className="text-sm text-zinc-400 mb-2">Output:</h3>
                      <pre className="whitespace-pre-wrap">{output}</pre>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 italic">
                  Select a student to view their submission.
                </p>
              )}
            </div>

            {/* Right: Rubric */}
            <div className="w-1/6 border-l border-zinc-700 pl-2 text-sm text-white overflow-y-auto">
              <h4 className="text-lg font-semibold mb-2">Rubric</h4>
              <ul className="space-y-2">
                <li>✅ Code compiles without errors</li>
                <li>✅ Meets assignment requirements</li>
                <li>✅ Clean and readable formatting</li>
                <li>✅ Proper use of functions/components</li>
                <li>✅ Handles edge cases</li>
                <li>✅ Documentation or comments included</li>
              </ul>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};
