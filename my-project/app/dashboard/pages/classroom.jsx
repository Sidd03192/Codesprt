import React from "react";
import { Card, CardBody, CardHeader, Tabs, Tab, Avatar, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Classroom = () => {
  const [selected, setSelected] = React.useState("students");
  
  const students = [
    { id: 1, name: "Emma Thompson", email: "emma.t@example.com", grade: "A", attendance: 95, status: "active" },
    { id: 2, name: "James Wilson", email: "james.w@example.com", grade: "B", attendance: 92, status: "active" },
    { id: 3, name: "Sophia Garcia", email: "sophia.g@example.com", grade: "A-", attendance: 98, status: "active" },
    { id: 4, name: "Liam Johnson", email: "liam.j@example.com", grade: "C+", attendance: 85, status: "warning" },
    { id: 5, name: "Olivia Brown", email: "olivia.b@example.com", grade: "B+", attendance: 90, status: "active" },
    { id: 6, name: "Noah Davis", email: "noah.d@example.com", grade: "A", attendance: 94, status: "active" },
    { id: 7, name: "Ava Miller", email: "ava.m@example.com", grade: "B-", attendance: 88, status: "warning" },
    { id: 8, name: "Lucas Smith", email: "lucas.s@example.com", grade: "A-", attendance: 96, status: "active" }
  ];

  const announcements = [
    { id: 1, title: "Quiz Postponed", content: "The science quiz scheduled for tomorrow has been postponed to next Monday.", date: "Today, 9:15 AM", important: true },
    { id: 2, title: "Field Trip Permission Forms", content: "Please remind your parents to sign the permission forms for next week's museum visit.", date: "Yesterday", important: true },
    { id: 3, title: "New Study Resources", content: "I've uploaded new study materials for the upcoming math test. Check the resources section.", date: "Sep 22, 2023", important: false },
    { id: 4, title: "Parent-Teacher Conference", content: "Parent-teacher conferences will be held next Thursday and Friday. Sign-up sheet is in the office.", date: "Sep 20, 2023", important: false }
  ];

  const resources = [
    { id: 1, title: "Chapter 5 Study Guide", type: "PDF", size: "2.4 MB", uploadDate: "Sep 23, 2023" },
    { id: 2, title: "Lab Safety Guidelines", type: "PDF", size: "1.8 MB", uploadDate: "Sep 20, 2023" },
    { id: 3, title: "Essay Writing Tips", type: "DOCX", size: "850 KB", uploadDate: "Sep 18, 2023" },
    { id: 4, title: "Math Formula Sheet", type: "PDF", size: "1.2 MB", uploadDate: "Sep 15, 2023" },
    { id: 5, title: "Periodic Table Reference", type: "PDF", size: "3.1 MB", uploadDate: "Sep 10, 2023" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "warning": return "warning";
      default: return "default";
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "PDF": return "lucide:file-text";
      case "DOCX": return "lucide:file";
      case "XLSX": return "lucide:file-spreadsheet";
      case "PPTX": return "lucide:file-presentation";
      default: return "lucide:file";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:users" className="text-lg" />
            <h2 className="text-lg font-medium">Science 202</h2>
            <Chip size="sm" color="primary" variant="flat">Fall 2023</Chip>
          </div>
          <Button color="primary">
            <Icon icon="lucide:settings" className="mr-1" />
            Class Settings
          </Button>
        </CardHeader>
        <CardBody>
          <Tabs 
            selectedKey={selected} 
            onSelectionChange={setSelected}
            aria-label="Classroom tabs"
            className="w-full"
          >
            <Tab key="students" title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:users" />
                <span>Students</span>
              </div>
            }>
              <Card>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <Card key={student.id} className="border border-divider">
                        <CardBody>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={`https://img.heroui.chat/image/avatar?w=64&h=64&u=student${student.id}`}
                              className="h-12 w-12"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{student.name}</h3>
                                <Chip 
                                  size="sm" 
                                  color={getStatusColor(student.status)}
                                  variant="dot"
                                >
                                  {student.status === "active" ? "Active" : "At Risk"}
                                </Chip>
                              </div>
                              <p className="text-xs text-foreground-500">{student.email}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs">Grade: <strong>{student.grade}</strong></span>
                                <span className="text-xs">Attendance: <strong>{student.attendance}%</strong></span>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab key="announcements" title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:megaphone" />
                <span>Announcements</span>
              </div>
            }>
              <Card>
                <CardBody className="flex flex-col gap-4">
                  <div className="flex justify-end">
                    <Button color="primary">
                      <Icon icon="lucide:plus" className="mr-1" />
                      New Announcement
                    </Button>
                  </div>
                  
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} className="border border-divider">
                      <CardBody>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${announcement.important ? 'bg-danger-100 text-danger' : 'bg-default-100 text-default-600'}`}>
                            <Icon icon={announcement.important ? "lucide:alert-circle" : "lucide:bell"} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{announcement.title}</h3>
                              <span className="text-xs text-foreground-500">{announcement.date}</span>
                            </div>
                            <p className="mt-1 text-sm">{announcement.content}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </CardBody>
              </Card>
            </Tab>
            <Tab key="resources" title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:book" />
                <span>Resources</span>
              </div>
            }>
              <Card>
                <CardBody className="flex flex-col gap-4">
                  <div className="flex justify-end">
                    <Button color="primary">
                      <Icon icon="lucide:upload" className="mr-1" />
                      Upload Resource
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((resource) => (
                      <Card key={resource.id} className="border border-divider">
                        <CardBody>
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-md bg-content2">
                              <Icon icon={getFileIcon(resource.type)} className="text-xl" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{resource.title}</h3>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2 text-xs text-foreground-500">
                                  <span>{resource.type}</span>
                                  <span>•</span>
                                  <span>{resource.size}</span>
                                </div>
                                <span className="text-xs text-foreground-500">{resource.uploadDate}</span>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};