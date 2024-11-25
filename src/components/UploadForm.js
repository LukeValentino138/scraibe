import React, { useState } from 'react';
import './UploadForm.css';
import { TrophySpin } from 'react-loading-indicators';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const UploadForm = ({ setTranscription }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const updateProgress = () => {
    if (progress < 100) {
      setProgress((prevProgress) => prevProgress + 10); // Increment progress by 10%
      setTimeout(updateProgress, 1000); // Update every second
    }
  };

  const checkTranscriptionStatus = async (jobName) => {
    try {
      const statusResponse = await fetch(
        `${apiEndpoint}/check-transcription-status?jobName=${encodeURIComponent(jobName)}`
      );
      const statusData = await statusResponse.json();

      if (statusData.status === 'COMPLETED') {
        // Use setTranscription prop to update the transcription in App.js
        setTranscription(statusData.transcription);
        setIsLoading(false);
        setProgress(100); // Set progress to 100% when done
      } else if (statusData.status === 'IN_PROGRESS') {
        setTimeout(() => checkTranscriptionStatus(jobName), 500); // Retry after 0.5 seconds
      } else {
        setTranscription('Transcription failed.');
        setIsLoading(false);
        setProgress(0);
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setTranscription('Error checking transcription status.');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an audio file.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    updateProgress(); // Start progress bar animation

    try {
      // Generate a unique file name
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;

      console.log('Unique File Name:', uniqueFileName);

      // Step 1: Get a pre-signed URL
      const presignedUrlResponse = await fetch(
        `${apiEndpoint}/get-presigned-url?fileName=${encodeURIComponent(uniqueFileName)}`
      );

      if (!presignedUrlResponse.ok) {
        const errorText = await presignedUrlResponse.text();
        throw new Error(`Error fetching presigned URL: ${presignedUrlResponse.status} ${errorText}`);
      }

      const data = await presignedUrlResponse.json();
      const presignedUrl = data.presignedUrl;
      const s3ObjectKey = data.s3ObjectKey;

      console.log('Presigned URL:', presignedUrl);

      // Step 2: Upload the file to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Error uploading file to S3: ${uploadResponse.status} ${errorText}`);
      }

      console.log('File uploaded successfully to S3');

      // Step 3: Start transcription
      const transcribeResponse = await fetch(`${apiEndpoint}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ s3ObjectKey }),
      });

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        throw new Error(`Error invoking transcription API: ${transcribeResponse.status} ${errorText}`);
      }

      const transcribeData = await transcribeResponse.json();
      console.log('Transcription Job Name:', transcribeData.jobName);

      // Step 4: Poll for transcription status
      checkTranscriptionStatus(transcribeData.jobName);
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="upload-form">
      <div className="form-controls">
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        {isLoading && (
          <div className="loading-indicator">
            <TrophySpin color="#6281df" size="small" text="" textColor="" />
          </div>
        )}
        <button onClick={handleUpload} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Upload and Transcribe'}
        </button>
      </div>
    </div>
  );
};

export default UploadForm;
