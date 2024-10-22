const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ 🐐 | V2 ]"; // Keep this unchanged as per original note

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "NTKhang", // original author Kshitiz
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands",
    },
    longDescription: {
      en: "View command usage and list all available commands.",
    },
    category: "info",
    guide: {
      en: "{pn} /help [commandName]",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `🌐 BIREYY--->🐉💙 COMMAND LIST 🌐`; // Replace this header with your bot name

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      // Looping through categories to create formatted output
      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭─── ${category.toUpperCase()} ───╮`;

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((item) => `🔹 ${item}`);
            msg += `\n│ ${cmds.join(" ".repeat(Math.max(1, 15 - cmds.join("").length)))}`;
          }

          msg += `\n╰────────────────────╯`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n\n💡 The bot currently has ${totalCommands} commands available.`;
      msg += `\nType -help [command]' to get details on a specific command.`;
      msg += `\n🛠 Created by: 🐐 | DEV.BIRENDRA`; // Personal signature

      const helpListImages = [
        "https://i.ibb.co/S3nbYhY/image.jpg"
      ];

      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage),
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`⚠️ Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";
        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description available" : "No description available";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{pn}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭── COMMAND DETAILS ──⭓
│ 📝 Name: ${configCommand.name}
│ 🔍 Description: ${longDescription}
│ 💡 Aliases: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}
│ ⚙️ Version: ${configCommand.version || "1.0"}
│ 🛡️ Role Required: ${roleText}
│ ⏳ Cooldown: ${configCommand.countDown || 1}s
│ ✒️ Author: ${author}
╰───────────────────⭓

📚 **Usage**:
${usage}

💬 **Notes**:
- Text in <XXXXX> should be replaced.
- Text in [a|b|c] indicates options.`;

        await message.reply(response);
      }
    }
  },
};

// Helper function to convert role level to text
function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "All users";
    case 1:
      return "Group administrators";
    case 2:
      return "Bot administrators";
    default:
      return "Unknown role";
  }
      }
