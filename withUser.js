const Discord = require("discord.js");
const http = require('https');

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`User has signed in, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
    if (message.content.length < 1) return;
    console.log(`ID: ${message.id}\n\tAuthor: ${message.author.toString()}\n\tContent: ${message.toString()}\n\tEmbed: ${message.embeds}`);
});

client.on("error", async error=>{
    console.log(`Client_Error: ${error.message}`)
});

async function getToken() {
    return new Promise((resolve, reject)=>{
        let options = {
            method: "POST",
            hostname: "discordapp.com",
            path: "/api/v6/auth/login",
            headers: {
                "Content-Type": "application/json"
            }
        };

        let req = http.request(options, (res) => {
            let chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk)
            });

            res.on('end', () => {
                let body = Buffer.concat(chunks);
                console.log(body.toString());
                resolve(body.toString());
            });

            res.on('error', (err) => {
                console.log(`Error: ${err}`);
                reject(err.message);
            });
        });

        req.write(JSON.stringify({
            "captcha_key": null,
            "email": 'getgoodbot3@gmail.com',
            "gift_code_sku_id": null,
            "login_source": null,
            "password": "getgoodbot@123",
            "undelete": false
        }));
        req.end();
    });
}

async function login() {
    try{
        let ret = await getToken();
        let token = JSON.parse(ret).token;
        if (token !== undefined) {
            client.login(token);
        }
    }catch (e) {
        console.log(`Error: ${e.message}`)
    }
}

login();
