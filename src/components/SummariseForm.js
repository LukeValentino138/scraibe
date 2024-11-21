import React, { useState } from 'react';
import './SummariseForm.css';

const SummariseForm = ({ transcription }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

  const handleSummarise = async () => {
    setLoading(true);
    setSummary('');

    try {
      const response = await fetch(`${apiEndpoint}/geminiSummarise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcriptionText: transcription }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error summarising text: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while summarising.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summarise-form">
      <h3>Summarise Transcription</h3>
      <button onClick={handleSummarise} disabled={loading}>
        {loading ? 'Summarising...' : 'Summarise'}
      </button>
      {summary && (
        <div className="summary-result">
          <h4>Summary:</h4>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default SummariseForm;
