import React from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const Footer: React.FC = () => {
  const { tenant } = useWorkspace();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>
          © {year} {tenant?.name || "Allora OS"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
