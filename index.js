// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values.
const config = require("./config.json");
// config.token_bot contains the bot's token
// config.token_user contains the user's token
// config.prefix contains the message prefix.

const db_connection=require('./db_connection');
// Check if database is connected
db_connection.connect();

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    db_connection.emptyMessages().then(ret=>{
        for (let i=0; i<client.channels.size; i++){
            if (client.channels.array()[i].type==='text'){
                let channel_temp = client.channels.array()[i];
                channel_temp.send('Hi, I am here now');
                break;
            }
        }
    }).catch(console.error);

    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    //if(message.author.bot) return;

    if (message.content.length<1) return;
    processDB(message);
});

client.on("messageUpdate",   (oldMessage, newMessage)=> {
    db_connection.updateMessage(oldMessage, newMessage).then().catch(console.error);
});

processDB = function(message){
    // db_connection.insertUser(message.author);
    // db_connection.insertMessage(message);
    const guild = message.guild;
    const channel = message.channel;

    guild.fetchMembers()
        .then(members=>{
            console.log(members.memberCount, " Members are here.");
            console.log(typeof members);
            for (let k=0; k<members.memberCount; k++) {
                db_connection.insertUser(members.members.array()[k].user).then().catch(console.error);
            }
        })
        .catch(console.error);

    channel.fetchMessages({
        limit:100
    }).then(res => {
        for (let i=0; i<res.array().length; i++){
            db_connection.insertMessage(res.array()[i]).then().catch(console.error);
        }
    }).catch(console.error);

};


client.login(config.token_user);
