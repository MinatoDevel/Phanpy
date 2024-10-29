const fs = require("fs");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "owner",
    aliases: ['info', 'admin'],
    version: "1.0",
    author: "Itachi",
    countDown: 5,
    role: 0,
    shortDescription: "Admin and Bot information",
    longDescription: "Admin and Bot information",
    category: "INFO",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function({ api, event, threadID }) {
    const time = process.uptime(),
          hours = Math.floor(time / (60 * 60)),
          minutes = Math.floor((time % (60 * 60)) / 60),
          seconds = Math.floor(time % 60);

    // Set the current time in Kathmandu timezone
    const currentTime = moment.tz("Asia/Kathmandu").format("DD/MM/YYYY hh:mm:ss A"); // 12-hour format with AM/PM

    const imageLink = "https://i.ibb.co/wCtnWKb/image.jpg";

    // Function to send the message after image download
    const sendMessageWithImage = () => {
      api.sendMessage({
        body: `BOT OWNER: Birendra Joshi\nFACEBOOK: https://www.facebook.com/Dev.Birendra10\nAGE: 17\nLocation: Chitwan, Nepal\nTIME: ${currentTime}`,
        attachment: fs.createReadStream(__dirname + "/tmp/juswa.jpg")
      }, event.threadID, () => {
        fs.unlinkSync(__dirname + "/tmp/juswa.jpg"); // Delete image after sending
      });
    };

    // Download the image using axios and fs
    const writer = fs.createWriteStream(__dirname + "/tmp/juswa.jpg");
    const response = await axios({
      url: imageLink,
      method: "GET",
      responseType: "stream"
    });

    response.data.pipe(writer);
    writer.on("finish", sendMessageWithImage);
    writer.on("error", err => console.error("Image download error:", err));
  }
};
