
const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
client.commands = new Discord.Collection();
const prefix = "!";
const command = "ruoka";
const fetch = require("node-fetch");
let url = ""
const settings = {method: "Get"};
const ravintolat = ["assarin-ullakko"];
token = require("./token.json");
var ruokaViesti = "";
var response = "";

// triggered when bot:
//  -logs in
//  -reconnects after disconnecting
client.on("ready", () => {
  console.log("UnicaBot is now logged in");
  client.user.setPresence({
    status: "online",
    game: {
      name: "!ruoka",
      type: "LISTENING",
    },
  });
});

client.login(token["token"]);


client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  console.log(`${message.author.username}:${message.content}`);

  // get arguments and command name from message
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if(!command){
      return;
  }
  else{
      message.reply(annaRuoat());
  }
});

try {
    console.log("Päivitä");
    paivitaRuoat();
    annaRuoat();
} catch (error) {
    console.error(error);
}

function paivitaRuoat(){
    url = "https://www.unica.fi/modules/json/json/Index?costNumber=1920&language=fi";
    fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        let data = JSON.stringify(json);
        fs.writeFileSync("assari.json", data);
    });
    response = "";
}

function annaRuoat(){
    ruokaViesti = fs.readFileSync("assari.json",'utf-8');
    var viesti = JSON.parse(ruokaViesti);
    return viesti.RestaurantName;
}

function rakennaViesti(viesti){
    
}
