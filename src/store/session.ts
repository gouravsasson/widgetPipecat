import { create } from "zustand";

// Zustand store for session state management
const useSessionStore = create((set) => ({
  sessionId: null, // Initial value of sessionId
  isConnected: false, // Connection state
  transport: null, // Transport state
  refresh: false, // Refresh state
  transcription: "", // Transcription state

  // Setter functions
  setSessionId: (id) => set({ sessionId: id }),
  setIsConnected: (status) => set({ isConnected: status }),
  setTransport: (transportType) => set({ transport: transportType }),
  setRefresh: (status) => set({ refresh: status }),
  setTranscription: (text) => set({ transcription: text }), // Setter for transcription

  // Getter functions
  getSessionId: () => useSessionStore.getState().sessionId,
  getIsConnected: () => useSessionStore.getState().isConnected,
  getTransport: () => useSessionStore.getState().transport,
  getRefresh: () => useSessionStore.getState().refresh,
  getTranscription: () => useSessionStore.getState().transcription, // Getter for transcription
}));

export default useSessionStore;
