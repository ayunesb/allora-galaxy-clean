import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="mb-6 text-xl">Allora Galaxy</header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
