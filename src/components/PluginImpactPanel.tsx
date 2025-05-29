import { usePluginFeedback } from "@/hooks/usePluginFeedback";

// ...existing code...

const feedback = usePluginFeedback(plugin.id);

return (
  // ...existing code...
  {feedback.map(entry => (
    <Card key={entry.id}>
      <p>{entry.message}</p>
      <Badge>{entry.sentiment}</Badge>
    </Card>
  ))}
  // ...existing code...
);

// ...existing code...