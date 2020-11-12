/*Variable declerations*/
const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
const prefix = "!";
const command = "ruoka";
const fetch = require("node-fetch");
const settings = { method: "Get" };
const ravintolat = ["assarin-ullakko", "galilei", "macciavelli"];
const token = require("./token.json");
var url = ""
var ruokaViesti = "";
var response = "";



/*Called when bot connects*/
client.on("ready", () => {
  console.log("UnicaBot is now logged in");
  client.user.setStatus("online");
  client.user.setActivity("!ruoka", { type: "LISTENING" });
});

/*Login using discord app token*/
client.login(token["token"]);

/*Called when message is sent*/
client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return; //Don't do anything if message doesnt contain correct prefix
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (commandName!=command) { //Don't respond if command is not right
    return;
  }
  else {
    try {
      message.reply(response); //Respond on command "!ruoka"
    } catch (error) {
      console.error(error);
    }
    var messageDate = new Date();
    console.log(`${message.author.username}:${message.content} ${messageDate}`);
  }
});

/*Update on startup*/
try {
  paivitaRuoat();
} catch (error) {
  console.error(error);
}

/**
 * Gets the new menu from Unice website
 * @param None
 */
function paivitaRuoat() {
  for (let i = 0; i < ravintolat.length; i++) {
    try {
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
    } catch (error) {
      console.error(error);
    }
  }
  response = "";
  annaRuoat();
}

/**
 * Writes menus to JSON files
 * @param None
 */
function annaRuoat() {
  var d = new Date();
  response += `\nRuokalista ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}\n`
  for (let i = 0; i < ravintolat.length; i++) {
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

/**
 * Builds the response message
 * @param {Object} viesti 
 */
function rakennaViesti(viesti) {
  response += `\n**${viesti.RestaurantName}**\n`
  try {
    for (j in viesti.MenusForDays[0].SetMenus) {
      if (viesti.MenusForDays[0].SetMenus[j].Name != null) {
        response += `__${viesti.MenusForDays[0].SetMenus[j].Name}__\n`
      }
      else if(viesti.RestaurantName=="Assarin Ullakko"){
        continue;
      }
      for (k in viesti.MenusForDays[0].SetMenus[j].Components) {
        response += `> ${JSON.stringify(viesti.MenusForDays[0].SetMenus[j].Components[k])}"\n`;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

/*Updates menu every 4 hours*/
setInterval(() => {
  console.log("Trying to update");
  paivitaRuoat();
  client.user.setActivity("!ruoka", { type: "LISTENING" }); //Reset status because for some reason this resets to empty after some time
}, 1000 * 60 * 60 * 4);