import dotenv from "dotenv";
dotenv.config();

import { bot } from "./bot";

bot.launch();

console.log("🤖 is running");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
