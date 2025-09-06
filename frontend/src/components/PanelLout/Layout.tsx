import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-background flex w-full">
      
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet /> {/* ✅ nested route content goes here */}
      </main>
    </div>
  );
}
