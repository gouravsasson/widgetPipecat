import { useEffect, useState } from "react";
import { RTVIClient } from "@pipecat-ai/client-js";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { RTVIClientAudio, RTVIClientProvider } from "@pipecat-ai/client-react";
// import { LLMHelper } from "@pipecat-ai/client-js";
import Videobot from "./Video";
import { useWidgetContext } from "./constexts/WidgetContext";
import axios from "axios";

function App() {
  const [client, setClient] = useState<RTVIClient | null>(null); // Default to null
  const { agent_id, schema } = useWidgetContext();
  const baseurl = `https://app.snowie.ai`;

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const sessionResponse = await axios.post(
          `${baseurl}/api/callsession/create/${agent_id}/`,
          {
            schema_name: schema,
          }
        );

        const sessionId = sessionResponse.data.response;

        const newClient = new RTVIClient({
          params: {
            baseUrl: "https://app.snowie.ai/api/daily-bots/voice-openai",
            requestData: {
              agent_code: "05205088-c530-402b-9fe7-3d5e3f4fb033",
              schema_name: "6af30ad4-a50c-4acc-8996-d5f562b6987f",
              call_session_id: sessionId,
            },
          },
          transport: new DailyTransport(),
          enableCam: true,
          enableMic: true,
        });

        setClient(newClient);
      } catch (error) {
        console.error("Error initializing client:", error);
      }
    };

    initializeClient();
  }, []);

  return (
    <RTVIClientProvider client={client!}>
      <div className="bg-black h-screen">
        <RTVIClientAudio />
        <Videobot />
      </div>
    </RTVIClientProvider>
  );
}

export default App;
