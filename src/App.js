import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import TextToSpeechForm from './components/TextToSpeechForm';
import SummariseForm from './components/SummariseForm';
import './App.css';

function App() {
  const [transcription, setTranscription] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <h1>ScrAIbe</h1>

        <UploadForm setTranscription={setTranscription} />

        {transcription && (
          <>
            <h2>Transcription:</h2>
            <p>{transcription}</p>

            <SummariseForm transcription={transcription} />
          </>
        )}

        <hr />
        <TextToSpeechForm />
      </header>
    </div>
  );
}

export default App;
