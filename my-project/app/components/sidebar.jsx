// Add missing imports
import React from "react";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/react";

export const Sidebar = ({ isCollapsed, activePage, setActivePage }) => {
  // Navigation items - updated for teacher dashboard
  const overviewItems = [
    { icon: "lucide:layout-dashboard", label: "Overview", id: "overview", isActive: activePage === "overview" },
    { icon: "lucide:file-text", label: "Assignments", id: "assignments", isActive: activePage === "assignments" },
    { icon: "lucide:bar-chart-2", label: "Gradebook", id: "gradebook", isActive: activePage === "gradebook" },
    { icon: "lucide:users", label: "Classroom", id: "classroom", isActive: activePage === "classroom" },
    { icon: "lucide:calendar", label: "Schedule", id: "schedule" },
  ];

  const organizationItems = [
    { icon: "lucide:book", label: "Resources" },
    { icon: "lucide:message-square", label: "Messages", badge: 5 },
    { icon: "lucide:bell", label: "Notifications", badge: 2 },
    { icon: "lucide:settings", label: "Settings" },
  ];

  // Team items - classes instead of teams
  const teamItems = [
    { id: "math", name: "Mathematics 101", shortName: "MA", color: "bg-blue-600" },
    { id: "sci", name: "Science 202", shortName: "SC", color: "bg-purple-600" },
    { id: "eng", name: "English 303", shortName: "EN", color: "bg-green-600" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto py-4 ">
      {/* Logo */}
      <div className={`mb-4 px-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        {isCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-content3">
            <Icon icon="lucide:book-open" className="text-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-content3">
              <Icon icon="lucide:book-open" className="text-foreground" />
            </div>
            <span className="font-bold">Teacher Dashboard</span>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className={`mb-6 px-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        {isCollapsed ? (
          <Avatar
            src="https://img.heroui.chat/image/avatar?w=40&h=40&u=teacher1"
            className="h-8 w-8"
          />
        ) : (
          <div className="flex items-center gap-2">
            <Avatar
              src="https://img.heroui.chat/image/avatar?w=40&h=40&u=teacher1"
              className="h-10 w-10"
            />
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-foreground-500">Science Teacher</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation - Overview */}
      <div className="mb-4 px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Dashboard
          </p>
        )}
        <nav>
          {overviewItems.map((item) => (
            <a
              key={item.id || item.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (item.id && typeof setActivePage === 'function') {
                  setActivePage(item.id);
                }
              }}
              className={`sidebar-item ${item.isActive ? "active" : ""} ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Icon icon={item.icon} className="sidebar-item-icon" />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                  {item.isNew && (
                    <span className="sidebar-item-new">New</span>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>
      </div>

      {/* Navigation - Organization */}
      <div className="mb-4 px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Tools
          </p>
        )}
        <nav>
          {organizationItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`sidebar-item ${item.isActive ? "active" : ""} ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Icon icon={item.icon} className="sidebar-item-icon" />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>
      </div>

      {/* Classes */}
      <div className="mt-auto px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Your Classes
          </p>
        )}
        <nav>
          {teamItems.map((team) => (
            <a
              key={team.id}
              href="#"
              className={`sidebar-item ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className={`team-badge ${team.color}`}>{team.shortName}</div>
              {!isCollapsed && <span>{team.name}</span>}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};