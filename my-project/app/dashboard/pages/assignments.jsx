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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Code, CircleX } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
} from "@heroui/modal";
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
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
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
              classNames={{
                base: "w-full sm:w-auto",
                tabList: "gap-2",
              }}
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
                              {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                            </Chip>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-foreground-500">
                            <span>Class ID: {assignment.class_id}</span>
                            <span>Opens: {formatDateTime(assignment.open_at)}</span>
                            <span>Due: {formatDateTime(assignment.due_at)}</span>
                          </div>
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
    </div>
  );
};
