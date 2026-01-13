// src/App.tsx
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { bootstrapAuth } from "./services/auth.bootstrap";

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await bootstrapAuth();
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
