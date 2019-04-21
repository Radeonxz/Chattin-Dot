import moment from 'moment';
import { resolve } from 'path';

export default class Token {
  constructor(app) {
    this.app = app;
  }

  create(userId) {
    // const oneDate = moment().add(1, 'days').toDate();
    const token = {
      userId: userId,
      created: new Date(),
      // expiored: oneDate,
    }
    return new Promise((resolve, reject) => {
      this.app.db.collection('tokens').insertOne(token, (err, info) => {
        return err ? reject(err) : resolve(token);
      })
    })
    
  }
}