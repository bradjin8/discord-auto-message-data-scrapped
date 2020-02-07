const Discord = require("discord.js");
const http = require('https');
let axios = require('axios');
const client = new Discord.Client();
let postData = [];
let basicData = [];
let keywords = ["LFS", "LFT", "LFM", "LFT/M", "LFR/LTR", "LFP"];
let availableChannels = ['177136656846028801','170983565146849280','421309174467788810','421309348145266698','421310803761692682','348940099804987394','266361968716283906',
    '266364187805089792','406901080077893643','295219612117630976','406901103226257409','357321315075751946','266361996847349760','265942996837597195'];

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
    let isValidChannel = false;
    for (let i = 0; i<availableChannels.length;i++){
        if (message.channel.id === availableChannels[i]) {isValidChannel = true; break;}
    }
    if (!isValidChannel) return;
    if (message.content.length < 1) return;
    //if (message.author.id !== '585464224029868059') return;
    console.log(`
        ID:         ${message.id}
        Server:     ${message.guild.name.toString()} ServerID: ${message.guild.id}
        Channel:    ${message.channel.name} ChannelID: ${message.channel.id} 
        Author:     ${message.author.id}
        Content:    ${message.toString()}
        Embed:      ${message.embeds}
        discordUserID:         ${message.author.tag}
        userID:           ${message.author.id};
    `);

    validMessageHandler(message);
})
;

client.on("error", async error => {
    console.log(`Client_Error: ${error.message}`)
});

async function getToken() {
    return new Promise((resolve, reject) => {
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
            "email": '{{You Email Here}}',
            "gift_code_sku_id": null,
            "login_source": null,
            "password": '{{Your Password Here}}',
            "undelete": false
        }));
        req.end();
    });
}


function validMessageHandler(message) {
    if (message === null || message === undefined)
        return;

    if (checkIfDuplicated(message))
        return;

    // push message data

    let data = {};
    data.id = message.id;
    data.attachments = [];
    data.tts = message.tts;
    data.embeds = [];
    data.timestamp = message.timestamp;
    data.mentionsEveryone = message.mentionsEveryone;
    data.pinned = message.pinned;
    data.editedTimestamp = message.editedTimestamp;
    data.dicordUserID = message.author.tag;
    data.userID = message.author.id;
    let messageAuthor = {};
    messageAuthor.avatar = message.author.avatar;
    messageAuthor.avatarURL = message.author.avatarURL;
    messageAuthor.bot = message.author.bot;
    messageAuthor.createdAt = message.author.createdAt;
    messageAuthor.createdTimestamp = message.author.createdTimestamp;
    messageAuthor.defaultAvatarURL = message.author.defaultAvatarURL;
    messageAuthor.discriminator = message.author.discriminator;
    messageAuthor.displayAvatarURL = message.author.displayAvatarURL;
    messageAuthor.id = message.author.id;
    messageAuthor.tag = message.author.tag;
    messageAuthor.username = message.author.username;
    data.author = messageAuthor;
    data.mention_roles = [];
    data.content = message.toString();
    data.channel_id = message.channel.id;
    data.channel_name = message.channel.name;
    data.mentions = [];
    data.msg_type = message.type;
    data.reaction = [];
    data.discord_channel_id = message.channelID;
    data.created_at = message.createdAt;
    console.log(JSON.stringify(data));
    // add needed data into data


    // push data into dataArray
    basicData.push(data);
    postData.push(data);
}

function checkIfDuplicated(message) {
    let ret = false;

    // check if message contains any keyword
    let content = message.toString();
    if (checkIfContainsAnyKeyword(content)) { // contains
        for (let i = 0; i < keywords.length; i++) {
            if (content.indexOf(keywords[i]) > -1) {
                ret = false;
                for (let j = 0; j < basicData.length; j++) {
                    if (basicData[j].content.indexOf(keywords[i]) > -1){
                        ret = true;
                    }
                }
            }
        }
    } else { // does not contain
        for (let i = 0; i < basicData.length; i++) {
            if (message.channelID === basicData[i].discord_channel_id && message.author.id === basicData[i].author.id)
                ret = true;
            break;
        }
    }

    return ret;
}

function checkIfContainsAnyKeyword(content) {
    for (let i = 0; i < keywords.length; i++) {
        if (content.indexOf(keywords[i]) > -1) {
            return true;
        }
    }
    return false;
}


async function login() {
    try {
        let ret = await getToken();
        let token = JSON.parse(ret).token;
        if (token !== undefined) {
            client.login(token);
            transferData();
        }
    } catch (e) {
        console.log(`Error: ${e.message}`)
    }
}


let count = 0;

function transferData() {
    // validate
    count++;

    if (postData.length !== 0) {
        // api call
        axios.post('http://13.250.191.147',{'discordMessages':JSON.stringify(postData)});
        console.log(`POSTED: ${JSON.stringify(postData)}`);
    }
    postData = [];

    if (count === 5) {
        basicData = [];
        count = 0;
        console.log("FORMATED");
    }
    setTimeout(transferData, 1 * 60 * 1000);
}

login();

