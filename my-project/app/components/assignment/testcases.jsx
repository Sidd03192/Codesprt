import React, { useState, useCallback } from "react";
import {
  Upload,
  File,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  Eye,
  FolderOpen,
} from "lucide-react";

export const FileUploadSystem = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [zipContents, setZipContents] = useState([]);

  const validateFiles = async (files) => {
    let allZipContents = [];
    let hasTestJava = false;

    for (const file of files) {
      if (file.name.endsWith(".zip")) {
        try {
          // Read zip file as array buffer
          const arrayBuffer = await file.arrayBuffer();
          const zipContents = await parseZipFile(arrayBuffer);

          allZipContents.push({
            zipName: file.name,
            contents: zipContents,
          });

          // Check if any file in zip is Test.java
          hasTestJava =
            zipContents.some(
              (f) =>
                f.name.endsWith("Test.java") || f.name.includes("/Test.java")
            ) || hasTestJava;
        } catch (error) {
          console.error("Error reading zip file:", error);
          return {
            hasTestJava: false,
            isZip: true,
            error: "Failed to read zip file",
          };
        }
      } else if (file.name === "Test.java") {
        hasTestJava = true;
      }
    }

    setZipContents(allZipContents);
    return {
      hasTestJava,
      isZip: allZipContents.length > 0,
      zipContents: allZipContents,
    };
  };

  // Simple zip file parser using DataView
  const parseZipFile = async (arrayBuffer) => {
    const files = [];
    const view = new DataView(arrayBuffer);

    // Look for central directory end record (simplified)
    let offset = arrayBuffer.byteLength - 22;
    while (offset >= 0) {
      if (view.getUint32(offset, true) === 0x06054b50) {
        break;
      }
      offset--;
    }

    if (offset < 0) {
      throw new Error("Invalid zip file");
    }

    const centralDirOffset = view.getUint32(offset + 16, true);
    const numEntries = view.getUint16(offset + 10, true);

    // Parse central directory entries
    let currentOffset = centralDirOffset;
    for (let i = 0; i < numEntries; i++) {
      if (view.getUint32(currentOffset, true) !== 0x02014b50) {
        break;
      }

      const filenameLength = view.getUint16(currentOffset + 28, true);
      const extraLength = view.getUint16(currentOffset + 30, true);
      const commentLength = view.getUint16(currentOffset + 32, true);
      const uncompressedSize = view.getUint32(currentOffset + 24, true);

      // Extract filename
      const filenameBytes = new Uint8Array(
        arrayBuffer,
        currentOffset + 46,
        filenameLength
      );
      const filename = new TextDecoder().decode(filenameBytes);

      if (!filename.endsWith("/")) {
        // Skip directories
        files.push({
          name: filename,
          size: uncompressedSize,
          isTestJava:
            filename.endsWith("Test.java") || filename.includes("/Test.java"),
        });
      }

      currentOffset += 46 + filenameLength + extraLength + commentLength;
    }

    return files;
  };

  const handleFiles = useCallback(async (files) => {
    setProcessing(true);
    const fileArray = Array.from(files);

    // Validate for Test.java
    const validation = await validateFiles(fileArray);
    setValidationStatus(validation);

    // Process files
    const processedFiles = fileArray.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: new Date().toLocaleString(),
      isZip: file.name.endsWith(".zip"),
      file: file,
    }));

    setUploadedFiles((prev) => [...prev, ...processedFiles]);
    setProcessing(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);

      const files = e.dataTransfer.files;
      handleFiles(files);
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
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    if (uploadedFiles.length === 1) {
      setValidationStatus(null);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            File Upload System
          </h1>
          <p className="text-gray-600">
            Upload files and zip archives with automatic Test.java validation
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload
              className={`w-16 h-16 mx-auto mb-4 ${
                dragActive ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {dragActive ? "Drop files here" : "Drag & drop files here"}
            </h3>
            <p className="text-gray-500 mb-6">
              Support for zip files and individual files
            </p>
            <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 mr-2" />
              Choose Files
              <input
                type="file"
                multiple
                accept=".zip,.java,*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus && (
          <div
            className={`mb-6 p-4 rounded-lg border-l-4 ${
              validationStatus.hasTestJava
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            }`}
          >
            <div className="flex items-center">
              {validationStatus.hasTestJava ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span
                className={`font-semibold ${
                  validationStatus.hasTestJava
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {validationStatus.hasTestJava
                  ? "Success: Test.java file found!"
                  : "Error: Test.java file not found!"}
              </span>
            </div>
            <p
              className={`mt-1 text-sm ${
                validationStatus.hasTestJava ? "text-green-700" : "text-red-700"
              }`}
            >
              {validationStatus.isZip
                ? `Checked ${
                    validationStatus.hasTestJava
                      ? "zip archive contents"
                      : "zip archive - missing Test.java"
                  }`
                : validationStatus.hasTestJava
                ? "Test.java file uploaded successfully"
                : "Please upload a Test.java file or zip containing Test.java"}
            </p>
          </div>
        )}

        {/* Processing Indicator */}
        {processing && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800 font-medium">
                Processing files...
              </span>
            </div>
          </div>
        )}

        {/* Zip Contents Display */}
        {zipContents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Zip File Contents
            </h2>
            {zipContents.map((zipFile, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex items-center mb-4">
                  <Archive className="w-5 h-5 text-purple-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    {zipFile.zipName}
                  </h3>
                </div>
                <div className="pl-6 space-y-2">
                  {zipFile.contents.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <File
                          className={`w-4 h-4 mr-2 ${
                            file.isTestJava ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            file.isTestJava
                              ? "font-semibold text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          {file.name}
                        </span>
                        {file.isTestJava && (
                          <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            Test.java ✓
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Uploaded Files
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {uploadedFiles.length} file
                {uploadedFiles.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mr-4">{getFileIcon(file)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {file.isZip && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            ZIP
                          </span>
                        )}
                        {file.name.endsWith(".java") && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                            JAVA
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-4">{formatFileSize(file.size)}</span>
                      <span className="mr-4">Uploaded: {file.uploadTime}</span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {file.type || "Unknown type"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {uploadedFiles.length === 0 && !processing && (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No files uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Upload files to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSystem;
