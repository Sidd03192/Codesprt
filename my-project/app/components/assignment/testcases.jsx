"use client";

import React from "react";
import {
  Button,
  Checkbox,
  Divider,
  Input,
  Form,
  ScrollShadow,
  form,
  NumberInput,
  Link,
  Switch,
  Code,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
export const Testcase = ({ formData, setFormData }) => {
  const inputRef = useRef(null);
  const [showJSON, setShowJSON] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    input: "",
    expectedOutput: "",
    methodName: "",
    points: 0,
    name: "",
  });

  const handleAddTestCase = () => {
    if (newTestCase.input && newTestCase.expectedOutput) {
      const testCase = {
        id: Date.now().toString(),
        ...newTestCase,
      };

      setFormData((prev) => ({
        ...prev,
        testCases: [...prev.testCases, testCase],
      }));

      setNewTestCase({
        input: "",
        expectedOutput: "",
        methodName: "",
        points: 0,
        name: "",
      });
    }

    inputRef.current.focus();
  };

  const handleRemoveTestCase = (id) => {
    setFormData((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((tc) => tc.id !== id),
    }));
  };

  const deleteAllTestCases = () => {
    setFormData((prev) => ({
      ...prev,
      testCases: [],
    }));
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-between items-center ">
          <h3 className="text-lg font-medium">Add test cases</h3>
          <div className="flex gap-2">
            {/* Make this into a popover!!! */}
            <Button variant="flat" color="primary">
              <Icon icon="lucide:upload" />
              Upload
            </Button>

            <Button tabIndex={-1} variant="flat" color="secondary">
              <Icon icon="lucide:wand-sparkles" /> AI Generate
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="">
              <div className="grid grid-cols-2 gap-4 rounded-lg ">
                <Input
                  className="col-span-2"
                  placeholder="Test Case Name & Description"
                  variant="bordered"
                  labelPlacement="outside"
                  value={newTestCase.name}
                  onChange={(e) =>
                    setNewTestCase({ ...newTestCase, name: e.target.value })
                  }
                  ref={inputRef}
                />
                <Input
                  placeholder="Input"
                  variant="bordered"
                  labelPlacement="outside"
                  value={newTestCase.input}
                  onChange={(e) =>
                    setNewTestCase({ ...newTestCase, input: e.target.value })
                  }
                />
                <Input
                  placeholder="Expected Output"
                  variant="bordered"
                  labelPlacement="outside"
                  value={newTestCase.expectedOutput}
                  onChange={(e) =>
                    setNewTestCase({
                      ...newTestCase,
                      expectedOutput: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Method Name"
                  variant="bordered"
                  labelPlacement="outside"
                  value={newTestCase.methodName}
                  onChange={(e) =>
                    setNewTestCase({
                      ...newTestCase,
                      methodName: e.target.value,
                    })
                  }
                />
                <NumberInput
                  type="number"
                  placeholder="Points"
                  variant="bordered"
                  labelPlacement="outside"
                  value={newTestCase.points}
                  minValue={0}
                  onChange={(e) =>
                    setNewTestCase({ ...newTestCase, points: e.target.value })
                  }
                />
              </div>

              {/* <Checkbox
                isSelected={newTestCase.isHidden}
                onValueChange={(value) =>
                  setNewTestCase({
                    ...newTestCase,
                    isHidden: value,
                  })
                }
              >
                Hidden from students
              </Checkbox> */}
              <div className="flex flex-col gap-4 ">
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    className=" w-fit "
                    color="primary"
                    onPress={handleAddTestCase}
                    variant="flat"
                  >
                    <Icon icon="lucide:plus" />
                    Add Case
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Divider className="bg-zinc-700" />

        <div className="flex justify-between mt-7">
          <h3 className="text-lg font-medium">
            Test Cases ({formData.testcases.length})
          </h3>
          <div className="flex gap-3">
            <Switch
              defaultSelected
              color="primary"
              size="lg"
              thumbIcon={<Icon icon="lucide:braces" />}
              isSelected={showJSON}
              onValueChange={setShowJSON}
            ></Switch>
            <Button color="danger" variant="flat" onPress={deleteAllTestCases}>
              Delete All
            </Button>
          </div>
        </div>

        {formData.testcases.length === 0 ? (
          <p className="text-center text-zinc-400">No test cases added yet</p>
        ) : showJSON ? (
          // Some div or JSX when showJSON is true
          <div className="w-full overflow-auto bg-zinc-800 rounded-lg p-4 max-h-96">
            <pre className="text-sm text-zinc-200 whitespace-pre-wrap">
              {JSON.stringify(
                formData.testcases.map(({ id, ...rest }) => rest),
                null,
                2
              )}
            </pre>
          </div>
        ) : (
          <ScrollShadow hideScrollBar className="max-h-[200px] space-y-2">
            {formData.testcases.map((testCase) => (
              <div
                key={testCase.id}
                className="flex items-center justify-between rounded-medium border border-zinc-700 p-4"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{testCase.name}</div>
                    <div>
                      <p>Method: {testCase.methodName}</p>
                      <p>Points: {testCase.points}</p>
                    </div>

                    <div className="flex  gap-2">
                      <div className="text-small text-zinc-400">
                        Input: {testCase.input}
                      </div>
                      <div className="text-small text-zinc-400">
                        Expecting: {testCase.expectedOutput}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  isIconOnly
                  color="danger"
                  size="lg"
                  variant="light"
                  onPress={() => handleRemoveTestCase(testCase.id)}
                >
                  <Icon icon="lucide:trash-2" />
                </Button>
              </div>
            ))}
          </ScrollShadow>
        )}
      </div>
    </div>
  );
};
