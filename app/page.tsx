"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Terminal,
  Loader2,
  ArrowUpDown,
  LogOut,
  Github,
  AlertTriangle,
  Globe,
  User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"gen" | "explain">("gen");
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // New State: Toggle between Global feed and User history
  const [historyView, setHistoryView] = useState<"global" | "mine">("global");

  // --- AUTH & DATA FETCHING ---
  const fetchHistory = async (
    view: "global" | "mine" = "global",
    currentUser?: User | null
  ) => {
    const supabase = createClient();
    let query = supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10); // Increased limit to 10

    // If "Mine" is selected and we have a user, filter by ID
    if (view === "mine" && currentUser) {
      query = query.eq("user_id", currentUser.id);
    }

    const { data } = await query;
    if (data) setHistory(data);
  };

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      // Initial fetch: Global
      fetchHistory("global", user);
    };

    init();
  }, []);

  // Re-fetch whenever the view changes
  useEffect(() => {
    fetchHistory(historyView, user);
  }, [historyView, user]);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setHistoryView("global"); // Reset to global on logout
  };
  // -----------------------------

  const handleTranslate = async () => {
    if (!input) return;
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ prompt: input, mode, userId: user?.id }),
      });
      const data = await res.json();
      setOutput(data.command);
      // Refresh the current view
      fetchHistory(historyView, user);
    } catch (err) {
      console.error(err);
      setOutput("# Error processing request");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "gen" ? "explain" : "gen");
    setInput("");
    setOutput("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center p-4 font-mono selection:bg-purple-500/30 relative overflow-hidden">
      {/* --- NAVBAR --- */}
      <nav className="w-full max-w-5xl flex justify-between items-center py-6 mb-8 z-50">
        <div className="flex items-center gap-2">{/* Logo placeholder */}</div>

        <div>
          {user ? (
            <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-1.5 pr-4 rounded-full backdrop-blur-md shadow-xl">
              <img
                src={user.user_metadata.avatar_url}
                alt="User"
                className="w-8 h-8 rounded-full border border-slate-700"
              />
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                {user.user_metadata.user_name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-400 transition-colors ml-2"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-4 py-2 rounded-full text-sm font-medium transition-all hover:border-purple-500/50"
            >
              <Github size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div
          className={`absolute top-[-10%] left-[20%] w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000 ${
            (output || "").startsWith("WARNING:") ||
            (output || "").startsWith("⚠️")
              ? "bg-red-600/20"
              : "bg-purple-600/20"
          }`}
        />
        <div className="absolute bottom-[-10%] right-[20%] w-96 h-96 rounded-full blur-[100px] bg-blue-600/10" />
      </div>

      <div className="max-w-2xl w-full space-y-8 z-10">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Shell-AI
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <span>{mode === "gen" ? "Natural Language" : "Bash Command"}</span>
            <ArrowUpDown size={14} />
            <span>{mode === "gen" ? "Linux Terminal" : "Plain English"}</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 relative">
          <button
            onClick={toggleMode}
            className="absolute right-4 top-4 bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-colors z-10 border border-slate-700 group"
          >
            <ArrowUpDown
              size={18}
              className={`transition-transform duration-500 ${
                mode === "explain"
                  ? "rotate-180 text-blue-400"
                  : "text-purple-400"
              }`}
            />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "gen"
                ? "e.g., Find all PDF files larger than 10MB..."
                : "e.g., tar -xzvf archive.tar.gz"
            }
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg placeholder:text-slate-600 resize-none h-32 pr-16"
          />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleTranslate();
            }}
            disabled={loading}
            className={`touch-manipulation w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 ${
              mode === "gen"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                : "bg-gradient-to-r from-blue-600 to-teal-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Terminal size={20} />
            )}
            {loading
              ? mode === "gen"
                ? "Translating..."
                : "Analyzing..."
              : mode === "gen"
              ? "Generate Command"
              : "Explain Command"}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className={`absolute -inset-0.5 rounded-xl opacity-30 blur transition duration-1000 ${
                output.startsWith("WARNING:") || output.startsWith("⚠️")
                  ? "bg-red-600"
                  : mode === "gen"
                  ? "bg-purple-600"
                  : "bg-blue-600"
              }`}
            ></div>

            <div
              className={`relative bg-black border rounded-xl p-6 font-mono shadow-2xl transition-colors duration-500 ${
                output.startsWith("WARNING:") || output.startsWith("⚠️")
                  ? "border-red-500 text-red-400"
                  : "border-slate-800 text-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-xs uppercase tracking-widest">
                  {output.startsWith("WARNING:")
                    ? "⚠️ DANGER DETECTED"
                    : mode === "gen"
                    ? "Bash Output"
                    : "Explanation"}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      output.replace("WARNING: ", "")
                    );
                    alert("Copied!");
                  }}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="text-lg break-all whitespace-pre-wrap">
                <span
                  className={`mr-2 ${
                    output.startsWith("WARNING:") || output.startsWith("⚠️")
                      ? "text-red-500"
                      : "text-purple-500"
                  }`}
                >
                  {mode === "gen" && !output.startsWith("WARNING:")
                    ? "$"
                    : "💡"}
                </span>
                {output.replace("WARNING: ", "")}
              </div>

              {(output.startsWith("WARNING:") || output.startsWith("⚠️")) && (
                <div className="mt-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg flex items-start gap-3">
                  <AlertTriangle
                    className="text-red-500 shrink-0 mt-0.5"
                    size={18}
                  />
                  <div>
                    <h4 className="text-red-400 font-bold text-sm">
                      Proceed with Caution
                    </h4>
                    <p className="text-red-300/80 text-xs mt-1 leading-relaxed">
                      This command can permanently modify or delete files.
                      Double-check your target directory before running.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- RECENT ACTIVITY WITH TABS --- */}
        <div className="w-full mt-12">
          <div className="flex items-center justify-between mb-4 pl-2">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
              Recent Activity
            </h3>

            {/* Tabs */}
            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setHistoryView("global")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  historyView === "global"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe size={12} />
                Global
              </button>
              <button
                onClick={() => setHistoryView("mine")}
                disabled={!user}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  historyView === "mine"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                title={!user ? "Sign in to see your history" : ""}
              >
                <UserIcon size={12} />
                My History
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors group"
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-400 text-sm truncate max-w-[300px]">
                      {item.prompt}
                    </p>
                    <p
                      className={`font-mono text-xs mt-1 truncate ${
                        item.command.startsWith("WARNING:")
                          ? "text-red-400"
                          : "text-purple-400"
                      }`}
                    >
                      {item.command}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        item.command.replace("WARNING: ", "")
                      );
                      alert("Copied!");
                    }}
                    className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    title="Copy Command"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">
                {historyView === "mine"
                  ? "You haven't generated any commands yet."
                  : "No global history found."}
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <footer className="mt-16 pb-8 text-center text-slate-600 text-sm">
          <p className="mb-3">
            Built by{" "}
            <span className="text-purple-400 font-semibold">Victor</span>.
          </p>
          <div className="flex justify-center items-center gap-6">
            <a
              href="https://selar.com/0166wo0x69"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-300"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">
                ☕
              </span>
              <span className="group-hover:text-yellow-400 font-medium">
                Buy me a coffee
              </span>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
