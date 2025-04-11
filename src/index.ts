import http from "http";
import dotenv from "dotenv";
dotenv.config();

import { bot } from "./bot";

bot.launch();

console.log("🤖 is running");

http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
  })
  .listen(Number(process.env.PORT || 3000), "0.0.0.0");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
