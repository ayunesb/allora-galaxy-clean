import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AgentVersionTabs({ agentTypes, current, setCurrent }: {
  agentTypes: string[];
  current: string;
  setCurrent: (type: string) => void;
}) {
  return (
    <Tabs value={current} onValueChange={setCurrent}>
      <TabsList>
        {agentTypes.map((type) => (
          <TabsTrigger key={type} value={type}>
            {type}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
