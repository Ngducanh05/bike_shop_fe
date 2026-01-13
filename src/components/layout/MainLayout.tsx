import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Page } from "../motion";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-48 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-6xl px-4 py-8">
        <Page>
          <Outlet />
        </Page>
      </main>

      <Footer />
    </div>
  );
}
