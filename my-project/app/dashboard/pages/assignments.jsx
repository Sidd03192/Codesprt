"use client";
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Code, CircleX } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import CreateAssignmentPage from "../../components/assignment/create-assignment";
import AssignmentDropdown from "../../components/dropdown";
import { RichTextEditor } from "../../components/assignment/RichText/rich-description";
export const Assignments = ({ session, classes }) => {
  const [selected, setSelected] = React.useState("all");
  const [searchValue, setSearchValue] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const assignments = [
    {
      id: 1,
      title: "Physics Quiz Chapter 5",
      class: "Science 202",
      dueDate: "Sep 25, 2023",
      status: "active",
      submissions: 18,
      totalStudents: 25,
    },
    {
      id: 2,
      title: "Essay on Modern Literature",
      class: "English 303",
      dueDate: "Sep 28, 2023",
      status: "active",
      submissions: 12,
      totalStudents: 22,
    },
    {
      id: 3,
      title: "Algebra Problem Set",
      class: "Mathematics 101",
      dueDate: "Oct 2, 2023",
      status: "draft",
      submissions: 0,
      totalStudents: 30,
    },
    {
      id: 4,
      title: "Lab Report: Chemical Reactions",
      class: "Science 202",
      dueDate: "Oct 5, 2023",
      status: "active",
      submissions: 5,
      totalStudents: 25,
    },
    {
      id: 5,
      title: "Geometry Quiz",
      class: "Mathematics 101",
      dueDate: "Sep 15, 2023",
      status: "completed",
      submissions: 28,
      totalStudents: 30,
    },
    {
      id: 6,
      title: "Book Report",
      class: "English 303",
      dueDate: "Sep 10, 2023",
      status: "completed",
      submissions: 20,
      totalStudents: 22,
    },
  ];

  const filteredAssignments = assignments.filter((assignment) => {
    if (selected !== "all" && assignment.status !== selected) return false;
    if (
      searchValue &&
      !assignment.title.toLowerCase().includes(searchValue.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "primary";
      case "draft":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

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
              <Button isIconOnly={true} variant="light" color="danger">
                <CircleX color="red" />{" "}
              </Button>
            }
            className="max-h-[90vh] max-w-[90vw] overflow-y-auto"
          >
            <ModalContent className="w-[100%]">
              <ModalHeader className="flex border-zinc-800 bg-zinc-900  ">
                <div className="flex items-center gap-3">
                  <Code className="text-2xl" color="white" />
                  <h1 className="text-xl font-semibold">Assignment Creator</h1>
                </div>
              </ModalHeader>
              <CreateAssignmentPage session={session} classes={classes} />
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
              classNames={{
                base: "w-full sm:w-auto",
                tabList: "gap-2",
              }}
            >
              <Tab key="all" title="All" />
              <Tab key="active" title="Active" />
              <Tab key="draft" title="Drafts" />
              <Tab key="completed" title="Completed" />
            </Tabs>
          </div>

          <div className="space-y-4">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="border border-divider">
                  <CardBody>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <Chip
                            size="sm"
                            color={getStatusColor(assignment.status)}
                            variant="flat"
                          >
                            {assignment.status.charAt(0).toUpperCase() +
                              assignment.status.slice(1)}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-foreground-500">
                          <span>{assignment.class}</span>
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        {assignment.status !== "draft" && (
                          <div className="mt-2 text-sm">
                            <span>
                              Submissions: {assignment.submissions}/
                              {assignment.totalStudents}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button size="sm" variant="flat">
                          <Icon icon="lucide:eye" className="mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="flat">
                          <Icon icon="lucide:edit" className="mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="flat" color="danger">
                          <Icon icon="lucide:trash-2" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
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
    </div>
  );
};
