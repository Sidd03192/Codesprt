// File: app/api/grade/route.js
import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import unzipper from 'unzipper';

const execPromise = promisify(exec);

export async function POST(request) {
  const { studentCode, path } = await request.json();
  const jobDir = await fs.mkdtemp(path.join(os.tmpdir(), 'autograder-'));

  try {
    console.log(`Grading job started in temporary directory: ${jobDir}`);

    // Create the directory in server 
    const sourceDir = path.join(jobDir, 'source');
    const testsDir = path.join(jobDir, 'tests');
    const resultsDir = path.join(jobDir, 'results');
    await fs.mkdir(sourceDir);
    await fs.mkdir(testsDir);
    await fs.mkdir(resultsDir);

    console.log(`Downloading test file for assignment: ${assignmentId}`);
    const testFileData = await getAssignmentTestFile(path);
    
    if (!testFileData) {
      throw new Error('Failed to download test file from Supabase');
    }

    const isZipFile = assignmentId.endsWith('.zip');
    if (isZipFile) {
      // If it's a zip file, save it temporarily and then extract
      console.log('Detected .zip file, saving and extracting...');
      const tempZipPath = path.join(jobDir, 'temp-tests.zip');
      
      // Convert blob to buffer and save
      const buffer = await testFileData.arrayBuffer();
      await fs.writeFile(tempZipPath, Buffer.from(buffer));
      
      // Extract the zip file
      await new Promise((resolve, reject) => {
        fs.createReadStream(tempZipPath)
          .pipe(unzipper.Extract({ path: testsDir }))
          .on('finish', resolve)
          .on('error', reject);
      });
      
      // Clean up the temporary zip file
      await fs.unlink(tempZipPath);
    } else {
      // If it's a single file, save it directly into the 'tests' directory
      console.log('Detected single file, saving...');
      const fileName = path.basename(assignmentId) || 'test-file';
      const filePath = path.join(testsDir, fileName);
      
      // Convert blob to buffer and save
      const buffer = await testFileData.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(buffer));
    }
    console.log('Test files prepared successfully.');

    // Save the student's code to a file
    await fs.writeFile(path.join(sourceDir, 'Solution.java'), studentCode);

    // Get the Docker environment/image name from your assignment configuration
    // You'll need to modify this based on how you store the Docker environment info
    const environment = 'your-autograder-image:latest'; // Docker image name
    
    // Construct and run the Docker command
    const dockerCommand = `docker run --rm -v "${sourceDir}:/autograder/source" -v "${testsDir}:/autograder/tests" -v "${resultsDir}:/autograder/results" ${environment}`;
    
    console.log("Executing Docker container...");
    await execPromise(dockerCommand);
    console.log("Docker execution finished.");

    // Read the standardized results file
    const resultsPath = path.join(resultsDir, 'results.json');
    const resultsData = await fs.readFile(resultsPath, 'utf8');
    const results = JSON.parse(resultsData);
    console.log("Grading results:", results);
    // After grading, save these results to your 'assignment_students' table
    // ... Supabase update logic here ...
    return NextResponse.json(results);

  } catch (error) {
    console.error("Autograding process failed:", error);
    return NextResponse.json({ error: 'Grading failed on the server.' }, { status: 500 });
  } finally {
    // Always clean up the temporary directory
    await fs.rm(jobDir, { recursive: true, force: true });
    console.log(`Cleaned up temporary directory: ${jobDir}`);
  }
}

// Helper function to download test file from Supabase Storage
async function getAssignmentTestFile(path) {
  try {
    const supabase = await createClient();
    console.log("Fetching assignment test file:", assignmentId);
    
    if (!assignmentId) {
      console.error("No assignment ID provided, got null or undefined.");
      return null;
    }
    // Download the file from Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('testing')
      .download(assignmentId);
    if (error) {
      console.error("Error downloading test file:", error.message);
      return null;
    }
    if (!data) {
      console.error("No data received from Supabase Storage");
      return null;
    }
    console.log("Test file downloaded successfully");
    return data; // This is a Blob object
  } catch (error) {
    console.error("Exception in getAssignmentTestFile:", error);
    return null;
  }
}
