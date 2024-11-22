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
        <section>
          <h2>Audio Transcription</h2>
          <UploadForm setTranscription={setTranscription} />
          {transcription && (
            <>
              <h3>Transcription:</h3>
              <p>{transcription}</p>
              <SummariseForm transcription={transcription} />
            </>
          )}
        </section>

        <hr />

        {/* Upload and Extract Text from PDF Section */}
        <section>
          <h2>PDF Text Extraction</h2>
          <PDFUploadForm setExtractedText={setExtractedText} />
          {extractedText && (
            <>
              <h3>Extracted Text:</h3>
              <p>{extractedText}</p>
              <SummariseForm transcription={extractedText} />
            </>
          )}
        </section>

        <hr />

        {/* Text-to-Speech Section */}
        <section>
          <TextToSpeechForm />
        </section>
      </header>
    </div>
  );
}

export default App;
