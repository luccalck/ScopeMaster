import { Outlet } from "react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout() {
  // Controla a visibilidade da sidebar em telas pequenas (drawer overlay).
  // Em desktop (md+) a sidebar é sempre visível.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedFont = localStorage.getItem("scopemaster_font_family") || "Inter";
    const savedSize = localStorage.getItem("scopemaster_font_size") || "16";

    document.documentElement.style.setProperty("--font-size", `${savedSize}px`);
    document.documentElement.style.fontFamily = savedFont === "Inter"
      ? "Inter, sans-serif"
      : savedFont === "Roboto"
      ? "Roboto, sans-serif"
      : savedFont === "Outfit"
      ? "Outfit, sans-serif"
      : "serif";
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar — fixa em desktop, drawer em mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
