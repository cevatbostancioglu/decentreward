//const JsonDB = require('node-json-db');
//const Config = require('node-json-db/dist/lib/JsonDBConfig');
//import { JsonDB } from 'node-json-db';
//import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
// The first argument is the database filename. If no extension, '.json' is assumed and automatically added.
// The second argument is used to tell the DB to save after each push
// If you put false, you'll have to call the save() method.
// The third argument is to ask JsonDB to save the database in an human readable format. (default false)
// The last argument is the separator. By default it's slash (/)
//var db = new JsonDB(Config("myDataBase", true, false, '/'));

/*
{
    userid_123:
    {
        state=1
        messages:
        ["message1", "message2"..."message12"],
    }
}
*/

async function saveDatabase(senderId, messageText) {
    if(senderId == 0)
    {console.log("error");}
    j = { state:0, messages:[messageText]};
    console.log('/userid_', senderId, j);
}

async function returnUserState(senderId) {

}

module.exports = { 
    returnUserState, 
    saveDatabase 
};