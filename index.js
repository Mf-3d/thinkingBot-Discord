const { PermissionsBitField, Client, GatewayIntentBits, Partials } = require('discord.js');

const request = require("request");
const Database = require("@replit/database");
const express = require("express");

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});
const app = express();
const db = new Database();

const rqt = (url) => {
  return new Promise((resolve, reject)=> {
    request(url, (error, response, body)=> {
        resolve(body);
    });
  });
}


client.on("ready", async () => {
  console.log('Ready!');

  const data = [
    {
      name: "generate",
      description: "ランダムな文章を生成します。",
    },
    {
      name: "set",
      description: "設定を変更します。",
      options: [
        {
          type: 1,
          name: "channel",
          description: "会話するテキストチャンネルを設定します。",
          options: [
            {    
              type: 7,
              name: "channel",
              description: "会話するテキストチャンネルを指定します。",
              required: true
            }
          ] 
        },
        {
          type: 1,
          name: "delete-channel",
          description: "会話するテキストチャンネルの設定を削除します。"
        }
      ]
    }
  ];
  const command = await client.application?.commands.set(data);
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === await db.get(`settings.${message.guild.id}.channel.talk`)) {
    message.channel.sendTyping();
    
    const result = JSON.parse(await rqt("https://thinkingbot-api.mf7cli.repl.co/api/v1/generate/random"));
    
    message.channel.send(result.result.result);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  if (interaction.commandName === 'generate') {
    const result = JSON.parse(await rqt("https://thinkingbot-api.mf7cli.repl.co/api/v1/generate/random"));
    
    await interaction.reply(result.result.result);
  }

  if (interaction.commandName === "set") {
    if (interaction.options.getSubcommand() === "channel") {
      if (interaction.member.id !== "866083131433943050") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          interaction.reply("必要な権限がありません。");
          return;
        }
      }
        
      
      const channel = interaction.options.getChannel(interaction.options.data[0].name);
      
      if (channel.type !== 0) {
        interaction.reply(`テキストチャンネルを指定してください。`);
        return;
      }

      db.set(`settings.${interaction.guild.id}.channel.talk`, channel.id);

      interaction.reply(`会話するチャンネルを指定しました。\nチャンネルID: **${channel.id}**`);
    }

    if (interaction.options.getSubcommand() === "delete-channel") {
      if (interaction.member.id !== "866083131433943050") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          interaction.reply("必要な権限がありません。");
          return;
        }
      }

      db.delete(`settings.${interaction.guild.id}.channel.talk`);
      
      interaction.reply(`会話するチャンネルの設定を削除しました。`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

app.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send("thinkingのBot#0076");
});

app.listen(3000, () => {
    console.log(`Opened API Server`);
});