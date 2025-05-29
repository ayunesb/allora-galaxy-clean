import { useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export const useInspectorChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const newMsg: Message = { role: "user", content };
    setMessages((msgs) => [...msgs, newMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/inspector/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { role: "ai", content: data.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
