let mysql=require('mysql');
const config = require("./config.json");

let isConnected=false;

let con=mysql.createConnection({
    host: config.db_host,
    user : config.db_user,
    password : config.db_pwd,
    database : config.db_name
});


exports.connect = function () {
    if (isConnected) {
         return true;
    }

    con.connect(function (err) {
        if (err) {
            console.log("Database connection error!")
            throw err;
        }
        console.log("Database Connected!");
        isConnected = true;
    });

    return isConnected;
};

exports.executeSelectQuery = function(query){
    return new Promise((resolve, reject)=>{
        con.query(query, function (error, result) {
            if (error) {
                console.log("Query Error:", query);
                reject(false);
                throw error;
            }

            resolve(result.length);
        })
    })
};

exports.executeInsertQuery = function(query){
    return new Promise((resolve, reject)=>{
        con.query(query, function (error, result) {
            if (error) {
                console.log("Query Error:", query);
                reject(false);
                throw error;
            }
            resolve(true);
        })
    })
};

exports.executeUpdateQuery = function(query){
    return new Promise((resolve, reject)=>{
        con.query(query, function (error, result) {
            if (error) {
                console.log("Query Error:", query);
                reject(false);
                throw error;
            }
            resolve(result);
        })
    })
};

exports.executeDeleteQuery = function(query){
    return new Promise((resolve, reject)=>{
        con.query(query, function (error, result) {
            if (error) {
                console.log("Query Error:", query);
                reject(false);
                throw error;
            }
            resolve(result);
        })
    })
};

exports.insertMessage = function (message) {
    return new Promise((resolve, reject)=>{
        if (!this.connect())
            reject(false);

        if (message.content.length<1) {
            console.log("Message(", message.id, ") is Skipped because it is empty.");
            reject(false);
        }
        let query = "SELECT * FROM "+config.db_tbl_messages+" WHERE Message_id = '"+message.id+"'";
        this.executeSelectQuery(query).then(ret=>{
            if (ret===false)
                reject(false);
            if (ret>0) {
                console.log("Message(", message.id ,") Already Exist");
            }
            else{
                let isPinned=0;
                if (message.pinned)
                    isPinned=1;
                let content = message.content.replace('\'','\\\'');
                query = "INSERT INTO "+config.db_tbl_messages+" (Message_id, content, author_id, channel_id, pinned, created_at) VALUES ('" + message.id +"', '"+content+"', '"+message.author.id+"', '"+message.channel.id+"', "+isPinned+", '"+message.createdTimestamp+"')";
                this.executeInsertQuery(query).then(ret=>{
                    if (ret===false)
                        reject(false);
                    console.log("Message Successfully inserted: ", message.id);
                    resolve(true);
                });
            }
        });
    })
};

exports.insertUser = function (author) {
    return new Promise((resolve, reject)=>{
        if (!this.connect())
            reject(false);

        let query = "SELECT * FROM "+config.db_tbl_users+" WHERE Discord_id = '"+author.id+"'";
        con.query(query, function (error, result) {
            if (error) {
                console.log("Query Error:", query);
                reject(false);
                throw error;
            }
            if (result.length){
                console.log("User(", author.id ,") Already Exist");
            }else{
                let isBot=0;
                if (author.bot)
                    isBot=1;
                query = "INSERT INTO "+config.db_tbl_users+" (Discord_id, username, discriminator, avatarURL, bot) VALUES ('" + author.id +"', '"+author.username+"', '"+author.discriminator+"', '"+author.avatarURL+"', '"+isBot+"')";
                con.query(query, function (err, result) {
                    if (err) {
                        console.log("Query Error: ", query);
                        reject(false);
                        throw err;
                    }
                    console.log("User Successfully inserted: ", author.id);
                    resolve(true);
                });
            }
        })

    });
};

exports.updateMessage = function (oldMessage, newMessage) {
    return new Promise((resolve, reject)=>{
        let newPinned=newMessage.pinned?1:0;
        let query = "UPDATE "+config.db_tbl_messages+" SET content='"+newMessage.content+"', pinned="+newPinned+"  WHERE Message_id = '"+oldMessage.id+"'";
        this.executeUpdateQuery(query)
            .then(ret=>{
                if (ret===false){
                    console.log("Updating Failed!");
                    reject(false);
                }
                console.log("Message(", oldMessage.id, ") Was Successfully Updated. Result: ",ret.message);
                resolve(true);
            })
            .catch(console.error);
    });
};

exports.emptyMessages = function () {
    return new Promise((resolve, reject)=>{
        let query = "DELETE FROM "+config.db_tbl_messages;
        this.executeDeleteQuery(query)
            .then(ret=>{
                if (ret===false){
                    console.log("Deleting Failed!");
                    reject(false);
                }
                console.log("Messages Was Successfully Deleted.");
                resolve(true);
            })
            .catch(console.error);
    });
};

