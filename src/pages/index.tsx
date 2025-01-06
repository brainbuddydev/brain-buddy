import { useAIStore } from "@/hook/ai-store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";

const Home = () => {

  const { response, loading, error, fetchResponse } = useAIStore();

  const [answer, setAnswer] = useState('Hello!');
  const [command, setCommand] = useState('');
  const [userId, setUserId] = useState('');
  const [aiName, setAiName] = useState('');
  const [firstTime, setFirstTime] = useState(true);
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (window) { 
      const existUserId = sessionStorage.getItem('user_id');
      const existAiName = sessionStorage.getItem('ai_name');

      if(existUserId && existAiName){
        setUserId(existUserId);
        setAiName(existAiName);
        setFirstTime(false);
        const existAnswer =  `Hello! My name is ${existAiName}`;
        setAnswer(existAnswer);

        setTimeout(() => {
          speakText(existAnswer)
        }, 3000)
      }
    }
  }, []);

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

          
          const newTimeoutId = setTimeout( async () => {
            recognitionInstance.stop();


            await fetchResponse({
              user_id: userId,
              command: `Hello ${aiName}, ${command}`,
              ai_name: aiName,
            });

            console.log('Speech recognition stopped due to inactivity.');
          }, 5000); // 5 seconds timeout
          
          setTimeoutId(newTimeoutId); // Store the new timeout ID
        };

        // recognitionInstance.onerror = (event: any) => {
        //   console.error('Speech recognition error', event.error);
        // };

        // recognitionInstance.onend = () => {
        //   setIsListening(false);
        //   console.log('Speech recognition ended');
        // };

        setRecognition(recognitionInstance); // Store the recognition instance
      } else {
        console.error('Speech Recognition is not supported in this browser.');
      }
    }
  }, [timeoutId]); // Include timeoutId in dependency to reset on each change

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if(firstTime){
      const newUserId = Math.random().toString()
      sessionStorage.setItem('user_id', newUserId)
      sessionStorage.setItem('ai_name', aiName);
      setUserId(newUserId);

      const newAnswer = `Hello! My name is ${aiName}`
      setAnswer(newAnswer);
      speakText(newAnswer);
      setFirstTime(false)
    } else {
      await fetchResponse({
        user_id: userId,
        command: `Hello ${aiName}, ${command}`,
        ai_name: aiName,
      });
    }

  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech Synthesis API is not supported in this browser.");
    }

    setIsListening(false);
  };

  const handleStartListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
      setIsListening(!isListening);
    }
  };



  useEffect(() => {
    if(response){
      speakText(response);
    }
  }, [response])

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
            ? 'What would you like to call me?'
            : 'Generate your own AI Buddy! Make your life easier with BrainBuddy'
          }
        </p>
        <form onSubmit={handleSubmit} className="w-1/2">
          <div className="mt-6 flex flex-col gap-8 w-full">
            <input
              type="text"
              placeholder={
                firstTime
                ? 'Please enter my name'
                : 'What can I help you?'
              }
              className="px-8 py-6 rounded-full outline-none text-black"
              onChange={firstTime ? (e) => setAiName(e.target.value) : (e) => setCommand(e.target.value)}
            />

            <div className="flex justify-center gap-2">
              <button
                className="px-4 py-3 bg-black text-white rounded-full flex gap-2 items-center justify-between"
                type="submit"
                disabled={loading}
              > 
                Submit
                  <Image 
                  src="/left-arrow.png"
                  alt=""
                  width={32}
                  height={32}
                  /> 
              </button>
              {
                !firstTime && (
                  <button
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
