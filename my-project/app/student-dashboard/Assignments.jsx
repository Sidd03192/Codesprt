import React from "react";
import { Card, CardBody, CardHeader, Button, Input, Tabs, Tab, Chip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export const StudentAssignments = () => {
  const [selected, setSelected] = React.useState("upcoming");
  const [searchValue, setSearchValue] = React.useState("");
  const assignments = [
    { 
      id: 1, 
      title: "Physics Quiz Chapter 5", 
      course: "Science 202", 
      dueDate: "Today, 3:00 PM", 
      status: "upcoming", 
      progress: 0,
      priority: "high"
    },
    { 
      id: 2, 
      title: "Essay Draft", 
      course: "English 303", 
      dueDate: "Tomorrow, 11:59 PM", 
      status: "upcoming", 
      progress: 75,
      priority: "medium"
    },
    { 
      id: 3, 
      title: "Problem Set 5", 
      course: "Mathematics 101", 
      dueDate: "Sep 28, 2023", 
      status: "upcoming", 
      progress: 30,
      priority: "medium"
    },
    { 
      id: 4, 
      title: "History Report", 
      course: "History 101", 
      dueDate: "Oct 1, 2023", 
      status: "upcoming", 
      progress: 10,
      priority: "low"
    },
    { 
      id: 5, 
      title: "Art Project Sketch", 
      course: "Art & Design", 
      dueDate: "Oct 5, 2023", 
      status: "upcoming", 
      progress: 50,
      priority: "medium"
    },
    { 
      id: 6, 
      title: "Lab Report: Chemical Reactions", 
      course: "Science 202", 
      dueDate: "Sep 15, 2023", 
      status: "completed", 
      grade: "A-",
      priority: "medium"
    },
    { 
      id: 7, 
      title: "Literary Analysis", 
      course: "English 303", 
      dueDate: "Sep 10, 2023", 
      status: "completed", 
      grade: "B+",
      priority: "medium"
    },
    { 
      id: 8, 
      title: "Algebra Quiz", 
      course: "Mathematics 101", 
      dueDate: "Sep 5, 2023", 
      status: "completed", 
      grade: "A",
      priority: "high"
    },
    { 
      id: 9, 
      title: "Historical Timeline", 
      course: "History 101", 
      dueDate: "Sep 3, 2023", 
      status: "completed", 
      grade: "B",
      priority: "medium"
    },
    { 
      id: 10, 
      title: "Color Theory Exercise", 
      course: "Art & Design", 
      dueDate: "Aug 28, 2023", 
      status: "completed", 
      grade: "A",
      priority: "low"
    }
  ];

  const filteredAssignments = assignments.filter(assignment => {
    if (selected === "upcoming" && assignment.status !== "upcoming") return false;
    if (selected === "completed" && assignment.status !== "completed") return false;
    if (searchValue && !assignment.title.toLowerCase().includes(searchValue.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return "success";
    if (grade?.startsWith('B')) return "primary";
    if (grade?.startsWith('C')) return "warning";
    return "danger";
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
            <Button color="primary" variant="flat">
              <Icon icon="lucide:filter" className="mr-1" />
              Filter
            </Button>
            <Button color="primary">
              <Icon icon="lucide:calendar" className="mr-1" />
              Calendar View
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
            <Tabs 
              selectedKey={selected} 
              onSelectionChange={setSelected}
              aria-label="Assignment status"
              classNames={{
                base: "w-full sm:w-auto",
                tabList: "gap-2"
              }}
            >
              <Tab key="upcoming" title="Upcoming" />
              <Tab key="completed" title="Completed" />
            </Tabs>
          </div>

          <div className="space-y-4">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="border border-divider">
                  <CardBody>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <Chip 
                            size="sm" 
                            color={getPriorityColor(assignment.priority)}
                            variant="flat"
                          >
                            {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
                          </Chip>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-foreground-500">
                          <span>{assignment.course}</span>
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        
                        {assignment.status === "upcoming" && (
                          <div className="mt-3 flex items-center gap-3">
                            <Progress 
                              value={assignment.progress} 
                              className="flex-1 h-2" 
                              color={assignment.progress > 75 ? "success" : "primary"}
                            />
                            <span className="text-xs text-foreground-500">{assignment.progress}% complete</span>
                          </div>
                        )}
                        
                        {assignment.status === "completed" && (
                          <div className="mt-3 flex items-center gap-2">
                            <Icon icon="lucide:check-circle" className="text-success" />
                            <span className="text-sm">Completed</span>
                            <span className="ml-2 text-sm">Grade: </span>
                            <Chip 
                              size="sm" 
                              color={getGradeColor(assignment.grade)}
                              variant="flat"
                            >
                              {assignment.grade}
                            </Chip>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button size="sm" variant="flat">
                          <Icon icon="lucide:eye" className="mr-1" />
                          View
                        </Button>
                        {assignment.status === "upcoming" && (
                          <Link href = {`/assignments/${assignment.id}`}>
                          <Button size="sm" color="primary">
                            <Icon icon="lucide:edit-3" className="mr-1" />
                            Work on it
                          </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Icon icon="lucide:file-check" className="mx-auto text-4xl text-foreground-400 mb-2" />
                <p className="text-foreground-500">No assignments found</p>
                <p className="text-sm text-foreground-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};