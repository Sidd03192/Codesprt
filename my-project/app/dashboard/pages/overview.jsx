import React from "react";
import { Card, CardBody, CardHeader, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Overview = () => {
  const stats = [
    { 
      title: "Total Students", 
      value: "87", 
      icon: "lucide:users", 
      change: "+12%", 
      positive: true 
    },
    { 
      title: "Assignments", 
      value: "24", 
      icon: "lucide:file-text", 
      change: "+5", 
      positive: true 
    },
    { 
      title: "Average Grade", 
      value: "B+", 
      icon: "lucide:bar-chart-2", 
      change: "+2%", 
      positive: true 
    },
    { 
      title: "Pending Reviews", 
      value: "12", 
      icon: "lucide:clock", 
      change: "-3", 
      positive: false 
    }
  ];

  const upcomingAssignments = [
    { title: "Physics Quiz", dueDate: "Today", class: "Science 202", status: "urgent" },
    { title: "Essay Review", dueDate: "Tomorrow", class: "English 303", status: "normal" },
    { title: "Math Homework", dueDate: "Sep 28", class: "Mathematics 101", status: "normal" },
    { title: "Lab Report", dueDate: "Oct 1", class: "Science 202", status: "upcoming" }
  ];

  const classPerformance = [
    { name: "Mathematics 101", progress: 85 },
    { name: "Science 202", progress: 72 },
    { name: "English 303", progress: 93 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-divider">
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-500">{stat.title}</p>
                <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
                <p className={`text-xs mt-1 ${stat.positive ? 'text-success' : 'text-danger'}`}>
                  {stat.change} {stat.positive ? '↑' : '↓'}
                </p>
              </div>
              <div className="rounded-full p-3 bg-content2">
                <Icon icon={stat.icon} className="text-xl" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Assignments */}
        <Card className="border border-divider">
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Upcoming Assignments</h3>
            <a href="#" className="text-sm text-primary">View All</a>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      assignment.status === 'urgent' ? 'bg-danger' : 
                      assignment.status === 'normal' ? 'bg-primary' : 'bg-default-400'
                    }`}></div>
                    <div>
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-xs text-foreground-500">{assignment.class}</p>
                    </div>
                  </div>
                  <div className="text-sm text-foreground-500">{assignment.dueDate}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Class Performance */}
        <Card className="border border-divider">
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Class Performance</h3>
            <a href="#" className="text-sm text-primary">Details</a>
          </CardHeader>
          <CardBody>
            <div className="space-y-5">
              {classPerformance.map((cls, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm">{cls.progress}%</p>
                  </div>
                  <Progress 
                    value={cls.progress} 
                    color={cls.progress > 90 ? "success" : cls.progress > 70 ? "primary" : "warning"} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-divider">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <a href="#" className="text-sm text-primary">View All</a>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {[
              { icon: "lucide:check-circle", text: "Graded Math Homework for Class 101", time: "2 hours ago", color: "text-success" },
              { icon: "lucide:file-plus", text: "Added new assignment for Science 202", time: "Yesterday", color: "text-primary" },
              { icon: "lucide:message-circle", text: "Replied to Sarah's question about the lab report", time: "Yesterday", color: "text-primary" },
              { icon: "lucide:alert-circle", text: "3 students missed the English quiz", time: "2 days ago", color: "text-danger" }
            ].map((activity, i) => (
              <div key={i} className="flex gap-3">
                <div className={`mt-0.5 ${activity.color}`}>
                  <Icon icon={activity.icon} />
                </div>
                <div>
                  <p>{activity.text}</p>
                  <p className="text-xs text-foreground-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};