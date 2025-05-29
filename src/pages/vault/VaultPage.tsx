import React from "react";
import VaultGraph from "@/components/vault/VaultGraph";

export default function VaultPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Vault</h1>
      <p className="text-muted-foreground">
        Archive of all past strategies, plugins, and agent logs.
      </p>
      <VaultGraph />
    </div>
  );
}
