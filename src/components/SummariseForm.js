// src/components/SummariseForm.js
import React, { useState } from 'react';
import './SummariseForm.css';
import { DropdownMenu, DropdownMenuItem } from './ui/DropdownMenu';

const SummariseForm = ({ transcription }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState('Select Level');

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

  const levels = [
    'Kindergarten (Ages 4-5)', 
    'Preparatory (Ages 5-6)', 
    'Year 1 (Ages 6-7)', 
    'Year 2 (Ages 7-8)',
    'Year 3 (Ages 8-9)', 
    'Year 4 (Ages 9-10)', 
    'Year 5 (Ages 10-11)', 
    'Year 6 (Ages 11-12)',
    'Year 7 (Ages 12-13)', 
    'Year 8 (Ages 13-14)', 
    'Year 9 (Ages 14-15)', 
    'Year 10 (Ages 15-16)',
    'Year 11 (Ages 16-17)', 
    'Year 12 (Ages 17-18)', 
    'University Undergraduate in Field', 
    'University Undergraduate in Adjacent Field',
    'University Undergraduate in Unrelated Field', 
    'University Postgraduate in Field', 
    'University Postgraduate in Adjacent Field',
    'University Postgraduate in Unrelated Field', 
    'General Public', 
    'Industry Professional in Related Field',
    'Industry Professional in Unrelated Field', 
    'ESL Learners', 
    'Individuals with Learning Challenges',
  ];

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
        <div className="scrollable-box">
          <h4>Summary:</h4>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default SummariseForm;
