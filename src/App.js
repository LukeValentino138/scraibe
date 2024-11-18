import React from 'react';
import UploadForm from './components/UploadForm';
import TextToSpeechForm from './components/TextToSpeechForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ScrAIbe</h1>
        <UploadForm />
        <hr />
        <TextToSpeechForm />
      </header>
    </div>
  );
}

export default App;
