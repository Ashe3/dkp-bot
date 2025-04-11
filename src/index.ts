import http from "http";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

import { bot } from "./bot";
const app = express();

const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  bot.launch();
  console.log("🤖 Bot launched in polling mode (development)");
} else {
  app.use(bot.webhookCallback("/webhook"));

  bot.telegram
    .setWebhook(`${process.env.WEBHOOK_URL}/webhook`)
    .then(() => console.log("✅ Webhook set"))
    .catch((err) => console.error("❌ Failed to set webhook", err));
}

app.get("/", (_, res) => {
  res.send("Telegram bot (Webhook mode) is active");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
