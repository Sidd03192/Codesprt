"use client";
import { insertUserIfNew } from "./api";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, Button, useDisclosure, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Sidebar } from "../components/sidebar";
import { supabase } from "../supabase-client";
import { useEffect, useState } from "react";
// Add page imports
import { Overview } from "./pages/overview";
import { Assignments } from "./pages/assignments";
import { Gradebook } from "./pages/gradebook";
import { Classroom } from "./pages/classroom";
import { StudentOverview } from "./pages/student/overview";
import { StudentAssignments } from "./pages/student/assignments";
import { StudentGrades } from "./pages/student/grades";
import { StudentCourses } from "./pages/student/courses";
export default function Dashboard() {
    const [userType, setUserType] = React.useState("teacher"); // "teacher" or "student"

  
  // update user data if new user
const [session, setSession] = useState(null);
    const fetchSession = async () => {
        const currentSession = await supabase.auth.getSession();
        console.log(currentSession);
        setSession(currentSession.data.session);
  };
    // console.log("Current session:", currentSession);
      console.log(session)

    useEffect(() => {
      fetchSession();
      
      const {data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
      })
      if (!session) {
        console.log("No session found, redirecting to login...");
        // window.location.href = "/authentication"; // Redirect to login page if no session
      }
      return () => {
        authListener.subscription.unsubscribe();  // need to unsubscribe to avoid memory leaks
      };
    }, []);


  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // Add active page state
  const [activePage, setActivePage] = React.useState("overview");
  useEffect(() => {
    

    insertUserIfNew();
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
        case "overview": return <Overview />;
        case "assignments": return <Assignments />;
        case "gradebook": return <Gradebook />;
        case "classroom": return <Classroom />;
        default: return <Overview />;
      }
    } else {
      switch (activePage) {
        case "overview": return <StudentOverview />;
        case "assignments": return <StudentAssignments />;
        case "grades": return <StudentGrades />;
        case "courses": return <StudentCourses />;
        default: return <StudentOverview />;
      }
    }
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    console.log("Changing page to:", page);
    setActivePage(page);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className={`h-full transition-all duration-300 ${
            isSidebarCollapsed ? "w-16" : "w-64"
          } border-r border-divider bg-content1`}
        >
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            activePage={activePage}
            setActivePage={handlePageChange}
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
                        <Icon icon="lucide:book-open" className="text-foreground" />
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
        <header className="flex h-12 items-center  border-b  bg-content1 justify-between  border-divider px-1">
          <div className="flex ">
            <Button
            isIconOnly
            variant="light"
            onPress={toggleSidebar}
            className="mr-2"
          >
            <Icon
              icon={isSidebarCollapsed ? "lucide:menu" : "lucide:panel-left-close"}
              className="text-lg"
            />
          </Button>
          <div className="flex items-center gap-2">
            <Icon 
              icon={
                activePage === "overview" ? "lucide:layout-dashboard" :
                activePage === "assignments" ? "lucide:file-text" :
                activePage === "gradebook" ? "lucide:bar-chart-2" :
                "lucide:users"
              } 
              className="text-lg" 
            />
            <h1 className="text-lg font-medium capitalize">{activePage}</h1>
            <div>
              
            </div>
          </div>
          </div>
          <Avatar
            src="https://img.heroui.chat/image/avatar?w=40&h=40&u=teacher1"
            className="h-8 w-8"
          />
          
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
