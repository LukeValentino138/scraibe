import React, { useState } from 'react';
import './PDFUploadForm.css';
import { TrophySpin } from 'react-loading-indicators';

const apiCheckTextract = process.env.REACT_APP_SCRAIBE_CONVERSION_CHECK_TEXTRACT;
const apiStartTextract = process.env.REACT_APP_SCRAIBE_CONVERSION_START_TEXTRACT;
const apiUploadDocument = process.env.REACT_APP_SCRAIBE_UPLOAD_DOCUMENTS;

const PDFUploadForm = ({ setExtractedText }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      alert('Please upload a PDF smaller than 5 MB.');
      return;
    }
    setFile(selectedFile);
  };

  const uploadToS3 = async () => {
    const fileName = file.name;

    const presignedUrlResponse = await fetch(
      `${apiUploadDocument}?fileName=${encodeURIComponent(fileName)}`
    );

    if (!presignedUrlResponse.ok) {
      throw new Error('Failed to get presigned URL.');
    }

    const presignedUrlData = await presignedUrlResponse.json();

    console.log('presignedUrlData:', presignedUrlData);

    const { presignedUrl, s3ObjectKey } = presignedUrlData;

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'application/pdf',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3.');
    }

    return { s3ObjectKey };
  };

  const startTextractJob = async (fileKey) => {
    console.log('Starting Textract job with fileKey:', fileKey);

    const response = await fetch(apiStartTextract, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileKey }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from server:', errorText);
      throw new Error('Failed to start Textract job.');
    }

    const data = await response.json();
    return data.jobId;
  };

  const checkTextractStatus = async (jobId, retries = 500000) => {
    if (retries <= 0) {
      setText('Textract job timed out.');
      setLoading(false);
      return;
    }
  
    const response = await fetch(`${apiCheckTextract}?jobId=${jobId}`);
    const data = await response.json();
  
    if (data.status === 'SUCCEEDED') {
      if (data.presignedUrl) {
        const textResponse = await fetch(data.presignedUrl);
        const extractedText = await textResponse.text();
        setText(extractedText);
        setExtractedText(extractedText); 
      } else {
        setText('Error: No presigned URL provided.');
      }
      setLoading(false);
    } else if (data.status === 'IN_PROGRESS') {
      setTimeout(() => checkTextractStatus(jobId, retries - 1), 2000);
    } else {
      setText('Failed to extract text.');
      setLoading(false);
    }
  };
  

  const handleUpload = async () => {
    if (!file) {
      alert('Please upload a PDF.');
      return;
    }

    setLoading(true);
    setText('');

    try {
      const { s3ObjectKey } = await uploadToS3();
      console.log('Received s3ObjectKey:', s3ObjectKey); 
      const jobId = await startTextractJob(s3ObjectKey);
      setJobId(jobId);
      checkTextractStatus(jobId);
    } catch (error) {
      console.error('Error:', error);
      setText('An error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="pdf-upload-form">
      <div className="form-controls">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        {loading && (
          <div className="loading-indicator">
            <TrophySpin color="#6281df" size="small" text="" textColor="" />
          </div>
          )}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Processing...' : 'Upload and Extract'}
      </button>
      </div>


    </div>
  );
};

export default PDFUploadForm;
