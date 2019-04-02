var mongoose = require("mongoose");

const LOCAL_DB_URL = "mongodb://127.0.0.1/warsztaty"
const REMOTE_DB_URL = "mongodb+srv://test:test@warsztaty-20e9j.azure.mongodb.net/test?retryWrites=true"
// TODO: figure out mongoDB access, hardcoded credentials aren't ideal?

const db_url = process.env.LOCAL_DB ? LOCAL_DB_URL : REMOTE_DB_URL

/**
 * Connects mongoose to our database. 
 * Further access can be covered either from the Connection object returned, 
 * or simply by importing 'mongoose', as it automatically uses the first created connection.
 */
var createDbConnection = function () {
    try {
        return mongoose.createConnection(db_url, {useNewUrlParser: true});
    } catch (error) {
        console.log("FATAL: Can't connect to the database:");
        console.log(error);
        process.exit(1);
    }
}

module.exports = createDbConnection;