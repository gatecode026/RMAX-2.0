/**
 * Checks outbound SMTP from THIS machine / deployment:  npm run mail:check [-- you@example.com]
 * Without an argument it only verifies connection + login. With an address it also sends a test message.
 */
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { getMailConfig, missingMailEnv } from "../src/lib/mail/config";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

async function main() {
  const missing = missingMailEnv();
  const cfg = getMailConfig();
  if (!cfg) {
    console.error(`Missing or invalid settings: ${missing.join(", ") || "ADMIN_NOTIFICATION_EMAIL has no valid address"}`);
    process.exit(1);
  }
  const t = nodemailer.createTransport({ host: cfg.host, port: cfg.port, secure: cfg.secure, requireTLS: cfg.requireTLS, auth: { user: cfg.user, pass: cfg.pass }, connectionTimeout: 10_000 });
  await t.verify();
  console.log(`OK: connected to ${cfg.host}:${cfg.port} (${cfg.secure ? "TLS" : "STARTTLS"}) and logged in.`);
  const to = process.argv[2];
  if (to) {
    const info = await t.sendMail({ from: cfg.from, to, replyTo: cfg.replyTo, subject: "RMAX mail check", text: "SMTP is working." });
    console.log(`Test message accepted: ${info.messageId}`);
  }
}
main().catch((e) => {
  console.error(`FAILED: ${(e as { code?: string }).code ?? "error"} ${(e as { responseCode?: number }).responseCode ?? ""} (${(e as { command?: string }).command ?? "-"})`);
  process.exit(1);
});
