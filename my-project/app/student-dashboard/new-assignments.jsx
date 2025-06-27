import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Progress,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { getAssignmentsData } from "./api";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
export const StudentAssignments = ({
  session,
  assignments,
  isLoading,
  setIsLoading,
  error,
  setError,
  handleRefresh,
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const handleRefreshClick = () => {
    console.log("Refreshing assignments...");
    handleRefresh();
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getDueDate = (dueDate) => {
    const date = new Date(dueDate);
    // re format to make it more readable
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

  const isOverDue = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();
    return date < now;
  };
  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:file-text" className="text-lg" />
            <h2 className="text-lg font-medium">My Assignments</h2>
          </div>
          <div className="flex gap-2">
            <Button color="secondary" variant="flat">
              <Icon icon="lucide:filter" className="mr-1" />
              Filter
            </Button>
            <Button
              color="secondary"
              variant="flat"
              isIconOnly
              onClick={handleRefreshClick}
            >
              <RotateCcw size={16} />
            </Button>
          </div>
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
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center">
                <Spinner />
              </div>
            ) : (
              <div>
                {assignments && assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <Card
                      key={assignment.id}
                      className="border border-divider hover:bg-purple-600/20"
                    >
                      <CardBody>
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {assignment.title}
                              </h3>
                              <Chip size="sm" variant="flat" color="primary">
                                {assignment.class_name}
                              </Chip>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-foreground-500">
                              <span>
                                Due: {getDueDate(assignment.due_date)}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              {assignment.submitted_at ? (
                                <>
                                  <Icon
                                    icon="lucide:check-circle"
                                    className="text-success"
                                  />
                                  <span className="text-sm">Completed</span>
                                  <span className="ml-2 text-sm">Grade: </span>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color="secondary"
                                  >
                                    {assignment.grade || "awaiting grade"}
                                  </Chip>
                                </>
                              ) : (
                                <Chip size="sm" variant="flat" color="warning">
                                  {assignment.status || "Pending"}
                                </Chip>
                              )}
                              {isOverDue(assignment.due_date) &&
                                !assignment.submitted_at && (
                                  <Chip size="sm" variant="flat" color="danger">
                                    Overdue
                                  </Chip>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Button
                              color="secondary"
                              onPress={() => {
                                setSelectedAssignment(assignment.assignment_id);
                                onOpen();
                              }}
                            >
                              <Icon icon="lucide:edit-3" className="mr-1" />
                              Start Assignment
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
                                          Are you sure you want to start this
                                          assignment? Once you start, you cannot
                                          go back.
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
                                      <Link
                                        key={assignment.assignment_id}
                                        href={`/student-dashboard/assignments/${selectedAssignment}`}
                                      >
                                        <Button
                                          color="secondary"
                                          variant="solid"
                                          className="min-w-[120px]"
                                          onPress={() =>
                                            console.log(
                                              "Starting assignment",
                                              assignment.assignment_id
                                            )
                                          }
                                        >
                                          <Icon
                                            icon="lucide:edit-3"
                                            className="mr-1"
                                          />
                                          Start Assignment
                                        </Button>
                                      </Link>
                                    </ModalFooter>
                                  </>
                                )}
                              </ModalContent>
                            </Modal>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icon
                      icon="lucide:file-check"
                      className="mx-auto text-4xl text-foreground-400 mb-2"
                    />
                    <p className="text-foreground-500">No assignments found</p>
                    <p className="text-sm text-foreground-400">
                      Please try again by clickin the refresh button above.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
