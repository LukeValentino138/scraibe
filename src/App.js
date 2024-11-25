import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import SummariseForm from './components/SummariseForm';
import PDFUploadForm from './components/PDFUploadForm';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [transcription, setTranscription] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [activeTab, setActiveTab] = useState('audio'); // 'audio' or 'pdf'

  return (
    <div className="relative min-h-screen w-full bg-slate-950">
      {/* Background Effect */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Main Application Content */}
      <div className="relative z-10">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="App-header">
          {activeTab === 'audio' && (
            <section>
              <div className="main-heading">
                <h2>Audio Transcription</h2>
              </div>
              <UploadForm setTranscription={setTranscription} />
              {transcription && (
                <div className="scrollable-box">
                  <p>{transcription}</p>
                </div>
              )}
              {transcription && <SummariseForm transcription={transcription} />}
            </section>
          )}

          {activeTab === 'pdf' && (
            <section>
              <div className="main-heading">
                <h2>PDF Text Extraction</h2>
              </div>
              <PDFUploadForm setExtractedText={setExtractedText} />
              {extractedText && (
                <div className="scrollable-box">
                  <p>{extractedText}</p>
                </div>
              )}
              {extractedText && <SummariseForm transcription={extractedText} />}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
