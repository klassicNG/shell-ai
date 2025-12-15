"use client";

import { useState } from "react";
import { Copy, Terminal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input) return;
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setOutput(data.command);
    } catch (err) {
      setOutput("# Error processing request");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert("Copied to clipboard!"); // Simple alert for MVP
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 font-mono selection:bg-purple-500/30">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Shell-AI
          </h1>
          <p className="text-slate-500">Natural Language to Linux Terminal</p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Find all PDF files larger than 10MB and delete them..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg placeholder:text-slate-600 resize-none h-32"
          />

          <button
            onClick={handleTranslate}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Terminal size={20} />
            )}
            {loading ? "Translating..." : "Generate Command"}
          </button>
        </div>

        {/* Output Terminal */}
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-30 blur group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black border border-slate-800 rounded-xl p-6 font-mono text-green-400 shadow-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-xs uppercase tracking-widest">
                  Bash Output
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="text-lg break-all">
                <span className="text-purple-500 mr-2">$</span>
                {output}
                <span className="animate-pulse inline-block w-2 h-5 bg-green-400 ml-1 align-middle"></span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
