const pino = require("pino");
const path = require("path");
const CFonts = require("cfonts");
const fs = require("fs-extra");
const chalk = require("chalk");
const readline = require("readline");
const moment = require('moment-timezone');
const MealynAPI = require('./gptrp.js');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  PHONENUMBER_MCC,
} = require("@whiskeysockets/baileys");
const { jidNormalizedUser } = require("@whiskeysockets/baileys/lib/index.js");

function getJakartaDateTime() {
  return moment.tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
}

global.sessionName = "auth-info";
const pairingCode = true;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

CFonts.say("WA Auto AI", {
  font: "tiny",
  align: "center",
  colors: ["system"],
});
CFonts.say(
  "Simple Whatsapp AI\nContributors: Clayza Aubert, Arifzyn",
  {
    colors: ["system"],
    font: "console",
    align: "center",
  },
);

async function Maelyn() {
  const { state, saveCreds } = await useMultiFileAuthState("./" + sessionName);
  try {
    const socket = makeWASocket({
      printQRInTerminal: !pairingCode,
      logger: pino({
        level: "silent",
      }),
      browser: ["Mac OS", "chrome", "121.0.6167.159"],
      auth: state,
    });

    socket.ev.on("messages.upsert", async chatUpdate => {
      try {
          let m = chatUpdate.messages[0];
          if (!m.message) return;
  
          const type = getContentType(m.message);
          const sender = m.key.remoteJid;
          const chatType = m.key.remoteJid.endsWith("@s.whatsapp.net") ? "private" : "group";
  
          let body = "";
          switch (type) {
              case "conversation":
                  body = m.message.conversation || "";
                  break;
              case "imageMessage":
                  body = m.message.imageMessage.caption || "";
                  break;
              case "documentMessage":
                  body = m.message.documentMessage.caption || "";
                  break;
              case "videoMessage":
                  body = m.message.videoMessage.caption || "";
                  break;
              case "extendedTextMessage":
                  body = m.message.extendedTextMessage.text || "";
                  break;
              case "buttonsResponseMessage":
                  body = m.message.buttonsResponseMessage.selectedButtonId || "";
                  break;
              case "templateButtonReplyMessage":
                  body = m.message.templateButtonReplyMessage.selectedId || "";
                  break;
              default:
                  body = "";
          }
  
          console.log(`\nSender: ${sender}\nPesan: ${body}`);
          if (chatType === "private") {
              if (m.key.fromMe) {
                  return;
              }
              const response = await MealynAPI(body);
              if (response && response !== body) {
                  await socket.sendMessage(sender, { text: response });
              }
          } else if (chatType === "group") {
              const tagbot = jidNormalizedUser(socket.user.jid);
              const botMentioned = "@" + tagbot.split("@")[0];
              if (body.includes(botMentioned)) {
                  const response = await MealynAPI(body);
                  if (response && response !== body) {
                      await socket.sendMessage(sender, { text: response });
                  }
              }
          }
      } catch (err) {
          console.log(err);
      }
  });
  

    const getContentType = (content) => {
      if (content) {
        const keys = Object.keys(content);
        const key = keys.find(
          (k) =>
            (k === "conversation" ||
              k.endsWith("Message") ||
              k.includes("V2") ||
              k.includes("V3")) &&
            k !== "senderKeyDistributionMessage",
        );
        return key;
      }
    };

    socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        try {
          const dateTime = getJakartaDateTime();
          await socket.sendMessage(socket.user.id, { text: `WhatsApp Bot Connected ${dateTime}` });
          console.log(chalk.greenBright("WhatsApp bot connected!"));
        } catch (error) {
          console.error("Error sending file:", error);
        }
      } else if (
        connection === "close" &&
        lastDisconnect &&
        lastDisconnect.error &&
        lastDisconnect.error.output.statusCode &&
        lastDisconnect.error.output.statusCode !== 401
      ) {
        Maelyn();
      }
    });

    socket.ev.on("creds.update", saveCreds);

    if (pairingCode && !socket.authState.creds.registered) {
      let phoneNumber;
      phoneNumber = await question(
        chalk.bgBlack(chalk.greenBright(`Example: 62857xxxxxxxx Please type your WhatsApp number : `)),
      );
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

      

      setTimeout(async () => {
        try {
          let code = await socket.requestPairingCode(phoneNumber.trim());
          code = code?.match(/.{1,4}/g)?.join("-") || code;
          console.log(
            chalk.black(chalk.bgGreen(`Your Pairing Code : `)),
            chalk.black(chalk.white(code)),
          );
        } catch (error) {
          console.error("Error requesting pairing code:", error);
          process.exit(1);
        }
      }, 3000);
    }
  } catch (error) {
    console.error("Error in Maelyn:", error);
  }
}

Maelyn();
