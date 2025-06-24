import React from "react";
import { Card, CardBody, CardHeader, Button, Input, Tabs, Tab, Chip, Avatar, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";

export const StudentCourses = () => {
  const [selected, setSelected] = React.useState("current");
  const [searchValue, setSearchValue] = React.useState("");
  const courses = [
    { 
      id: 1, 
      name: "Mathematics 101", 
      code: "MATH101",
      instructor: "Dr. Robert Chen", 
      instructorAvatar: "https://img.heroui.chat/image/avatar?w=64&h=64&u=teacher1",
      credits: 4,
      schedule: "Mon, Wed, Fri 10:00 AM - 11:15 AM",
      location: "Science Building, Room 305",
      progress: 65,
      status: "current",
      description: "Introduction to calculus, limits, derivatives, and integrals with applications to physical sciences and engineering.",
      image: "https://img.heroui.chat/image/book?w=400&h=200&u=1"
    },
    { 
      id: 2, 
      name: "Science 202", 
      code: "SCI202",
      instructor: "Dr. Sarah Williams", 
      instructorAvatar: "https://img.heroui.chat/image/avatar?w=64&h=64&u=teacher2",
      credits: 4,
      schedule: "Tue, Thu 1:00 PM - 2:45 PM",
      location: "Science Building, Room 210",
      progress: 58,
      status: "current",
      description: "Principles of chemistry and physics with laboratory experiments and practical applications.",
      image: "https://img.heroui.chat/image/book?w=400&h=200&u=2"
    },
    { 
      id: 3, 
      name: "English 303", 
      code: "ENG303",
      instructor: "Prof. James Miller", 
      instructorAvatar: "https://img.heroui.chat/image/avatar?w=64&h=64&u=teacher3",
      credits: 3,
      schedule: "Mon, Wed 2:00 PM - 3:15 PM",
      location: "Humanities Building, Room 120",
      progress: 72,
      status: "current",
      description: "Advanced composition and critical reading with emphasis on developing analytical writing skills.",
      image: "https://img.heroui.chat/image/book?w=400&h=200&u=3"
    },
    { 
      id: 4, 
      name: "History 101", 
      code: "HIST101",
      instructor: "Dr. Emily Thompson", 
      instructorAvatar: "https://img.heroui.chat/image/avatar?w=64&h=64&u=teacher4",
      credits: 3,
      schedule: "Tue, Thu 10:00 AM - 11:15 AM",
      location: "Humanities Building, Room 210",
      progress: 60,
      status: "current",
      description: "Survey of world history from ancient civilizations to the modern era with emphasis on cultural developments.",
      image: "https://img.heroui.chat/image/book?w=400&h=200&u=4"
    },
    { 
      id: 5, 
      name: "Art & Design", 
      code: "ART105",
      instructor: "Prof. Lisa Chen", 
      instructorAvatar: "https://img.heroui.chat/image/avatar?w=64&h=64&u=teacher5",
      credits: 3,
      schedule: "Fri 9:00 AM - 11:45 AM",
      location: "Arts Building, Studio 4",
      progress: 70,
      status: "current",
      description: "Introduction to principles of design, color theory, and basic drawing techniques.",
      image: "https://img.heroui.chat/image/book?w=400&h=200&u=5"
    },
    { 
      id: 6, 
      name: "Computer Science 101", 
      code: "CS101",
      instructor: "Dr. Michael Lee", 
      instructorAvatar: "https://img.heroui.chat/image/avatar?w=64&h=64&u=teacher6",
      credits: 4,
      schedule: "Mon, Wed 9:00 AM - 10:45 AM",
      location: "Technology Building, Lab 3",
      progress: 100,
      status: "past",
      description: "Introduction to programming concepts, algorithms, and problem-solving techniques.",
      image: "https://img.heroui.chat/image/book?w=400&h=200&u=6"
    },
    { 
      id: 7, 
      name: "Psychology 202", 
      code: "PSYC202",
      instructor: "Dr. Amanda Garcia", 
      instructorAvatar: "https://img.heroui.chat/image/avatar?w=64&h=64&u=teacher7",
      credits: 3,
      schedule: "Tue, Thu 3:00 PM - 4:15 PM",
      location: "Social Sciences Building, Room 105",
      progress: 100,
      status: "past",
      description: "Study of human behavior and mental processes with emphasis on research methods and theories.",
      image: "https://img.heroui.chat/image/book?w=400&h=200&u=7"
    }
  ];

  const filteredCourses = courses.filter(course => {
    if (selected === "current" && course.status !== "current") return false;
    if (selected === "past" && course.status !== "past") return false;
    if (searchValue && !course.name.toLowerCase().includes(searchValue.toLowerCase()) && 
        !course.code.toLowerCase().includes(searchValue.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:book" className="text-lg" />
            <h2 className="text-lg font-medium">My Courses</h2>
          </div>
          <div className="flex gap-2">
            <Button color="primary" variant="flat">
              <Icon icon="lucide:filter" className="mr-1" />
              Filter
            </Button>
            <Button color="primary">
              <Icon icon="lucide:calendar" className="mr-1" />
              Schedule
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <Input
              placeholder="Search courses..."
              startContent={<Icon icon="lucide:search" />}
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full sm:max-w-xs"
            />
            <Tabs 
              selectedKey={selected} 
              onSelectionChange={setSelected}
              aria-label="Course status"
              classNames={{
                base: "w-full sm:w-auto",
                tabList: "gap-2"
              }}
            >
              <Tab key="current" title="Current Courses" />
              <Tab key="past" title="Past Courses" />
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <Card key={course.id} className="border border-divider">
                  <div className="relative h-40 w-full">
                    <img 
                      src={course.image} 
                      alt={course.name} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-3 left-4">
                      <Chip 
                        size="sm" 
                        color="primary" 
                        variant="solid"
                      >
                        {course.code}
                      </Chip>
                    </div>
                  </div>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{course.name}</h3>
                        <p className="text-sm text-foreground-500 mt-1">{course.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Avatar src={course.instructorAvatar} className="h-10 w-10" />
                        <div>
                          <p className="font-medium">{course.instructor}</p>
                          <p className="text-xs text-foreground-500">Instructor</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:clock" className="text-foreground-500" />
                          <span className="text-sm">{course.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:map-pin" className="text-foreground-500" />
                          <span className="text-sm">{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:award" className="text-foreground-500" />
                          <span className="text-sm">{course.credits} Credits</span>
                        </div>
                      </div>
                      
                      {course.status === "current" && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Course Progress</span>
                            <span className="text-sm font-medium">{course.progress}%</span>
                          </div>
                          <Progress 
                            value={course.progress} 
                            color={course.progress > 75 ? "success" : "primary"} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="flat">
                          <Icon icon="lucide:book-open" className="mr-1" />
                          Materials
                        </Button>
                        <Button size="sm" color="primary">
                          <Icon icon="lucide:log-in" className="mr-1" />
                          Go to Course
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Icon icon="lucide:search-x" className="mx-auto text-4xl text-foreground-400 mb-2" />
                <p className="text-foreground-500">No courses found</p>
                <p className="text-sm text-foreground-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};