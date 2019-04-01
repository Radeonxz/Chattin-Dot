import {OrderedMap} from 'immutable'
import _ from 'lodash'

const users = OrderedMap({
  '1': {_id: '1', name: 'Xuan', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@alex.png'},
  '2': {_id: '2', name: 'Zhao', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@bob.png'},
  '3': {_id: '3', name: 'Bob', created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@john.png'},
});

export default class Store{
  constructor(appComponent){
    this.app = appComponent;
    this.messages = new OrderedMap();
    this.channels = new OrderedMap();
    this.activeChannelId = null;
    this.user = {
      _id: '1',
      name: 'Xuan',
      created: new Date(),
    }
  }

  searchUsers(search = ''){
    let searchItems = new OrderedMap();
    if(_.trim(search).length){
      users.filter((user) => {
        const name = _.get(user, 'name');
        const userId = _.get(user, '_id');

        if(_.includes(name, search)){
            searchItems = searchItems.set(userId, user);
        }
      })
    }
    return searchItems.valueSeq();
  }

  onCreateNewChannel(channel = {}){
    console.log('New channel:', channel);
    const channelId = _.get(channel, '_id');
    this.addChannel(channelId, channel);
    this.setActiveChannelId(channelId);
  }

  getCurrentUser(){
    return this.user;
  }

  setActiveChannelId(id){
    this.activeChannelId = id;

    this.update();
  }

  getActiveChannel(){
    const channel = this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();

    return channel;
  }

  addMessage(id, message = {}){
    this.messages = this.messages.set(`${id}`, message);

    const channelId = _.get(message, 'channelId');

    if(channelId){
        
      const channel = this.channels.get(channelId);

      channel.messages = channel.messages.set(id, true);

      this.channels = this.channels.set(channelId, channel);
    }

    this.update();
  }
  
  getMessages(){
    return this.messages.valueSeq();
  }

  getMessagesFromChannel(channel){

    let messages = [];

    if(channel){
      channel.messages.map((value, key) => {
        const message = this.messages.get(key);

        messages.push(message);
      });
    }
    return messages;
  }

  getMembersFromChannel(channel){
    let members = [];

    if(channel){
      channel.members.map((value, key) => {
        const member = users.get(key);

        members.push(member);
      });
    }
    return members;
  }

  addChannel(index, channel = {}){
    this.channels = this.channels.set(`${index}`, channel);

    this.update();
  }

  getChannels(){
    //return this.channels.valueSeq();

    //sort channel by date
    console.log('channels are:', this.channels.valueSeq);
    this.channels = this.channels.sort((a, b) => a.created < b.created);

    return this.channels.valueSeq();
  }

  update(){
    this.app.forceUpdate();
  }
}