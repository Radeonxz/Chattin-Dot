import moment from 'moment';
import { ObjectId } from 'mongodb';
import { OrderedMap } from 'immutable';

export default class Token {
  constructor(app) {
    this.app = app;

    this.tokens = new OrderedMap();
  }

  loadTokenAndUser(id) {
    return new Promise((resolve, reject) => {
      this.load(id).then((token) => {
        const userId = `${token.userId}`;
        
        this.app.models.user.load(userId).then((user) => {
          token.user = user;
          return resolve(token);
        }).catch((err) => {
          return reject(err);
        });
      }).catch((err) => {
        return reject(err);
      });
    })
  }

  load(id = null) {
    id = `${id}`;

    return new Promise((resolve, reject) => {
      // check token in cache, if not found in cache then query db
      const tokenFromCache = this.tokens.get(id);
      if(tokenFromCache) {
        return resolve(tokenFromCache);
      }

      this.findTokenById(id, (err, token) => {
        if(!err && token) {
          const tokenId = token._id.toString();
          this.tokens = this.tokens.set(tokenId, token);
        }
        return err ? reject(err) : resolve(token);
      });
    })
  }

  findTokenById(id, callback = () => {}) {
    // console.log('Begin to query token from db...');
    const idObject = new ObjectId(id);
    const query = {_id: idObject};
    this.app.db.collection('tokens').findOne(query, (err, result) => {
      if(err || !result) {
        return callback({message: 'Not found'}, null);
      }

      return callback(null, result);
    });
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