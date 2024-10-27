const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
	config: {
		name: "setwelcome",
		aliases: ["setwc"],
		version: "1.8",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			vi: "Chỉnh sửa nội dung tin nhắn chào mừng thành viên mới, bao gồm hình ảnh và thời gian.",
			en: "Edit welcome message content for new members, including image and time.",
			es: "Editar el mensaje de bienvenida para nuevos miembros, incluyendo imagen y hora."
		},
		category: "custom",
		guide: {
			en: {
				body: "   {pn} text [<content> | reset]: edit or reset message content with shortcuts:"
					+ "\n  + {userName}: new member's name"
					+ "\n  + {userNameTag}: new member's name (tag)"
					+ "\n  + {boxName}: group chat name"
					+ "\n  + {multiple}: you || you guys"
					+ "\n  + {session}: session in day"
					+ "\n  + {joinTime}: time of joining"
					+ "\n\n   Example:"
					+ "\n    {pn} text Hello {userName}, welcome to {boxName}, enjoy your {session}!"
					+ "\n   Use {pn} file: to add an image/video/audio file."
					+ "\n\n   Styles: [*italic*], [**bold**], [emojis]",
				attachment: {
					[`${__dirname}/assets/guide/setwelcome/setwelcome_en_1.png`]: "https://i.ibb.co/vsCz0ks/setwelcome-en-1.png"
				}
			}
		}
	},

	langs: {
		en: {
			turnedOn: "Welcome message activated!",
			turnedOff: "Welcome message deactivated.",
			missingContent: "Please provide content for the welcome message.",
			edited: "Welcome message updated: %1",
			reseted: "Welcome message reset to default.",
			noFile: "No attachments found to delete.",
			resetedFile: "File attachments removed.",
			missingFile: "Please reply with an image/video/audio file.",
			addedFile: "Added %1 attachments to the welcome message.",
			exceedsFileLimit: "File size exceeds the 5MB limit.",
			unsupportedFileType: "Unsupported file type. Allowed: image, video, audio.",
		}
	},

	onStart: async function ({ args, threadsData, message, event, commandName, getLang }) {
		const { threadID, senderID, body } = event;
		const { data, settings } = await threadsData.get(threadID);

		switch (args[0]) {
			case "text": {
				if (!args[1])
					return message.reply(getLang("missingContent"));
				else if (args[1] == "reset")
					delete data.welcomeMessage;
				else
					data.welcomeMessage = formatMessage(body.slice(body.indexOf(args[0]) + args[0].length).trim());
				await threadsData.set(threadID, { data });
				message.reply(data.welcomeMessage ? getLang("edited", data.welcomeMessage) : getLang("reseted"));
				break;
			}
			case "file": {
				handleFileAttachment(args, event, threadID, senderID, threadsData, message, getLang);
				break;
			}
			case "on":
			case "off": {
				settings.sendWelcomeMessage = args[0] == "on";
				await threadsData.set(threadID, { settings });
				message.reply(settings.sendWelcomeMessage ? getLang("turnedOn") : getLang("turnedOff"));
				break;
			}
			default:
				message.SyntaxError();
				break;
		}
	},

	onReply: async function ({ event, Reply, message, threadsData, getLang }) {
		const { threadID, senderID } = event;
		if (senderID != Reply.author) return;

		if (event.attachments.length == 0 && (!event.messageReply || event.messageReply.attachments.length == 0))
			return message.reply(getLang("missingFile"));

		handleFileAttachment([], event, threadID, senderID, threadsData, message, getLang);
	}
};

async function handleFileAttachment(args, event, threadID, senderID, threadsData, message, getLang) {
	const { data } = await threadsData.get(threadID);
	const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])]
		.filter(item => ["photo", 'png', "animated_image", "video", "audio"].includes(item.type) && item.size <= 5 * 1024 * 1024);

	if (attachments.length == 0) {
		return message.reply(args[1] === "reset" ? getLang("noFile") : getLang("unsupportedFileType"));
	}

	data.welcomeAttachment = [];
	await Promise.all(attachments.map(async attachment => {
		const ext = getExtFromUrl(attachment.url);
		const fileName = `welcome_${threadID}_${senderID}_${getTime()}.${ext}`;
		const infoFile = await drive.uploadFile(fileName, await getStreamFromURL(attachment.url));
		data.welcomeAttachment.push(infoFile.id);
	}));

	await threadsData.set(threadID, { data });
	message.reply(getLang("addedFile", attachments.length));
}

function formatMessage(content) {
	content = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Bold
	content = content.replace(/\*(.*?)\*/g, '<i>$1</i>'); // Italic
	content = content.replace(/:smile:/g, '😊'); // Emoji example
	return content;
					}
