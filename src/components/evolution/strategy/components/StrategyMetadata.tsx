import React from "react";

interface StrategyMetadataProps {
  metadataItems: Array<{
    label: string;
    value: React.ReactNode;
  }>;
}

export const StrategyMetadata: React.FC<StrategyMetadataProps> = ({
  metadataItems,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metadataItems.map((item, index) => (
        <div key={index}>
          <h3 className="text-sm font-medium text-muted-foreground">
            {item.label}
          </h3>
          <p className="mt-1 font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StrategyMetadata;
