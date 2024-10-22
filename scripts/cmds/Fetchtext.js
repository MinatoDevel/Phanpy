const tesseract = require('tesseract.js');
const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "fetchtext",
    aliases: ["extracttext", "ocr"],
    version: "1.0",
    author: "Birendra Joshi",
    role: 0,
    shortDescription: { en: "Extract text from an image." },
    longDescription: { en: "Reply to a message containing an image with -ocr to extract the text from it using OCR." },
    category: "utility",
    guide: { en: "Send an image first and reply to it with {p}-ocr to extract the text." }
  },
  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;
    
    // Check if the command is a reply to a message
    if (!messageReply) {
      return api.sendMessage("Please reply to a message that contains an image with the text '-ocr'.", threadID, messageID);
    }

    // Check if the replied message contains an attachment and if it's a photo
    const attachments = messageReply.attachments || [];
    if (attachments.length === 0 || attachments[0].type !== 'photo') {
      return api.sendMessage("Please reply to a message with an image attachment.", threadID, messageID);
    }

    // Get the image URL from the attachment
    const imageURL = attachments[0].url;

    try {
      // React to the message with a waiting symbol
      await api.setMessageReaction("⌛", messageID, null, true);

      // Download the image from the URL
      const response = await axios({
        url: imageURL,
        responseType: 'arraybuffer'
      });
      
      // Save the image to a temporary file
      const tempFilePath = './temp_image.jpg';
      fs.writeFileSync(tempFilePath, Buffer.from(response.data, 'binary'));

      // Perform OCR on the saved image (no logger to avoid terminal issues)
      const { data: { text } } = await tesseract.recognize(tempFilePath, 'eng');

      // Delete the temporary image file after processing
      fs.unlinkSync(tempFilePath);

      // Send the extracted text as a message
      await api.sendMessage({
        body: `Extracted Text`
      }, threadID, messageID);

      // React with a success symbol
      await api.setMessageReaction("✅", messageID, null, true);

    } catch (error) {
      // Handle any errors that may occur and inform the user
      await api.sendMessage(`An error occurred: ${error.message}`, threadID, messageID);

      // React with an error symbol
      await api.setMessageReaction("❌", messageID, null, true);
    }
  }
};
