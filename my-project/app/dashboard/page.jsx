"use client";
import { insertUserIfNew } from "./api";
import { getClasses } from "./api";
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  useDisclosure,
  Avatar,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Sidebar } from "../components/sidebar";
import { supabase } from "../supabase-client";
import { useEffect, useState } from "react";
// Add page imports
import { Overview } from "./pages/overview";
import { Assignments } from "./pages/assignments";
import { Gradebook } from "./pages/gradebook";
import { Classroom } from "./pages/classroom";

export default function Dashboard() {
  const [userType, setUserType] = React.useState("teacher"); // "teacher" or "student"

  // update user data if new user
  const [session, setSession] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // for changes to the classes table.
  useEffect(() => {
    if (!session?.user?.id) return;

    // --- 1. Initial Data Fetch ---
    // This gets the data when the component first loads.
    const fetchInitialClasses = async () => {
      try {
        const initialClasses = await getClasses({
          teacher_id: session.user.id,
        });
        setClasses(initialClasses || []);
        console.log("Initial classes:", initialClasses);
      } catch (error) {
        console.error("Error fetching initial classes:", error);
      }
    };

    fetchInitialClasses();

    // --- 2. Set up the Realtime Subscription ---
    const channel = supabase
      .channel("public:classes") // A unique channel name for this table
      .on(
        "postgres_changes", // Listen to database changes
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "classes",
          // Filter to only get changes for the current teacher's classes
          filter: `teacher_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log("Change received!", payload);

          if (payload.eventType === "INSERT") {
            setClasses((currentClasses) => [...currentClasses, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setClasses((currentClasses) =>
              currentClasses.map((c) =>
                c.id === payload.new.id ? payload.new : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            // Remove the deleted class from our state
            setClasses((currentClasses) =>
              currentClasses.filter((c) => c.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // --- 3. Cleanup Function ---
    // This is critical. When the component unmounts, we need to remove the subscription.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Add active page state
  const [activePage, setActivePage] = React.useState("overview");
  useEffect(() => {
    insertUserIfNew("teacher");
  }, []);
  // For mobile view
  const isMobile = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      onOpen();
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Render the active page component
  const renderActivePage = () => {
    if (userType === "teacher") {
      switch (activePage) {
        case "overview":
          return <Overview />;
        case "assignments":
          return <Assignments session={session} classes={classes} />;
        case "gradebook":
          return <Gradebook />;
        case "classroom":
          return <Classroom session={session} classes={classes} />;
        default:
          return <Overview />;
      }
    } else {
      switch (activePage) {
        case "overview":
          return <StudentOverview />;
        case "assignments":
          return <StudentAssignments />;
        case "grades":
          return <StudentGrades />;
        case "courses":
          return <StudentCourses />;
        default:
          return <StudentOverview />;
      }
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    console.log("Changing page to:", page);
    setActivePage(page);
  };

  return isLoading ? (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]">
      <Spinner color="success" />
    </div>
  ) : (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className={`h-full transition-all duration-300  ${
            isSidebarCollapsed ? "w-16" : "w-64"
          } border-r border-divider bg-zinc-900/50`}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            activePage={activePage}
            setActivePage={handlePageChange}
            session={session}
          />
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="border-b border-divider ">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-content3 p-1">
                        <Icon
                          icon="lucide:book-open"
                          className="text-foreground"
                        />
                      </div>
                      <span className="font-semibold"> Code Sprout</span>
                    </div>
                    <Button isIconOnly variant="light" onPress={onClose}>
                      <Icon icon="lucide:x" />
                    </Button>
                  </div>
                </DrawerHeader>
                <DrawerBody className="p-0">
                  <Sidebar
                    isCollapsed={false}
                    activePage={activePage}
                    setActivePage={(page) => {
                      handlePageChange(page);
                      onClose();
                    }}
                  />
                </DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
      )}

      {/* Main Content */}

      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="flex h-12 items-center  border-b  bg-zinc-900/50 justify-between  border-divider px-1">
          <div className="flex ">
            <Button
              isIconOnly
              variant="light"
              onPress={toggleSidebar}
              className="mr-2"
            >
              <Icon
                icon={
                  isSidebarCollapsed ? "lucide:menu" : "lucide:panel-left-close"
                }
                className="text-lg"
              />
            </Button>
            <div className="flex items-center gap-2">
              <Icon
                icon={
                  activePage === "overview"
                    ? "lucide:layout-dashboard"
                    : activePage === "assignments"
                    ? "lucide:file-text"
                    : activePage === "gradebook"
                    ? "lucide:bar-chart-2"
                    : "lucide:users"
                }
                className="text-lg"
              />
              <h1 className="text-lg font-medium capitalize">{activePage}</h1>
              <div></div>
            </div>
          </div>
          <Avatar
            src="https://img.heroui.chat/image/avatar?w=40&h=40&u=teacher1"
            className="h-8 w-8"
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">{renderActivePage()}</main>
      </div>
    </div>
  );
}
