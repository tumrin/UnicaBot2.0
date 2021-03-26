/*Variable declerations*/
require('dotenv').config();
const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
const prefix = "!";
const command = "ruoka";
const fetch = require("node-fetch");
const settings = { method: "Get" };
const ravintolat = ["assarin-ullakko", "galilei", "macciavelli"];
let ruokaViesti = "";
let response = "";


/*Called when bot connects*/
client.on("ready", () => {
  console.log("UnicaBot is now logged in");
  client.user.setStatus("online");
  client.user.setActivity("!ruoka", { type: "LISTENING" });
});

/*Login using discord app token*/
client.login(process.env.TOKEN);

/*Called when message is sent*/
client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return; //Don't do anything if message dosen't contain correct prefix
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (commandName != command) { //Don't respond if command is not right
    return;
  }
  else {
    try {
      message.reply(response); //Respond on command "!ruoka"
    } catch (error) {
      console.error(error);
    }
    const messageDate = new Date();
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
* I created a new function for fetching the food data.
* I also did it using async await, as then chaining looks quite ugly
* @param {String} url
* @param {String} file
*/
async function haeRuokaData(url, file) {
  const res = await fetch(url);
  console.log(res);
  const resJson = await res.json();
  console.log(resJson);
  const data = JSON.stringify(resJson);
  console.log(data);
  fs.writeFileSync(file, data)
}

/**
 * Gets the new menu from Unice website
 * @param None
 */
function paivitaRuoat() {
  for (r in ravintolat) {
    try {
      switch (ravintolat[r]) {
        case "assarin-ullakko":
          haeRuokaData("https://www.unica.fi/modules/json/json/Index?costNumber=1920&language=fi", "assari.json")
          break;
        case "galilei":
          haeRuokaData("https://www.unica.fi/modules/json/json/Index?costNumber=1995&language=fi", "galilei.json")
          break;
        case "macciavelli":
          haeRuokaData("https://www.unica.fi/modules/json/json/Index?costNumber=1970&language=fi", "maccis.json")
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
  const d = new Date();
  let viesti;
  response += `\nRuokalista ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}\n`
  for (let i = 0; i < ravintolat.length; i++) {
    switch (ravintolat[i]) {
      case "assarin-ullakko":
        ruokaViesti = fs.readFileSync("assari.json", 'utf-8');
        viesti = JSON.parse(ruokaViesti);
        rakennaViesti(viesti);
        break;
      case "galilei":
        ruokaViesti = fs.readFileSync("galilei.json", 'utf-8');
        viesti = JSON.parse(ruokaViesti);
        rakennaViesti(viesti);
        break;
      case "macciavelli":
        ruokaViesti = fs.readFileSync("maccis.json", 'utf-8');
        viesti = JSON.parse(ruokaViesti);
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
      else if (viesti.RestaurantName == "Assarin Ullakko") {
        continue;
      }
      for (k in viesti.MenusForDays[0].SetMenus[j].Components) {
        response += `> ${JSON.stringify(viesti.MenusForDays[0].SetMenus[j].Components[k])}"\n`;
      }
    }
  } catch (error) {
    //Ignore TypeError from empty menus
  }
}

/*Updates menu every 4 hours*/
setInterval(() => {
  paivitaRuoat();
  client.user.setActivity("!ruoka", { type: "LISTENING" }); //Reset status because for some reason this resets to empty after some time
}, 1000 * 60 * 60 * 4);