import {OrderedMap} from 'immutable'
import _ from 'lodash'

const users = OrderedMap({
  '1': {_id: '1', name: 'Xuan Zhao VeryLong', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@alex.png'},
  '2': {_id: '2', name: 'Zhao111111111111111111111', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@bob.png'},
  '3': {_id: '3', name: 'Bob2222222222222222222222', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@john.png'},
});

export default class Store {
  constructor(appComponent) {
    this.app = appComponent;
    this.messages = new OrderedMap();
    this.channels = new OrderedMap();
    this.activeChannelId = null;
    
    // Current logged in user
    this.user = {
      _id: '1',
      name: 'Xuan Zhao VeryLong',
      avatar: 'https://api.adorable.io/avatars/100/abott@alex.png',
      created: new Date(),
    }
  }

  addUserToChannel(channelId, userId) {
    const channel = this.channels.get(channelId);

    if(channel) {
      channel.members = channel.members.set(userId, true);
      this.channels = this.channels.set(channelId, channel);
      this.update();
    }
  }

  searchUsers(search = '') {
    const keyword = _.toLower(search);
    let searchItems = new OrderedMap();
    const currentUser = this.getCurrentUser();
    const currentUserId = _.get(currentUser, '_id');

    if(_.trim(search).length) {
      searchItems = users.filter((user) => _.get(user, '_id') !== currentUserId && _.includes(_.toLower(_.get(user, 'name')), keyword));
    }

    return searchItems.valueSeq();
  }

  onCreateNewChannel(channel = {}) {
    const channelId = _.get(channel, '_id');
    this.addChannel(channelId, channel);
    this.setActiveChannelId(channelId);
    // console.log(JSON.stringify(this.channels.toJS()));
  }

  getCurrentUser() {
    return this.user;
  }

  setActiveChannelId(id) {
    this.activeChannelId = id;
    this.update();
  }

  getActiveChannel() {
    const channel = this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
    return channel;
  }

  addMessage(id, message = {}) {
    const user = this.getCurrentUser();
    message.user = user;
    this.messages = this.messages.set(id, message);
    const channelId = _.get(message, 'channelId');

    if(channelId){     
      let channel = this.channels.get(channelId);
      channel.isNew = false;
      channel.lastMessage = _.get(message, 'body', '');
      channel.messages = channel.messages.set(id, true);
      this.channels = this.channels.set(channelId, channel);
    }

    this.update();
  }
  
  getMessages() {
    return this.messages.valueSeq();
  }

  getMessagesFromChannel(channel) {
    let messages = [];

    if(channel){
      channel.messages.map((value, key) => {
        const message = this.messages.get(key);
        messages.push(message);
      });
    }

    return messages;
  }

  getMembersFromChannel(channel) {
    let members = new OrderedMap();

    if(channel){
      channel.members.map((value, key) => {
        const user = users.get(key);
        const loggedUser = this.getCurrentUser();

        if(_.get(loggedUser, '_id') !== _.get(user, '_id')) {
          members = members.set(key, user);
        }       
      });
    }

    return members.valueSeq();
  }

  addChannel(index, channel = {}) {
    this.channels = this.channels.set(`${index}`, channel);
    this.update();
  }

  getChannels() {
    //sort channel by date
    this.channels = this.channels.sort((a, b) => a.created < b.created);
    return this.channels.valueSeq();
  }

  update() {
    this.app.forceUpdate();
  }
}