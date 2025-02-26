import React, { useState } from 'react';
import './UploadForm.css';
import { TrophySpin } from 'react-loading-indicators';

const apiCheckTranscribe = process.env.REACT_APP_SCRAIBE_CONVERSION_CHECK_TRANSCRIBE;
const apiUploadAudio = process.env.REACT_APP_SCRAIBE_UPLOAD_AUDIO;
const apiStartTranscribe = process.env.REACT_APP_SCRAIBE_CONVERSION_START_TRANSCRIBE;

const UploadForm = ({ setTranscription }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const updateProgress = () => {
    if (progress < 100) {
      setProgress((prevProgress) => prevProgress + 10);
      setTimeout(updateProgress, 1000);
    }
  };

  const checkTranscriptionStatus = async (jobName) => {
    try {
      const statusResponse = await fetch(
        `${apiCheckTranscribe}?jobName=${encodeURIComponent(jobName)}`
      );
      const statusData = await statusResponse.json();

      if (statusData.status === 'COMPLETED') {
        setTranscription(statusData.transcription);
        setIsLoading(false);
        setProgress(100);
      } else if (statusData.status === 'IN_PROGRESS') {
        setTimeout(() => checkTranscriptionStatus(jobName), 500);
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
    updateProgress();

    try {
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;

      console.log('Unique File Name:', uniqueFileName);

      const presignedUrlResponse = await fetch(
        `${apiUploadAudio}?fileName=${encodeURIComponent(uniqueFileName)}`
      );

      if (!presignedUrlResponse.ok) {
        const errorText = await presignedUrlResponse.text();
        throw new Error(`Error fetching presigned URL: ${presignedUrlResponse.status} ${errorText}`);
      }

      const data = await presignedUrlResponse.json();
      const presignedUrl = data.presignedUrl;
      const s3ObjectKey = data.s3ObjectKey;

      console.log('Presigned URL:', presignedUrl);

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

      const transcribeResponse = await fetch(apiStartTranscribe, {
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
