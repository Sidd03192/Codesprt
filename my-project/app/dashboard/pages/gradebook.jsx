import React from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Input, Chip,Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Gradebook = () => {
  const [selectedClass, setSelectedClass] = React.useState("all");
  const [searchValue, setSearchValue] = React.useState("");
  
  const classes = [
    { id: "all", name: "All Classes" },
    { id: "math101", name: "Mathematics 101" },
    { id: "sci202", name: "Science 202" },
    { id: "eng303", name: "English 303" }
  ];
  
  const students = [
    { id: 1, name: "Emma Thompson", email: "emma.t@example.com", mathGrade: "A", scienceGrade: "B+", englishGrade: "A-", attendance: 95 },
    { id: 2, name: "James Wilson", email: "james.w@example.com", mathGrade: "B", scienceGrade: "A", englishGrade: "B+", attendance: 92 },
    { id: 3, name: "Sophia Garcia", email: "sophia.g@example.com", mathGrade: "A-", scienceGrade: "A-", englishGrade: "A", attendance: 98 },
    { id: 4, name: "Liam Johnson", email: "liam.j@example.com", mathGrade: "C+", scienceGrade: "B", englishGrade: "B-", attendance: 85 },
    { id: 5, name: "Olivia Brown", email: "olivia.b@example.com", mathGrade: "B+", scienceGrade: "B+", englishGrade: "A-", attendance: 90 },
    { id: 6, name: "Noah Davis", email: "noah.d@example.com", mathGrade: "A", scienceGrade: "A-", englishGrade: "B+", attendance: 94 },
    { id: 7, name: "Ava Miller", email: "ava.m@example.com", mathGrade: "B-", scienceGrade: "C+", englishGrade: "B", attendance: 88 },
    { id: 8, name: "Lucas Smith", email: "lucas.s@example.com", mathGrade: "A-", scienceGrade: "B", englishGrade: "A", attendance: 96 }
  ];

  const filteredStudents = students.filter(student => {
    if (searchValue && !student.name.toLowerCase().includes(searchValue.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return "success";
    if (grade.startsWith('B')) return "primary";
    if (grade.startsWith('C')) return "warning";
    return "danger";
  };
  
  const getAttendanceColor = (attendance) => {
    if (attendance >= 95) return "success";
    if (attendance >= 90) return "primary";
    if (attendance >= 80) return "warning";
    return "danger";
  };

  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:bar-chart-2" className="text-lg" />
            <h2 className="text-lg font-medium">Gradebook</h2>
          </div>
          <div className="flex gap-2">
            <Button color="primary" variant="flat">
              <Icon icon="lucide:download" className="mr-1" />
              Export
            </Button>
            <Button color="primary">
              <Icon icon="lucide:plus" className="mr-1" />
              Add Grade
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <Input
              placeholder="Search students..."
              startContent={<Icon icon="lucide:search" />}
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full sm:max-w-xs"
            />
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                  {classes.find(c => c.id === selectedClass)?.name || "All Classes"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Class selection"
                onAction={(key) => setSelectedClass(key)}
                selectedKeys={[selectedClass]}
                selectionMode="single"
              >
                {classes.map((cls) => (
                  <DropdownItem key={cls.id}>{cls.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>

          <Table 
            aria-label="Student grades table"
            removeWrapper
            classNames={{
              table: "min-w-full",
            }}
          >
            <TableHeader>
              <TableColumn>STUDENT</TableColumn>
              <TableColumn>MATHEMATICS</TableColumn>
              <TableColumn>SCIENCE</TableColumn>
              <TableColumn>ENGLISH</TableColumn>
              <TableColumn>ATTENDANCE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={`https://img.heroui.chat/image/avatar?w=32&h=32&u=student${student.id}`}
                        className="h-8 w-8"
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-foreground-500">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={getGradeColor(student.mathGrade)}
                      variant="flat"
                    >
                      {student.mathGrade}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={getGradeColor(student.scienceGrade)}
                      variant="flat"
                    >
                      {student.scienceGrade}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={getGradeColor(student.englishGrade)}
                      variant="flat"
                    >
                      {student.englishGrade}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={getAttendanceColor(student.attendance)}
                      variant="flat"
                    >
                      {student.attendance}%
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="light" isIconOnly>
                        <Icon icon="lucide:edit" />
                      </Button>
                      <Button size="sm" variant="light" isIconOnly>
                        <Icon icon="lucide:more-vertical" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};