import _ from 'lodash';
import { OrderedMap } from 'immutable';

export default class realtime {
  constructor(store) {
    this.store = store;
    this.ws = null;
    this.isConnected = false;
    this.connect();
  }

  decodeMessage(msg) {
    let message = {};
    try {
      message = JSON.parse(msg);
    } catch(err) {
      console.log(err);
    }
    return message;
  }

  readMessage(msg) {
    const store = this.store;
    const currentUser = store.getCurrentUser();
    const currentUserId = _.toString(_.get(currentUser, '_id'));
    const message = this.decodeMessage(msg);
    const action = _.get(message, 'action', '');
    const payload = _.get(message, 'payload');
    switch(action) {
      case 'message_added':
        let user = _.get(payload, 'user');

        // add this user to cache
        user = store.addUserToCache(user);

        const messageObject = {
          _id: payload._id,
          body: _.get(payload, 'body', ''),
          userId: _.get(payload, 'userId'),
          channelId: _.get(payload, 'channelId'),
          created: _.get(payload, 'created', new Date()),
          me: currentUserId === _.toString(_.get(payload, 'userId')),
          user: user,
        };

        console.log('message with message obj', messageObject);
        store.setMessage(messageObject);
        break;
      case 'channel_added':
        // check payload object and insert new channel to store
        const channelId = `${payload._id}`;
        const userId = `${payload.userId}`;

        const users = _.get(payload, 'users', []);

        let channel = {
          _id: channelId,
          title: _.get(payload, 'title', ''),
          lastMessage: _.get(payload, 'lastMessage', ''),
          members: new OrderedMap(),
          messages: new OrderedMap(),
          isNew: false,
          userId: userId,
          created: new Date(),
        };

        _.each(users, (user) => {
          // add this user to store.user collection
          const memberId = `${user._id}`;
          this.store.addUserToCache(user);
          channel.members = channel.members.set(memberId, true);
        });

        store.addChannel(channelId, channel);
        break;
      default:
        break;
    }
  }

  send(msg = {}) {
    const isConnected = this.isConnected;
    if(isConnected) {
      const msgString = JSON.stringify(msg);
      this.ws.send(msgString);
    }
  }

  authtication() {
    const store = this.store;
    const tokenId = store.getUserTokenId();
    if(tokenId) {
      const message = {
        action: 'auth',
        payload: `${tokenId}`
      }
      this.send(message);
    }
  }

  connect() {
    console.log('Begin connecting to server...');

    const ws= new WebSocket('ws://localhost:3001');
    this.ws = ws;
    ws.onopen = () => {
      console.log('You are connecting to the server');
      this.isConnected = true;
      this.authtication();

      ws.onmessage = (event) => {
        this.readMessage(_.get(event, 'data'));

        console.log('CLIENT server says', event.data);
      }

    };

    ws.onclose = () => {
      console.log('You are disconnected...');
      this.isConnected = false;
    }
  }
}