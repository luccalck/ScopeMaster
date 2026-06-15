import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ThemeProvider } from "./app/components/ThemeProvider.tsx";

localStorage.removeItem("scopemaster_authenticated");
localStorage.removeItem("scopemaster_user");

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
    <App />
  </ThemeProvider>
);