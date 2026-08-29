export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export interface QuickPrompt {
  id: string;
  title: string;
  query: string;
}
