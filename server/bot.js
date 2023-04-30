const fs = require("fs");
const path = require("node:path");
const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  ActivityType,
} = require("discord.js");
const botToken = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the folder
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  // Grab all the SlashCommandBuilders from the command files
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ("data" in command && "execute" in command)
      client.commands.set(command.data.name, command);
    else
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
  }
}

// When the bot is ready, set its activity and status
client.once(Events.ClientReady, () => {
  // Set the bot's activity to "Playing /help"
  // Set the bot's status to "online"
  client.user.setPresence({
    activities: [
      {
        name: "/help",
        type: ActivityType.Playing,
      },
    ],
    status: "online",
  });
});

// When a user sends a message, check if it starts with the prefix
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }

  console.log(interaction);
});

client.login(botToken);
