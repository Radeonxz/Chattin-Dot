import _ from 'lodash'
import { OrderedMap } from 'immutable'
import { ObjectID } from 'mongodb'

export default class Message {
  constructor(app) {
    this.app = app;
  }

  create(obj) {
    return new Promise((resolve, reject) => {
      let id = _.get(obj, '_id', null);
      id = _.toString(id);
      const userId = new ObjectID(_.get(obj, 'userId'));
      const channelId = new ObjectID(_.get(obj, 'channelId'));

      const message = {
        _id: new ObjectID(id),
        body: _.get(obj, 'body', ''),
        userId: userId,
        channelId: channelId,
        created: new Date(),
      }

      this.app.db.collection('messages').insertOne(message, (err, info) => {
        return err ? reject(err) : resolve(message);
      });
    });
  }
}