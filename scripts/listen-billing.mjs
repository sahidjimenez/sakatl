import fs from "node:fs";
import { spawn } from "node:child_process";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.STRIPE_SECRET_KEY?.includes("_test_")) throw new Error("Local forwarding is test-only.");
const child = spawn("npx.cmd", ["--yes", "@stripe/cli", "listen", "--forward-to", "http://localhost:3015/api/billing/webhook"], { shell: true, env: { ...process.env, STRIPE_API_KEY: process.env.STRIPE_SECRET_KEY }, windowsHide: true });
let buffer = "";
function consume(data) {
  const value = data.toString(); buffer += value;
  const match = buffer.match(/whsec_[A-Za-z0-9]+/);
  if (match) {
    let local = fs.readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>!l.startsWith("STRIPE_WEBHOOK_SECRET=")).join("\n");
    fs.writeFileSync(".env.local",local+`\nSTRIPE_WEBHOOK_SECRET=${JSON.stringify(match[0])}\n`);
    console.log("Webhook forwarding ready. Signing secret saved locally."); buffer="";
  }
  // Never print CLI output containing credentials or authorization links.
  for (const line of value.split(/\r?\n/)) if (/\[\d{3}\].*POST/.test(line)) console.log(line.replace(/\x1b\[[0-9;]*m/g,""));
}
child.stdout.on("data",consume);child.stderr.on("data",consume);
child.on("exit",code=>{console.log(`Stripe listener exited: ${code}`);process.exitCode=code??1;});
