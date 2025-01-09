import { useAIStore } from "@/hook/ai-store";
import gsap from "gsap";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { ReactTyped } from "react-typed";
import React from "react";

const Home = () => {
  const { response, loading, error, fetchResponse } = useAIStore();

  const [answer, setAnswer] = useState("Hello!");
  const [command, setCommand] = useState("");
  const [userId, setUserId] = useState("");
  const [aiName, setAiName] = useState("");
  const [firstTime, setFirstTime] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const commandRef = useRef<string>("");

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
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US"; // Set the language
      recognition.interimResults = true; //Capture only final results
      recognition.continuous = false;
      recognition.onstart = () => {
        setIsListening(true);
        console.log("Voice recognition started...");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";

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
        setCommand(transcript);
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

  useGSAP(() => {

    const radius = 400; // Radius of the orbit
    const centerX = 0; // X center of the orbit
    const centerY = 0; // Y center of the orbit


    gsap.to("#circle1", {
      rotation: 360, // Rotate the circle 360 degrees
      duration: 50, // Time for one full rotation
      repeat: -1, // Infinite looping
      ease: "linear", // Smooth and continuous rotation
    });

    gsap.to("#circle2", {
      rotation: 360, // Rotate the circle 360 degrees
      duration: 30, // Time for one full rotation
      repeat: -1, // Infinite looping
      ease: "linear", // Smooth and continuous rotation
    });

    gsap.to("#blur-circle", {
      duration: 20,
      repeat: -1,
      ease: "linear",
      onUpdate: function () {
        const progress: string = gsap.getProperty(this, "progress").toString(); // Progress from 0 to 1
        const angle = parseFloat(progress) * Math.PI * 2; // Convert progress to radians
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        gsap.set("#blur-circle", { x, y });
      },
    });

    gsap.to("#blur-circle2", {
      duration: 18,
      repeat: -1,
      ease: "linear",
      opacity: 1,
      yoyo: true
    })
  }, []);

  return (
    <div className="grainy-background overflow-hidden">
      <div className="min-h-screen flex flex-col text-white max-w-[1200px] my-0 mx-auto">
        <div className="header p-[40px] flex items-center justify-between">
          <h1 className="text-4xl">BrainBuddy</h1>
          <div className="flex gap-4">
            <h6>Twitter</h6>
            <h6>Telegram</h6>
            <h6>Dex Screener</h6>
          </div>
        </div>
        <div className="home grow flex flex-row justify-center items-center">

          <div className="flex basis-1/2 relative h-[720px]">
            <img
              className="absolute top-[10%] left-[-10%] w-[656px] opacity-[0.6]"
              id="circle1"
              src="/orbit-circle.png"
            />
            <img
              className="absolute bottom-[14%] left-[-2%]"
              id="circle2"
              src="/orbit-circle.png"
            />
            <img             
              className="absolute blur-[180px] bottom-[25%] left-[6%] w-[1000px] z-0"
              src="/green-circle.png"
              id="blur-circle"
            />
              <img className="absolute top-[-1%] left-[-2%]" src="/robot-head.png" style={{width: '600px'}}  />
              <img             
              className="absolute blur-[140px] bottom-[-14%] left-[103%] w-[1000px] z-0 opacity-[0] overflow-hidden"
              src="/green-circle.png"
              id="blur-circle2"
              />
          </div>

          <div className="flex basis-1/2 flex-col items-center justify-center relative z-[1000]">
            <h2 className="text-6xl font-bold text-white text-center">
              <ReactTyped strings={[answer]} typeSpeed={50} startDelay={1000} />
            </h2>
            <p className="m-0 p-0 my-6 font-light text-xl text-center">
              {firstTime
                ? "What would you like to call me?"
                : "Generate your own AI Buddy! Make your life easier with BrainBuddy"}
            </p>
            <form className="w-1/2">
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
                  {!firstTime && (
                    <button
                      type="button"
                      className="px-4 py-3 bg-black text-white rounded-full flex gap-2 items-center justify-between"
                      onClick={handleStartListening}
                      disabled={loading}
                    >
                      {isListening ? `${aiName} Listening` : "Start Talking"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

        </div>
        <div className="about flex flex-col justify-center items-center">
          <h1 className="highlighted-text-shadow">Who is BrainBuddy?</h1>
          <div className="about-container">
            <div className="about-text">
              <div className="card3">
                $BB is an AI Personal Assistant of the future. It’s more than just
                a tool—it’s your digital companion, always ready to help you with
                anything you need. From answering questions to managing tasks,
                BrainBuddy is designed to think, adapt, and grow with you. With
                BrainBuddy, the possibilities are endless. Customize its
                personality, voice, and tone to create an assistant that feels
                like a true reflection of you. As you interact, BrainBuddy learns
                and evolves, becoming smarter and more intuitive with every
                conversation. It’s not just about getting things done—it’s about
                experiencing a seamless, intelligent connection that understands
                you like no other. With BrainBuddy, the future of AI is here, and
                it’s personal, smart, and always by your side.
              </div>
            </div>
          </div>
          <div className="ca-address mb-[100px]">
            <button className="shiny-cta">
              <span>CA : 9geNBCEuk1iUqMM9ru23a8yhNVCVkN5BN5NNvrdjpump</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Home;
