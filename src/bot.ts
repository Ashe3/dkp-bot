import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { api } from "./api";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

// on "/start" command
bot.start(async (ctx) => {
  const telegramId = ctx.from.id;

  try {
    const res = await api.get(`/users/${telegramId}`);
    if (res.data) return ctx.reply("You are already registered.");
  } catch (error) {
    return ctx.reply("Something went wrong. Please try again later.");
  }

  ctx.reply("Welcome! Please register by sending your nickname.");
});

// on text message
bot.on(message("text"), async (ctx, next) => {
  const telegramId = ctx.from.id;
  const username = ctx.message.text.trim();

  if (username.startsWith("/")) return next();

  if (username.length < 3) {
    return ctx.reply("Username must be at least 3 characters long.");
  }

  try {
    await api.post("/users", {
      telegramId,
      username,
    });
    ctx.reply("You have been registered successfully.");
  } catch (error) {
    ctx.reply("Unable to register. Please try again later.");
  }
});

// on "/bs" command
bot.command("bs", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const bs = parseInt(args[1]);
  const telegramId = ctx.from.id;

  if (isNaN(bs)) return ctx.reply("Example command: /bs 100000");

  try {
    await api.patch(`/users/${telegramId}`, { bs });
    ctx.reply(`Your BS has been updated to ${bs}.`);
  } catch {
    ctx.reply("Unable to update BS. Please try again later.");
  }
});

// on "/dkp" command
bot.command("dkp", async (ctx) => {
  const telegramId = ctx.from.id;

  try {
    const res = await api.get(`/users/${telegramId}`);
    const { dkp, multiplier, username } = res.data;
    ctx.reply(`${username}\nYour DKP: ${dkp}\nMultiplier: ${multiplier}`);
  } catch {
    ctx.reply("Unable to fetch DKP. Please try again later.");
  }
});

// /claim ABC12
bot.command("claim", async (ctx) => {
  const telegramId = ctx.from.id;
  const code = ctx.message.text.split(" ")[1]?.toUpperCase();
  if (!code) return ctx.reply("Example: /claim ABC12");

  try {
    const res = await api.post("/claim", {
      telegramId,
      code,
    });
    ctx.reply(`Claimed code: ${res.data.code}\nAmount: ${res.data.amount}`);
  } catch {
    ctx.reply("Unable to claim code. Please try again later.");
  }
});

// /history
bot.command("history", async (ctx) => {
  const telegramId = ctx.from.id;
  try {
    const res = await api.get(`/users/${telegramId}/history`);
    const msg =
      res.data
        .map(
          (e: any) =>
            `${e.amount >= 0 ? "+" : ""}${e.amount} DKP — ${e.event.title}`
        )
        .join("\n") || "No history found.";
    ctx.reply(msg);
  } catch {
    ctx.reply("Unable to fetch history. Please try again later.");
  }
});

// /help
bot.command("help", (ctx) => {
  ctx.reply(`Available commands:
		/start — Register with your nickname
		/bs <number> — Update your BS (battle strength)
		/dkp — View your DKP and multiplier
		/claim <code> — Claim DKP using an event code
		/history — Show your last DKP events
		/help — Show this help message`);
});

bot.catch((err, ctx) => {
  console.error("Error occur:", err);
  ctx.reply("Something went wrong. Please try again later.");
});
