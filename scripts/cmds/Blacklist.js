const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "blacklist",
    aliases: ["bl"],
    version: "2.0",
    author: "Itachiffx | Base Code by Turtle Rehat, and Ntkhang03",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage blacklist: add, remove, list users, and toggle blacklist mode"
    },
    category: "owner",
    guide: {
      en: '{pn}: Show blacklist mode status\n{pn} [add | a or remove | r] <uid | @tag>: Add/remove user(s) to/from blacklist\n{pn} (list | l) [page-number | uid | @tag]: List blacklisted users or check specific user\n{pn} [on | off]: Enable/disable blacklist mode'
    }
  },

  onStart: async function ({ message, args, usersData, event }) {
    // Ensure the config has blackListMode initialized
    if (!config.blackListMode) {
      config.blackListMode = {
        enable: false,
        blackListIds: []
      };
    }

    const action = args[0]?.toLowerCase();
    const blackList = config.blackListMode.blackListIds;

    const updateConfig = () => writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

    const getTargetIds = () => {
      if (event.type === "message_reply") return [event.messageReply.senderID];
      return Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : args.slice(1).filter(arg => !isNaN(arg));
    };

    // If no arguments provided, show blacklist mode status
    if (!action) {
      const status = config.blackListMode.enable ? "enabled" : "disabled";
      return message.reply(`Blacklist mode is currently ${status}.\nTotal blacklisted users: ${blackList.length}`);
    }

    switch (action) {
      case "add":
      case "a":
        const addIds = getTargetIds();
        if (addIds.length === 0) return message.reply("⚠ Please provide user ID(s) or tag user(s) to add.");
        const added = addIds.filter(id => !blackList.includes(id));
        blackList.push(...added);
        updateConfig();
        return message.reply(`✅ Added ${added.length} user(s) to blacklist.`);

      case "remove":
      case "r":
        const removeIds = getTargetIds();
        if (removeIds.length === 0) return message.reply("⚠ Please provide user ID(s) or tag user(s) to remove.");
        const removed = removeIds.filter(id => blackList.includes(id));
        config.blackListMode.blackListIds = blackList.filter(id => !removed.includes(id));
        updateConfig();
        return message.reply(`✅ Removed ${removed.length} user(s) from blacklist.`);

      case "list":
      case "l":
        const pageSize = 20;
        const targetId = getTargetIds()[0];

        if (targetId) {
          const isBlacklisted = blackList.includes(targetId);
          const userName = await usersData.getName(targetId) || "Unknown";
          return message.reply(`User ${userName} (${targetId}) is ${isBlacklisted ? "✅ blacklisted" : "❌ not blacklisted"}.`);
        }

        const page = parseInt(args[1]) || 1;
        const totalPages = Math.ceil(blackList.length / pageSize);
        if (page > totalPages) return message.reply("No members on this page.");
        const startIndex = (page - 1) * pageSize;
        const pageMembers = blackList.slice(startIndex, startIndex + pageSize);
        const membersText = await Promise.all(pageMembers.map(async id => ` • ${await usersData.getName(id) || "Unknown"} (${id})`));
        return message.reply(`👑 Blacklisted users (Page ${page}/${totalPages}):\n${membersText.join("\n")}\n\nTotal: ${blackList.length}`);

      case "on":
      case "off":
        config.blackListMode.enable = action === "on";
        updateConfig();
        return message.reply(`✅ Blacklist mode ${action === "on" ? "enabled" : "disabled"}.`);

      default:
        return message.reply("⚠ Invalid input. Use 'add', 'remove', 'list', 'on', or 'off'.");
    }
  }
};
