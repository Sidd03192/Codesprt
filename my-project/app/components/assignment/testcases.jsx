import React, { useState, useCallback, useMemo } from "react";
import {
  Upload,
  File,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
// JSZip is imported directly from a CDN that serves ES modules.
// This avoids the need for a local installation or a separate script tag.
import JSZip from "jszip";
import { ScrollShadow, Spinner } from "@heroui/react";

export const Testcase = () => {
  // A single state to hold all file information, including zip contents
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files) => {
    setProcessing(true);
    const fileArray = Array.from(files);

    const processedFiles = await Promise.all(
      fileArray.map(async (file) => {
        const baseFileObject = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadTime: new Date().toLocaleString(),
          isZip: file.name.endsWith(".zip"),
          file: file,
          contents: [],
          isExpanded: false, // For toggling zip content view
        };

        // If the file is a zip, parse its contents
        if (baseFileObject.isZip) {
          try {
            const jszip = new JSZip();
            const zip = await jszip.loadAsync(file);
            const contents = [];
            for (const filename in zip.files) {
              if (!zip.files[filename].dir) {
                // We only care about files, not directories
                const fileInZip = zip.files[filename];
                contents.push({
                  name: fileInZip.name,
                  size: fileInZip._data.uncompressedSize,
                  isTestJava:
                    fileInZip.name.endsWith("test.java") ||
                    fileInZip.name.includes("/test.java"),
                });
              }
            }
            baseFileObject.contents = contents;
          } catch (error) {
            console.error("Error reading zip file:", error);
            // Optionally add an error state to the file object
            baseFileObject.error = "Failed to read zip contents.";
          }
        }
        return baseFileObject;
      })
    );

    setUploadedFiles((prev) => [...prev, ...processedFiles]);
    setProcessing(false);
  }, []);

  const validationResult = useMemo(() => {
    if (uploadedFiles.length === 0) {
      return null; // No files, no validation message
    }

    const hasTestJava = uploadedFiles.some((file) => {
      // Check if the file itself is Test.java
      if (file.name === "test.java") return true;
      // Check if the file is a zip and contains Test.java
      if (file.isZip && file.contents?.some((c) => c.isTestJava)) return true;
      return false;
    });

    const isZipPresent = uploadedFiles.some((file) => file.isZip);

    return { hasTestJava, isZipPresent };
  }, [uploadedFiles]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (idToRemove) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== idToRemove));
  };

  const toggleZipContents = (idToToggle) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.id === idToToggle
          ? { ...file, isExpanded: !file.isExpanded }
          : file
      )
    );
  };

  // --- Helper Functions ---

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.isZip) return <Archive className="w-5 h-5 text-purple-500" />;
    if (file.name.endsWith(".java"))
      return <File className="w-5 h-5 text-orange-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="p-4 md:p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Upload Area */}
        <label className="">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload
              className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                dragActive ? "text-blue-500" : "text-gray-200"
              }`}
            />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {dragActive ? "Drop files here" : "Drag & drop files here"}
            </h3>
            <p className="text-gray-500 mb-4">
              Upload `test.java` directly or within a .zip archive.
            </p>
          </div>
          <input
            type="file"
            multiple
            accept=".zip,.java"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className=" rounded-2xl shadow-2xl  mt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-medium font-medium">Uploaded Files </h3>
              <p className=" rounded-full text-sm font-medium">
                {uploadedFiles.length} file
                {uploadedFiles.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ScrollShadow
              hideScrollBar={true}
              className="space-y-3 overflow-y-auto max-h-[300px]"
            >
              {uploadedFiles.map((file) => (
                <React.Fragment key={file.id}>
                  <div
                    className={`flex items-center p-3 rounded-lg transition-colors border border-border ${
                      file.isZip ? "cursor-pointer" : "cursor-default"
                    }`}
                    onClick={() => file.isZip && toggleZipContents(file.id)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {file.isZip ? (
                        file.isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-purple-600" />
                        )
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium  truncate">
                        {file.name}
                      </h3>
                      <div className="flex items-center mt-1 text-xs ">
                        <span>{formatFileSize(file.size)}</span>
                        <span className="mx-2">·</span>
                        <span>{file.type || "unknown type"}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="ml-4 p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expanded Zip Contents */}
                  {file.isExpanded && (
                    <div className="pl-8 pr-4 pb-2">
                      <div className="border-l-2 border-purple-200 pl-6 space-y-2 py-2">
                        {file.contents.length > 0 ? (
                          file.contents.map((content, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-purple-50/50 rounded-md"
                            >
                              <div className="flex items-center">
                                <File
                                  className={`w-4 h-4 mr-2 ${
                                    content.isTestJava
                                      ? "text-green-500"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    content.isTestJava
                                      ? "font-semibold text-green-700"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {content.name}
                                </span>
                                {content.isTestJava && (
                                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                    ✓ Test.java
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(content.size)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 px-2">
                            This zip file is empty.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </ScrollShadow>
          </div>
        )}

        {/* Empty State */}
        {uploadedFiles.length === 0 && !processing && (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              No files uploaded yet
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Drag and drop or choose files to get started.
            </p>
          </div>
        )}

        {/* Processing State */}
        {processing && uploadedFiles.length == 0 && (
          <div className="text-center py-16">
            <Spinner color="primary" />
            <p className="text-gray-500 text-lg font-medium">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Make sure to export the component if it's in its own file
// export default Testcase;
