```tsx
import Sidebar from "@/components/Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-4">
        {children} {/* <- Ensure this exists */}
      </main>
    </div>
  );
}
```