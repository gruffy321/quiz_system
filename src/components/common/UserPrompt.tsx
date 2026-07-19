import React, { useState } from 'react';
import { filterProfanity } from '@/utils/profanityFilter';

interface UserPromptProps {
  promptText: string;
  onSubmit: (input: string) => void;
  onCancel?: () => void;
  requireCleanInput?: boolean;
}

export const UserPrompt: React.FC<UserPromptProps> = ({ promptText, onSubmit, onCancel, requireCleanInput = true }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (requireCleanInput && !filterProfanity(input).isClean) {
      setError('Please ensure your input is appropriate.');
      return;
    }

    if (input.trim() === '') {
      setError('Input cannot be empty.');
      return;
    }

    onSubmit(input);
    setInput('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700 mb-2">{promptText}</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          placeholder="Type your answer here..."
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
