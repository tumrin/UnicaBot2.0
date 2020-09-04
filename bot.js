
const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
client.commands = new Discord.Collection();
const prefix = "!";
const command = "ruoka";
const fetch = require("node-fetch");
let url = ""
const settings = { method: "Get" };
const ravintolat = ["assarin-ullakko", "galilei", "macciavelli"];
token = require("./token.json");
var ruokaViesti = "";
var response = "";
var d = new Date();

// triggered when bot:
//  -logs in
//  -reconnects after disconnecting
client.on("ready", () => {
  console.log("UnicaBot is now logged in");
  client.user.setStatus("online");
  client.user.setActivity("!ruoka", { type: "LISTENING"});
});

client.login(token["token"]);


client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  console.log(`${message.author.username}:${message.content}`);

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!command) {
    return;
  }
  else {
    message.reply(response);
  }
});

try {
  paivitaRuoat();
} catch (error) {
  console.error(error);
}

function paivitaRuoat() {
  for (let i=0;i<ravintolat.length;i++){
    switch (ravintolat[i]) {
      case "assarin-ullakko":
        url = "https://www.unica.fi/modules/json/json/Index?costNumber=1920&language=fi";
        fetch(url, settings)
          .then(res => res.json())
          .then((json) => {
            let data = JSON.stringify(json);
            fs.writeFileSync("assari.json", data);
          });
        break;
      case "galilei":
        url = "https://www.unica.fi/modules/json/json/Index?costNumber=1995&language=fi";
        fetch(url, settings)
          .then(res => res.json())
          .then((json) => {
            let data = JSON.stringify(json);
            fs.writeFileSync("galilei.json", data);
          });
        break;
      case "macciavelli":
        url = "https://www.unica.fi/modules/json/json/Index?costNumber=1970&language=fi";
        fetch(url, settings)
          .then(res => res.json())
          .then((json) => {
            let data = JSON.stringify(json);
            fs.writeFileSync("maccis.json", data);
          });
        break;
    }
  }
  response = "";
  annaRuoat();
}

function annaRuoat() {
  response += `\nRuokalista ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}\n`
  for (let i=0;i<ravintolat.length;i++) {
    switch (ravintolat[i]) {
      case "assarin-ullakko":
        ruokaViesti = fs.readFileSync("assari.json", 'utf-8');
        var viesti = JSON.parse(ruokaViesti);
        rakennaViesti(viesti);
        break;
      case "galilei":
        ruokaViesti = fs.readFileSync("galilei.json", 'utf-8');
        var viesti = JSON.parse(ruokaViesti);
        rakennaViesti(viesti);
        break;
      case "macciavelli":
        ruokaViesti = fs.readFileSync("maccis.json", 'utf-8');
        var viesti = JSON.parse(ruokaViesti);
        rakennaViesti(viesti);
        break;
    }
  }
}

function rakennaViesti(viesti) {
  response += `\n**${viesti.RestaurantName}**\n`
  for (j in viesti.MenusForDays[0].SetMenus) {
    if(viesti.MenusForDays[0].SetMenus[j].Name!=null){
      response += `__${viesti.MenusForDays[0].SetMenus[j].Name}__\n`
    }
    for (k in viesti.MenusForDays[0].SetMenus[j].Components) {
      response += `> ${JSON.stringify(viesti.MenusForDays[0].SetMenus[j].Components[k])}"\n`;
    }
  }
}

setInterval(() => {
  console.log("Trying to update");
    paivitaRuoat();
}, 1000 * 60 * 60 * 4); // 4 tunnin välein