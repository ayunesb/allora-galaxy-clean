import { useInspectorChat } from "@/hooks/useInspectorChat";

const InspectorChatPanel = () => {
  const { messages, sendMessage, loading } = useInspectorChat();

  return (
    <div className="p-4 bg-muted rounded-xl h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-md ${msg.role === "user" ? "bg-primary text-white" : "bg-background"}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const input = form.elements.namedItem("prompt") as HTMLInputElement;
          sendMessage(input.value);
          input.value = "";
        }}
        className="flex gap-2 mt-4"
      >
        <input name="prompt" className="flex-1 p-2 rounded-md border" placeholder="Ask the Inspector..." />
        <button disabled={loading} type="submit" className="px-4 py-2 bg-primary text-white rounded-md">
          Send
        </button>
      </form>
    </div>
  );
};

export default InspectorChatPanel;
