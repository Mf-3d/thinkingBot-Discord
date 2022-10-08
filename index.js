const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });
const request = require("request");
const Database = require("@replit/database")

const db = new Database();

const rqt = (url) => {
  return new Promise((resolve, reject)=> {
    request(url, (error, response, body)=> {
        resolve(body);
    });
  });
}

client.once("ready", async () => {
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
        }
      ]
    }
  ];
  const command = await client.application?.commands.set(data);
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // if (message.channel.id === db.get(`settings.${message.guild.id}.channel.talk`)) {
  //   const result = JSON.parse(await rqt("https://thinkingbot-api.mf7cli.repl.co/api/v1/generate/random"));
    
  //   message.channel.send(result.result.result);
  // }
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
      if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        interaction.reply("必要な権限がありません。");
        return;
      }
      
      const channel = interaction.options.getChannel(interaction.options.data[0].name);
      
      if (channel.type !== 0) {
        interaction.reply(`テキストチャンネルを指定してください。\n${channel.type}`);
        return;
      }

      db.set(`settings.${interaction.guild.id}.channel.talk`, channel.id);

      interaction.reply(`会話するチャンネルを指定しました。\nチャンネルID: **${channel.id}**`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);