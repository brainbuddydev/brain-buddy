// app/process-ai/page.tsx
'use client';

import { useState } from 'react';
import { useAIStore } from '@/hook/ai-store';
import { ReactTyped } from "react-typed";

export default function ProcessAIPage() {
  const { response, loading, error, fetchResponse } = useAIStore();
  const [command, setCommand] = useState('');

  const handleSubmit = async () => {
    await fetchResponse({
      user_id: '12345',
      command,
      ai_name: '',
    });
  };

  return (
    <div className="p-4">
<ReactTyped strings={["Here you can find anything"]} typeSpeed={50} startDelay={1000} />
      <h1 className="text-xl font-bold">AI Command Processor</h1>

      <textarea
        className="border rounded p-2 w-full mt-4"
        rows={4}
        placeholder="Enter your command here..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Submit'}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {response && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-bold">AI Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
