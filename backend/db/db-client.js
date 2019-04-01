import { MongoClient, FilterQuery } from "mongodb";
import { readFileSync } from "fs";
import * as createError from "http-errors";

const PROD_DB_URI =
    "mongodb+srv://brennus:<password>@warsztaty-20e9j.azure.mongodb.net/test?retryWrites=true";

const PROD_PASS_LOCATION = "../db-password.txt";
const LOCAL_DB_URI = "mongodb://127.0.0.1/warsztaty";

/**
 * @class
 * @property {MongoClient} db
 */
export class DBClient {
    /** @property {MongoClient} */
    db;

    /** @returns {Promise<DBClient>} */
    static bootstrapProd = async function() {
        let uri = PROD_DB_URI.replace("<password>", loadPassword());
        return this.bootstrap(uri);
    };

    /** @returns {Promise<DBClient>} */
    static bootstrapLocal = async function() {
        return this.bootstrap(LOCAL_DB_URI);
    };

    /**
     * Creates a new DBClient instance and connects to MongoDB
     * @param {string} url
     * @returns {Promise<DBClient>}
     */
    static bootstrap = async function(url) {
        let _db = (await MongoClient.connect(url, {
            useNewUrlParser: true
        })).db();
        await _db.db().createCollection("users", {});
        return new DBClient(_db);
    };

    /** @param {MongoClient} _db */
    constructor(_db) {
        this.db = _db;
    }

    /**
     * Creates an element in collection
     * @param {string} collection - name of the collection
     * @param {any} obj - object to insert
     * @returns {Promise<void>}
     */
    insertOne = async function(collection, obj) {
        await this.db
            .db()
            .collection(collection)
            .insertOne(obj);
        console.log(`inserted a document into ${collection}`);
    };

    /**
     * Creates multiple elements
     * @param {string} collection - name of the collection
     * @param {any[]} arr - array of objects to insert
     * @returns {Promise<void>}
     */
    insertMany = async function(collection, arr) {
        result = await this.db
            .db()
            .collection(collection)
            .insertMany(arr);
        console.log(
            `inserted ${result.insertedCount} documents into ${collection}`
        );
    };

    /**
     * Gets first matching element
     * @param {string} collection - name of the collection
     * @param {FilterQuery} [query={}] - MongoDB filter query
     * @returns {Promise<any>}
     */
    getOne = async function(collection, query) {
        try {
            let finalQuery = query || {};
            let result = await this.db
                .db()
                .collection(collection)
                .findOne(finalQuery);
            console.log(`retrieved a document from ${collection}`);
            return result;
        } catch (error) {
            throw createError(404);
        }
    };

    /**
     * Gets all matching elements
     * @param {string} collection - name of the collection
     * @param {FilterQuery} [query={}] - MongoDB filter query
     * @returns {Promise<any[]>}
     */
    getMany = async function(collection, query) {
        let finalQuery = query || {};
        result = await this.db
            .db()
            .collection(collection)
            .find(finalQuery)
            .toArray();
        console.log(`retrieved ${result.length} documents from ${collection}`);
        return results;
    };

    /**
     * Gets first matching element
     * @param {string} collection - name of the collection
     * @param {FilterQuery} [query={}] - MongoDB filter query
     * @returns {Promise<void>}
     */
    deleteOne = async function(collection, query) {
        let finalQuery = query || {};
        let result = await this.db
            .db()
            .collection(collection)
            .deleteOne(finalQuery).result;
        if (!result.ok) {
            console.log("Delete operation failed");
            throw createError(500);
        } else if ((result.n = 0)) {
            throw createError(404);
        }
        console.log(`deleted a document from ${collection}`);
    };

    /**
     * Gets all matching elements
     * @param {string} collection - name of the collection
     * @param {FilterQuery} [query={}] - MongoDB filter query
     * @returns {Promise<void>}
     */
    deleteMany = async function(collection, query) {
        let finalQuery = query || {};
        result = await this.db
            .db()
            .collection(collection)
            .deleteMany(finalQuery).result;
        if (!result.ok) {
            console.log("Delete operation failed");
            throw createError(500);
        }
        console.log(`deleted ${result.n} documents from ${collection}`);
    };

    /**
     * Updates first matching element
     * @param {string} collection - name of the collection
     * @param {FilterQuery} [query={}] - MongoDB filter query
     * @param {any} newvalues - values to update
     * @returns {Promise<void>}
     */
    updateOne = async function(collection, query, newvalues) {
        let finalQuery = query || {};
        await this.db
            .db()
            .collection(collection)
            .updateOne(finalQuery, newvalues);
        console.log(`updated a document in ${collection}`);
    };

    /**
     * Updates all matching elements
     * @param {string} collection - name of the collection
     * @param {FilterQuery} [query={}] - MongoDB filter query
     * @param {any} newvalues - values to update
     * @returns {Promise<void>}
     */
    updateMany = async function(collection, query, newvalues) {
        let finalQuery = query || {};
        result = await this.db
            .db()
            .collection(collection)
            .updateMany(finalQuery, newvalues);
        console.log(
            `updated ${result.modifiedCount} documents in ${collection}`
        );
    };
}

function loadPassword() {
    try {
        let password = readFileSync(PROD_PASS_LOCATION).toString();
        return password;
    } catch (error) {
        console.log(
            "ERROR: Couldn't get the production database password. Is the 'db-password.txt' file present in the backend root directory?"
        );
        throw error;
    }
}
