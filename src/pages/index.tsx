import { useAIStore } from "@/hook/ai-store";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ReactTyped } from "react-typed";

const Home = () => {
  const { response, loading, error, fetchResponse } = useAIStore();

  const [answer, setAnswer] = useState("Hello!");
  const [command, setCommand] = useState("");
  const [userId, setUserId] = useState("");
  const [aiName, setAiName] = useState("");
  const [firstTime, setFirstTime] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const commandRef = useRef<string>('');


  useEffect(() => {
    if (window) {
      const existUserId = sessionStorage.getItem("user_id");
      const existAiName = sessionStorage.getItem("ai_name");

      if (existUserId && existAiName) {
        setUserId(existUserId);
        setAiName(existAiName);
        setFirstTime(false);
        const existAnswer = `Hello! My name is ${existAiName}`;
        setAnswer(existAnswer);
      }
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (firstTime) {
      const newUserId = Math.random().toString();
      sessionStorage.setItem("user_id", newUserId);
      sessionStorage.setItem("ai_name", aiName);
      setUserId(newUserId);

      const newAnswer = `Hello! My name is ${aiName}`;
      setAnswer(newAnswer);
      setFirstTime(false);
    } else {
      await fetchResponse({
        user_id: userId,
        command: `Hello ${aiName}, ${command}`,
        ai_name: aiName,
      });
    }
  };

  const handleStartListening = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window.webkitSpeechRecognition)();
      recognition.lang = "en-US"; // Set the language
      recognition.interimResults = true //Capture only final results
      recognition.continuous = false; 
      recognition.onstart = () => {
        setIsListening(true);
        console.log("Voice recognition started...");
      };
  
      recognition.onresult = (event: any) => {
        let transcript = '';
    
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            // Add final results (this is when the speech is finished)
            transcript += result[0].transcript;
          } else {
            // Add interim results (this is when the speech is still being detected)
            transcript += result[0].transcript;
          }
        }
  
        // Update the form with the current transcript
        commandRef.current = transcript;
        setCommand(transcript)
        console.log("Voice detected:", transcript);
      };
  
      recognition.onerror = (error: any) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
      };
  
      recognition.onend = () => {
        setIsListening(false);
        fetchResponse({
          user_id: userId,
          command: `Hello ${aiName}, ${commandRef.current}`,
          ai_name: aiName,
        });
        console.log("Voice recognition ended.");
      };
  
      recognition.start();
    } else {
      console.error("SpeechRecognition is not supported in this browser.");
    }
  };
  
  
  
  // Function to speak the response text
  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(
          (voice) =>
            voice.name.includes("Female") ||
            voice.name.includes("Google UK English Female")
        );

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.lang = "en-US";
        utterance.rate = 1.2;
        utterance.pitch = 1.5;
        speechSynthesis.speak(utterance);
      };

      if (speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
      }
    } else {
      console.error("Speech Synthesis API is not supported in this browser.");
    }
  };

  useEffect(() => {
    if (response) {
      speakResponse(response);
      setCommand("");
    }
  }, [response]);

  return (
    <div className="grainy-background h-screen flex flex-col text-white overflow-hidden">
      <div className="header p-[40px] flex items-center justify-between">
        <h1 className="text-4xl">Buddy.ai</h1>
        <div className="flex gap-4">
          <h6>Twitter</h6>
          <h6>Telegram</h6>
          <h6>Dex Screener</h6>
        </div>
      </div>
      <div className="grow flex flex-col justify-center items-center">
        <Image
          className="absolute blur-[180px] bottom-[-93px] left-[14px]"
          src="/blur-circle.png"
          alt=""
          width={618}
          height={618}
        />
        <Image
          className="absolute top-[134px] right-[376px]"
          src="/star.png"
          alt=""
          width={80}
          height={80}
        />

        <h2 className="text-8xl font-bold text-white text-center">
          <ReactTyped strings={[answer]} typeSpeed={50} startDelay={1000} />
        </h2>
        <p className="m-0 p-0 my-6 font-light text-xl">
          {firstTime
            ? "What would you like to call me?"
            : "Generate your own AI Buddy! Make your life easier with BrainBuddy"}
        </p>
        <form onSubmit={handleSubmit} className="w-1/2">
          <div className="mt-6 flex flex-col gap-8 w-full">
            <input
              type="text"
              placeholder={
                firstTime ? "Please enter my name" : "What can I help you?"
              }
              className="px-8 py-6 rounded-full outline-none text-black"
              value={firstTime ? aiName : command}
              onChange={
                firstTime
                  ? (e) => setAiName(e.target.value)
                  : (e) => setCommand(e.target.value)
              }
            />

            <div className="flex justify-center gap-2">
              <button
                className="px-4 py-3 bg-black text-white rounded-full flex gap-2 items-center justify-between"
                type="submit"
                disabled={loading}
              >
                Submit
                <Image src="/left-arrow.png" alt="" width={32} height={32} />
              </button>
              {
                !firstTime && (
                  <button
                  type="button"
                  className="px-4 py-3 bg-black text-white rounded-full flex gap-2 items-center justify-between"
                  onClick={handleStartListening}
                  disabled={loading}
                > 
                  {
                    isListening
                    ? `${aiName} Listening`
                    : 'Start Talking'
                  }
                </button>
                )
              }
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
