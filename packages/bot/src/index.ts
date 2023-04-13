import { dirname, importx } from "@discordx/importer";
import { ActivityType, Interaction } from "discord.js";
import { Client } from "discordx";
import env from "./env.js";
import { trpc } from "./trpc.js";
import { scheduleJob } from "node-schedule";

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [],

  // Debug logs are disabled in silent mode
  silent: false,
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log("Bot started");

  scheduleJob("Update Presence", "*/15 * * * *", async () => {
    const { online, playerCount } = await trpc.playerCount.query();

    if (!online) {
      bot.user?.setPresence({
        activities: [
          {
            type: ActivityType.Watching,
            name: "Mineplex is offline",
          },
        ],
      });
    } else {
      bot.user?.setPresence({
        activities: [
          {
            type: ActivityType.Watching,
            name: `Mineplex player count: ${playerCount}`,
          },
        ],
      });
    }
  });
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

async function run() {
  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Log in with your bot token
  await bot.login(env.BOT_TOKEN);
}

void run();
