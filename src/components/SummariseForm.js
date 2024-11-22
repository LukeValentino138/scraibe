// src/components/SummariseForm.js
import React, { useState } from 'react';
import './SummariseForm.css';
import { DropdownMenu, DropdownMenuItem } from './ui/DropdownMenu';

const SummariseForm = ({ transcription }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState('Select Level');

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

  const levels = ['University', 'Year 10', 'Year 1'];

  const handleSummarise = async () => {
    if (level === 'Select Level') {
      alert('Please select a summarization level.');
      return;
    }

    setLoading(true);
    setSummary('');

    try {
      const response = await fetch(`${apiEndpoint}/geminiSummarise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcriptionText: transcription, summaryLevel: level }),
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
      <div className="my-4">
        <DropdownMenu label={level}>
          {levels.map((lvl) => (
            <DropdownMenuItem
              key={lvl}
              onSelect={() => {
                setLevel(lvl);
              }}
            >
              {lvl}
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      </div>
      <button
        onClick={handleSummarise}
        disabled={loading || level === 'Select Level'}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
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
