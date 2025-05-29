import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, GitBranch, Edit } from "lucide-react";
import { Plugin } from "@/types/plugin";

interface PluginHeaderProps {
  plugin: Plugin;
  id: string;
}

export const PluginHeader: React.FC<PluginHeaderProps> = ({ plugin, id }) => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            onClick={goBack}
            className="p-0 h-8 group hover:bg-transparent"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
          </Button>
          <h1 className="text-3xl font-bold">{plugin.name}</h1>
          <Badge
            variant={plugin.status === "active" ? "default" : "secondary"}
            className="transition-colors duration-300"
          >
            {plugin.status}
          </Badge>
        </div>
        <p className="text-muted-foreground">{plugin.description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/plugins/${id}/evolution`)}
          className="group transition-all hover:border-primary"
        >
          <GitBranch className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
          Evolution Chain
        </Button>
        <Button
          onClick={() => navigate(`/plugins/${id}/edit`)}
          className="transition-all hover:shadow-md"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Plugin
        </Button>
      </div>
    </div>
  );
};

export default PluginHeader;
