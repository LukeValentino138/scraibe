import React, { useState } from 'react';
import './TextToSpeechForm.css';

const TextToSpeechForm = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Joanna');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

  const voices = [
    { id: 'Joanna', name: 'Joanna (Female)', engine: 'standard' },
    { id: 'Matthew', name: 'Matthew (Male)', engine: 'standard' },
    { id: 'Amy', name: 'Amy (Female)', engine: 'standard' },
    { id: 'Brian', name: 'Brian (Male)', engine: 'standard' },
    { id: 'Ruth', name: 'Ruth (Female) (Long Form, Neural)', engine: 'neural' },
    { id: 'Danielle', name: 'Danielle (Female) (Long Form, Neural, Generative)', engine: 'neural' },
  ];
  

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      alert('Please enter some text.');
      return;
    }
  
    setLoading(true);
    setAudioUrl(null);
  
    try {
      const selectedVoice = voices.find((v) => v.id === voice);
      const engine = selectedVoice.engine;
  
      const response = await fetch(`${apiEndpoint}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice, engine }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error generating speech: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating speech.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="text-to-speech-form">
      <h2>Text-to-Speech</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here..."
      />
      <select value={voice} onChange={(e) => setVoice(e.target.value)}>
        {voices.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
      <button onClick={handleGenerateSpeech} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Speech'}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default TextToSpeechForm;
