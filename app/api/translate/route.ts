import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const p = prompt.toLowerCase();

  // Simulate AI "thinking" time
  await new Promise((resolve) => setTimeout(resolve, 800));

  let command = "";

  // 1. DANGEROUS COMMANDS (Triggers Red Warning)
  if (
    p.includes("delete") ||
    p.includes("remove") ||
    p.includes("kill") ||
    p.includes("format") ||
    p.includes("wipe")
  ) {
    command = "WARNING: rm -rf /target_directory";
  }
  // 2. SAFE COMMANDS
  else if (p.includes("find") && p.includes("pdf")) {
    command = "find . -type f -name '*.pdf'";
  } else if (p.includes("update")) {
    command = "sudo apt update && sudo apt upgrade -y";
  } else if (p.includes("docker")) {
    command = "docker ps -a";
  } else if (p.includes("git")) {
    command = "git push origin main";
  } else {
    // Default fallback for testing
    command = "ls -la";
  }

  return NextResponse.json({ command });
}
