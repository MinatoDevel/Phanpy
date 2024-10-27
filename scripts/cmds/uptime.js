const os = require('os');
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "stats",
    aliases: ["up", "uptime"],
    version: "1.0",
    author: "Birendra",
    countDown: 5,
    role: 0,
    shortDescription: "Show bot statistics",
    longDescription: "Show the statistics of the bot",
    category: "𝗜𝗡𝗙𝗢",
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    en: {
      uptime: "⚡|𝗨𝗽𝘁𝗶𝗺𝗲:",
      os: "💻|𝗢𝗦:",
      storage: "📦|𝗦𝘁𝗼𝗿𝗮𝗴𝗲 𝗨𝘀𝗮𝗴𝗲:",
      totalMemory: "💾|𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝗺𝗼𝗿𝘆:",
      freeMemory: "🆓|𝗙𝗿𝗲𝗲 𝗠𝗲𝗺𝗼𝗿𝘆:",
      cpuUsage: "🧠|𝗖𝗣𝗨 𝗨𝘀𝗮𝗴𝗲:",
      users: "👥|𝗨𝘀𝗲𝗿𝘀:",
      groups: "💬|𝗚𝗿𝗼𝘂𝗽𝘀:",
      mediaBan: "🚫|𝗠𝗲𝗱𝗶𝗮𝗕𝗮𝗻𝗻𝗲𝗱:",
      mediaBanChecking: "⏱|𝗖𝗵𝗲𝗰𝗸𝗶𝗻𝗴...",
      mediaBanFalse: "𝗳𝗮𝗹𝘀𝗲❌",
      mediaBanTrue: "𝗧𝗿𝘂𝗲✅",
      error: "❌ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻."
    },
  },

  onStart: async function({ api, message, event, usersData, threadsData, getLang }) {
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${days} 𝗱𝗮𝘆𝘀, ${hours} 𝗵𝗼𝘂𝗿𝘀, ${mins} 𝗺𝗶𝗻𝘂𝘁𝗲𝘀, 𝗮𝗻𝗱  ${seconds} 𝘀𝗲𝗰𝗼𝗻𝗱𝘀`;

      const totalMemory = `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;
      const freeMemory = `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`;
      const totalUsers = await usersData.getAll().then(data => data.length);
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      const totalGroups = threadList.filter(thread => thread.isGroup).length;
      const platform = os.platform();
      const cpuUsage = os.loadavg()[0].toFixed(2);

      const testImage = 'https://i.ibb.co/YcYf0jv/image.jpg';
      const testGroupID = "27117416734523583";

      let mediaBanStatus = getLang("mediaBanChecking");

      api.sendMessage({
        body: "",
        attachment: await global.utils.getStreamFromURL(testImage)
      }, testGroupID, async (err, info) => {
        mediaBanStatus = err ? getLang("mediaBanTrue") : getLang("mediaBanFalse");
        if (!err) api.unsendMessage(info.messageID);

        const response =
          getLang("uptime") + " " + uptimeString + "\n" +
          getLang("os") + " " + platform + " " + os.release() + " (" + os.arch() + ")\n" +
          getLang("cpuUsage") + " " + cpuUsage + "\n" +
          getLang("totalMemory") + " " + totalMemory + "\n" +
          getLang("freeMemory") + " " + freeMemory + "\n" +
          getLang("storage") + " " + totalMemory + "\n" +
          getLang("users") + " " + totalUsers + "\n" +
          getLang("groups") + " " + totalGroups + "\n" +
          getLang("mediaBan") + " " + mediaBanStatus;

        message.reply(response);
      });
    } catch (error) {
      console.error(error);
      message.reply(getLang("error"));
    }
  }
};
