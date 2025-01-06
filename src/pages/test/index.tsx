// app/process-ai/page.tsx
'use client';

import { useEffect, useState } from 'react';
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

  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Declare recognition as null initially
  const [recognition, setRecognition] = useState<any>(null);

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.interimResults = true;

        recognitionInstance.onstart = () => {
          console.log('Speech recognition started...');
        };

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript + ' ';
            }
          }

          // Set the final text
          setText(finalTranscript + interimTranscript);

          // Reset the timeout on every result
          if (timeoutId) {
            clearTimeout(timeoutId); // Clear previous timeout
          }

          // Set a new timeout to stop recognition after 3 seconds of silence
          const newTimeoutId = setTimeout(() => {
            recognitionInstance.stop(); // Stop recognition after 3 seconds of silence
            setIsListening(false);
            console.log('Speech recognition stopped due to inactivity.');
          }, 5000); // 5 seconds timeout
          
          setTimeoutId(newTimeoutId); // Store the new timeout ID
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          console.log('Speech recognition ended');
        };

        setRecognition(recognitionInstance); // Store the recognition instance
      } else {
        console.error('Speech Recognition is not supported in this browser.');
      }
    }
  }, [timeoutId]); // Include timeoutId in dependency to reset on each change


  const handleStartStop = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
      setIsListening(!isListening);
    }
  };


  return (
    <div className="p-4">
      <ReactTyped strings={["Here you can find anything"]} typeSpeed={50} startDelay={1000} />
      <h1 className="text-xl font-bold">AI Command Processor</h1>

      <br></br>
        <button onClick={handleStartStop}>
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
        <p>{text || "Say something to start speech-to-text..."}</p>
      <br></br>

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
