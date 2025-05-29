import InspectorChatPanel from "@/components/inspector/InspectorChatPanel";

const InspectorPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inspector Plugin Chat</h1>
      <InspectorChatPanel />
    </div>
  );
};

export default InspectorPage;