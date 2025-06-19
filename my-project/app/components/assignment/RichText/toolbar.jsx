// Toolbar.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input,
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export const Toolbar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [_, setRender] = useState(0);

  useEffect(() => {
    if (editor) {
      const forceUpdate = () => setRender((n) => n + 1);
      editor.on("transaction", forceUpdate);
      editor.on("selectionUpdate", forceUpdate);
      return () => {
        editor.off("transaction", forceUpdate);
        editor.off("selectionUpdate", forceUpdate);
      };
    }
  }, [editor]);

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      setLinkUrl("");
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const handleColorChange = (color) => {
    editor.chain().focus().setColor(color).run();
  };

  const enhanceWithAI = async () => {
    if (!editor) return;
    const userInput = editor.getText();
    const res = await fetch("/api/enhance-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userInput }),
    });

    const { html } = await res.json();
    editor.commands.setContent(html, "html");
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 bg-content1">
      <Tooltip content="Bold">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bold") ? "solid" : "light"}
          color={editor.isActive("bold") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleBold().run()}
        >
          <Icon icon="lucide:bold" />
        </Button>
      </Tooltip>

      <Tooltip content="Italic">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("italic") ? "solid" : "light"}
          color={editor.isActive("italic") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleItalic().run()}
        >
          <Icon icon="lucide:italic" />
        </Button>
      </Tooltip>

      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" variant="light">
            <Icon icon="lucide:paintbrush" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Text Color"
          onAction={(key) => handleColorChange(key)}
        >
          <DropdownItem key="#ef4444">Red</DropdownItem>
          <DropdownItem key="#10b981">Green</DropdownItem>
          <DropdownItem key="#3b82f6">Blue</DropdownItem>
          <DropdownItem key="#000000">Black</DropdownItem>
          <DropdownItem key="#ffffff">White </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Popover>
        <PopoverTrigger>
          <Button isIconOnly size="sm" variant="light">
            <Icon icon="lucide:link" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Input
            label="URL"
            size="sm"
            placeholder="https://example.com"
            value={linkUrl}
            onValueChange={setLinkUrl}
          />
          <Button size="sm" color="primary" onPress={addLink}>Add Link</Button>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <Button isIconOnly size="sm" variant="light">
            <Icon icon="lucide:image" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Input
            label="Image URL"
            size="sm"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onValueChange={setImageUrl}
          />
          <Button size="sm" color="primary" onPress={addImage}>Add Image</Button>
        </PopoverContent>
      </Popover>

      <Tooltip content="Enhance with AI">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={enhanceWithAI}
        >
          <Icon icon="lucide:wand-sparkles" />
        </Button>
      </Tooltip>
    </div>
  );
};
