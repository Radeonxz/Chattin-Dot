import { MongoClient } from 'mongodb';


export default class Database {
  connect(URL, options) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(URL, options, (err, db) => {
        return err ? reject(err) : resolve(db);
      });
    });
  }
}