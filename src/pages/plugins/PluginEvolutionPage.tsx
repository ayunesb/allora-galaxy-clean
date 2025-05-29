import React from "react";
import { useParams } from "react-router-dom";

const PluginEvolutionPage: React.FC = () => {
  const { id } = useParams();
  return <div>Plugin Evolution Page for Plugin ID: {id}</div>;
};

export default PluginEvolutionPage;