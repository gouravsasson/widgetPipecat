import {
  useRTVIClient,
  RTVIClientVideo,
  useRTVIClientTransportState,
} from "@pipecat-ai/client-react";
import { useState, useEffect } from "react";
import { LLMHelper, LLMContextMessage } from "@pipecat-ai/client-js";
import { VoiceVisualizer } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Send,
  Monitor as MonitorShare,
  X,
  // Maximize2,
  // Settings,
  // Camera,
  // Sparkles,
} from "lucide-react";
import { useWidgetContext } from "./constexts/WidgetContext";
import axios from "axios";
import useSessionStore from "./store/session";

type TranscriptData = {
  text: string;
  final: boolean;
  timestamp: string;
  user_id: string;
};

function Videobot() {
  const client = useRTVIClient();
  const [value, setValue] = useState("");
  const [llmHelper, setLLMHelper] = useState<LLMHelper | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const { agent_id, schema } = useWidgetContext();
  const [userTranscription, SetuserTranscription] = useState<TranscriptData>();
  console.log(userTranscription);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const baseURL = `https://app.snowie.ai`;
  // const schema = "6af30ad4-a50c-4acc-8996-d5f562b6987f";
  const transportState = useRTVIClientTransportState();
  const {
    setSessionId,
    sessionId,
    setTransport,
    setIsConnected,
    isConnected,
    transcription,
    setTranscription,
    setRefresh,
    refresh,
  } = useSessionStore();
  useEffect(() => {
    if (transportState) {
      setTransport(transportState);
    }
  }, [transportState]);

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setShowPulse((prev) => !prev);
    }, 3000);

    const expandTimer = setTimeout(() => {
      setIsExpanded(true);
      setTimeout(() => setIsExpanded(false), 1000);
    }, 1000);

    return () => {
      clearInterval(pulseTimer);
      clearTimeout(expandTimer);
    };
  }, []);

  const handleConnect = async () => {
    if (isConnected || !client) return;
    try {
      await client.connect();
      setIsConnected(true);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect. Please try again.");
    }
  };

  const handleDisconnect = async () => {
    if (!isConnected || !client) return;
    try {
      await axios.post(`${baseURL}/api/end_call_session/`, {
        call_session_id: sessionId,
        schema_name: schema,
      });
      setSessionId(null);
      await client?.disconnect();
      setIsConnected(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Disconnection error:", error);
      alert("Failed to disconnect. Please try again.");
    }
  };

  const handelScreenShare = async () => {
    if (!isConnected || !client) return;
    try {
      await client.enableScreenShare(true);
    } catch (error) {
      console.error("Screen share error:", error);
      alert("Failed to share screen. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
      setValue("");
    }
  };

  client?.on(RTVIEvent.UserTranscript, (data) => {
    SetuserTranscription(data);
  });

  client?.on(RTVIEvent.BotTranscript, (data) => {
    console.log("Bot Transcript:", data);
  });

  const sendTextMessage = async () => {
    const llmHelper = client?.getHelper("llm") as LLMHelper;
    try {
      await llmHelper.appendToMessages(
        {
          role: "user",
          content: value,
        },
        true // or true, depending on whether you want to run immediately
      );
      setValue("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className={`group/widget relative flex flex-col w-full max-w-md mx-auto h-fit 
      bg-white/[0.02] backdrop-blur-md
      rounded-2xl overflow-hidden
      shadow-[0_8px_32px_rgba(0,0,0,0.2)]
      border border-white/[0.05]
      transition-all duration-500
      ${isExpanded ? "scale-105" : "scale-100"}
      hover:shadow-[0_12px_48px_rgba(59,130,246,0.2)]
      hover:border-white/[0.08]
      before:absolute before:inset-0
      before:bg-gradient-to-br before:from-white/[0.08] before:to-white/[0.02]
      before:pointer-events-none`}
    >
      {/* Glass Gradient Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,107,158,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_15s_linear_infinite]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_50%)] animate-pulse" />

      {/* Glass Video Container */}
      <div className="relative w-full aspect-[16/9] bg-black/20 overflow-hidden group/video">
        <RTVIClientVideo
          participant="local"
          fit="cover"
          mirror
          className="w-full h-full object-cover"
        />

        {/* Glass Voice Visualizer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <VoiceVisualizer
            participantType="local"
            backgroundColor="rgba(255, 255, 255, 0.03)"
            barColor="rgba(96, 165, 250, 0.9)"
            barGap={2}
            barWidth={2}
            barMaxHeight={24}
            // className="px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/[0.08]
            //   shadow-[0_4px_16px_rgba(0,0,0,0.1)]
            //   hover:border-white/[0.15] transition-all duration-300"
          />
        </div>

        {/* Glass Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />
      </div>

      {/* Glass Controls */}
      <div
        className="relative flex items-center justify-center gap-4 p-4 
        bg-white/[0.03] backdrop-blur-md border-t border-white/[0.05]"
      >
        <button
          onClick={handleConnect}
          disabled={isConnected || !client}
          className={`p-3.5 rounded-xl transition-all duration-300 relative
            hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
            ${
              isConnected
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400/90"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400/90"
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isConnected ? <VideoOff size={22} /> : <Video size={22} />}
          {!isConnected && showPulse && (
            <span className="absolute -right-1 -top-1 w-3 h-3 bg-emerald-400/90 rounded-full animate-ping" />
          )}
        </button>
        {/* <button
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isConnected}
          className={`p-3.5 rounded-xl transition-all duration-300
            hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
            ${
              isConnected
                ? isMuted
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400/90"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400/90"
                : "bg-white/[0.03] text-white/30 cursor-not-allowed"
            }`}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button> */}
        <button
          onClick={handelScreenShare}
          disabled={!isConnected}
          className={`p-3.5 rounded-xl transition-all duration-300
            hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
            ${
              isConnected
                ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400/90"
                : "bg-white/[0.03] text-white/30 cursor-not-allowed"
            }`}
        >
          <MonitorShare size={22} />
        </button>
        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          className={`p-3.5 rounded-xl transition-all duration-300
            hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
            ${
              isConnected
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400/90"
                : "bg-white/[0.03] text-white/30 cursor-not-allowed"
            }`}
        >
          <X size={22} />
        </button>
      </div>

      {/* Glass Chat Container */}
      {/* <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const isBot = msg.startsWith("Bot:");
          return (
            <div
              key={index}
              className={`flex ${
                isBot ? "justify-start" : "justify-end"
              } group/message`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm transition-all duration-300
                  hover:scale-[1.02] ${
                    isBot
                      ? "bg-white/[0.03] text-white/90 hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
                      : "bg-white/[0.05] text-white/90 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]"
                  }`}
              >
                {msg}
              </div>
            </div>
          );
        })}
      </div> */}

      {/* Glass Message Input */}
      <div className="p-4 bg-white/[0.03] backdrop-blur-md border-t border-white/[0.05]">
        <div className="flex gap-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-white/[0.03] text-white/90 placeholder-white/40 text-sm 
              rounded-xl px-4 py-3 resize-none h-[45px] min-h-[45px] max-h-[120px] 
              focus:outline-none focus:ring-2 focus:ring-white/[0.1] 
              border border-white/[0.05] hover:border-white/[0.1]
              transition-all duration-300"
          />
          <button
            onClick={sendTextMessage}
            disabled={!isConnected}
            className={`p-3 rounded-xl transition-all duration-300
              hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
              ${
                isConnected
                  ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400/90"
                  : "bg-white/[0.03] text-white/30 cursor-not-allowed"
              }`}
          >
            <Send size={22} />
          </button>
        </div>
      </div>

      {/* Glass Corner Decorations */}
      <div
        className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.05] to-transparent 
        blur-3xl pointer-events-none opacity-50 animate-pulse"
      />
      <div
        className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/[0.05] to-transparent 
        blur-2xl pointer-events-none opacity-30 animate-pulse"
      />
    </div>
  );
}

export default Videobot;
