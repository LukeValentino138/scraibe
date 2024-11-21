import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import TextToSpeechForm from './components/TextToSpeechForm';
import SummariseForm from './components/SummariseForm';
import PDFUploadForm from './components/PDFUploadForm';
import './App.css';

function App() {
  const [transcription, setTranscription] = useState('');
  const [extractedText, setExtractedText] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <h1>ScrAIbe</h1>

        {/* Upload and Transcribe Audio Section */}
        <UploadForm setTranscription={setTranscription} />
        {transcription && (
          <>
            <h2>Transcription:</h2>
            <p>{transcription}</p>
            <SummariseForm transcription={transcription} />
          </>
        )}

        <hr />

        {/* Upload and Extract Text from PDF Section */}
        <PDFUploadForm setExtractedText={setExtractedText} />
        {extractedText && (
          <>
            <h2>Extracted Text:</h2>
            <p>{extractedText}</p>
            <SummariseForm transcription={extractedText} />
          </>
        )}

        <hr />

        {/* Text-to-Speech Section */}
        <TextToSpeechForm />
      </header>
    </div>
  );
}

export default App;
