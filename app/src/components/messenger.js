import React, {Component} from 'react'
import classNames from 'classnames'
import {OrderedMap} from 'immutable'
import _ from 'lodash'
import moment from 'moment'
import {ObjectID} from '../helpers/objectid'

import avatar from '../images/avatar.jpg'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import SearchUser from './search-user'
import Userbar from './user-bar'

export default class Messenger extends Component {
  constructor(props) {
    super(props);

    this.state = {
      height: window.innerHeight,
      newMessage: 'Hello there...',
      searchUser: '',
      showSearchUser: false,
    }

    this._onResize = this._onResize.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.scrollMessagesToBottom = this.scrollMessagesToBottom.bind(this);
    this._onCreateChannel = this._onCreateChannel.bind(this);
    this.renderChannelAvatars = this.renderChannelAvatars.bind(this);
    this.renderChannelTitle = this.renderChannelTitle.bind(this);
  }

  renderChannelAvatars(channel) {
    const {store} = this.props;
    const members = store.getMembersFromChannel(channel);
    const maxDisplay = 4;
    const total = members.size > maxDisplay ? maxDisplay : members.size;
    const avatars = members.map((user, index) => {
      return index < maxDisplay ? <img src = {_.get(user, 'avatar')} alt = {_.get(user, 'name')} /> : null;
    });
    return <div className = {classNames('channel-avatars', `channel-avatars-${total}`)}>{avatars}</div>
  }

  renderChannelTitle(channel = null) {
    if(!channel) {
      return null;
    }
    const {store} = this.props;
    // const activeChannel = store.getActiveChannel();
    const members = store.getMembersFromChannel(channel);
    const names = [];

    members.forEach((user) => {
      const name = _.get(user, 'name');
      names.push(name);
    });

    let title = _.join(names, ',');
    if(!title && _.get(channel, 'isNew')) {
      title = 'New channel';
    }

    return <h2>{title}</h2>
  }

  _onCreateChannel() {
    const {store} = this.props;
    const currentUser = store.getCurrentUser();
    const currentUserId = _.get(currentUser, '_id');
    const channelId = new ObjectID().toString();

    const channel = {
      _id: channelId,
      title: '',
      lastMessage: '',
      members: new OrderedMap(),
      messages: new OrderedMap(),
      isNew: true,
      userId: currentUserId,
      created: new Date(),
    };

    channel.members = channel.members.set(currentUserId, true);
    store.onCreateNewChannel(channel);
  }

  scrollMessagesToBottom(){
    if(this.messagesRef){
      this.messagesRef.scrollTop = this.messagesRef.scrollHeight;
    }
  }

  renderMessage(message) {
    const text = _.get(message, 'body', '');
    const html = _.split(text, '\n').map((m, key) => {
      return <p key = {key} dangerouslySetInnerHTML = {{__html: m}} />
    });

    return html;
  }

  handleSend() {
    const {newMessage} = this.state;
    const {store} = this.props;

    if(_.trim(newMessage).length){
      //create new message
      const messageId = new ObjectID().toString();
      const channel = store.getActiveChannel();
      const channelId = _.get(channel, '_id', null);
      const currentUser = store.getCurrentUser();
      //const currentUserName = _.get(currentUser, 'name', null);

      const message = {
        _id: messageId,
        channelId: channelId,
        userId: _.get(currentUser, '_id'),
        body: newMessage,
        me: true,
      };

      store.addMessage(messageId, message);

      this.setState({
        newMessage: '',
      }) 
    }
  }

  _onResize() {
    this.setState({
      height: window.innerHeight
    });
  }

  componentDidUpdate() {
    this.scrollMessagesToBottom();
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  render() {
    const {store} = this.props;
    const {height} = this.state;
    const style = {
      height: height,
    };

    const activeChannel = store.getActiveChannel();
    const messages = store.getMessagesFromChannel(activeChannel);//store.getMessages();
    const channels = store.getChannels();
    const members = store.getMembersFromChannel(activeChannel);

    return (
      <div style = {style} className = 'app-messenger'>
        <div className = 'header'>
          <div className = 'left'>
            <button className = 'left-action'><FontAwesomeIcon icon = "cog" /></button>
            <button onClick = {this._onCreateChannel} className = 'right-action'><FontAwesomeIcon icon = "edit" /></button>
            <h2>Messenger</h2>
            {/*<div className = 'actions'>
              <button>New message</button>
            </div>*/}
          </div>

          <div className = 'content'>
            {_.get(activeChannel, 'isNew') ? <div className = 'toolbar'>
              <label>To:</label>
              {
                members.map((user, key) => {
                  return <span onClick={() => {
                    store.removeMemberFromChannel(activeChannel, user);
                  }} key={key}>{_.get(user, 'name')}</span>
                })
              }

              <input placeholder='Type name...' onChange = {(event) => {
                const searchUserText = _.get(event, 'target.value');
                this.setState({
                  searchUser: searchUserText,
                  showSearchUser: true
                }, () => {
                  store.startSearchUsers(searchUserText);
                });
              }} type = 'text' value = {this.state.searchUser} /> 

              {this.state.showSearchUser ? <SearchUser 
              onSelect={(user) => {
                this.setState({
                  showSearchUser: false,
                  searchUser: '',
                }, () => {
                  const channelId = _.get(activeChannel, '_id');
                  const userId = _.get(user, '_id');
                  store.addUserToChannel(channelId, userId);
                });
              }}
              store = {store} /> : null}
            </div> : this.renderChannelTitle(activeChannel) }
          </div>

          <div className = 'right'>
            <Userbar store={store} />
          </div>
        </div>

        <div className = 'main'>
          <div className = 'sidebar-left'>
            <div className = 'channels'>
              {channels.map((channel, key) => {
                return (
                  <div onClick = {(key) => {
                    store.setActiveChannelId(channel._id);
                  }} key = {channel._id} className = {classNames('channel', {'notify': _.get(channel, 'notify') === true}, {'active': _.get(activeChannel, '_id') === _.get(channel, '_id', null)})}>
                    <div className = 'user-img'>
                      {this.renderChannelAvatars(channel)}
                    </div>
                    <div className = 'channel-info'>
                      {this.renderChannelTitle(channel)}
                      <p>{channel.lastMessage}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className = 'content'>
            <div ref = {(ref) => this.messagesRef = ref} className = 'messages'>
              {messages.map((message, index) => {
                const user = _.get(message, 'user');
                return (
                  <div key = {index} className = {classNames('message', {'me': message.me})}>
                    <div className = 'msg-user-img'>
                      <img src = {_.get(user, 'avatar')} alt = '' />
                    </div>
                    <div className = 'msg-body'>
                      <div className = 'msg-author'>{message.me ? 'You' : _.get(message, 'user.name')} :</div>
                      <div className = 'msg-text'>
                        {this.renderMessage(message)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {activeChannel && members.size > 0 ? <div className = 'messenger-input'>
              <div className = 'text-input'>
                <textarea onKeyUp = {(event) => {
                  if(event.key === 'Enter' && !event.shiftKey){
                    this.handleSend();
                  }                                    
                }} onChange = {(event) => {
                  this.setState({newMessage: _.get(event, 'target.value')});
                }} value = {this.state.newMessage} placeholder = 'Message...' />
              </div>
              <div className = 'actions'>
                <button onClick = {this.handleSend} className = 'send'>Send</button>
              </div>
            </div> : null}
          </div>

          <div className = 'sidebar-right'>
            { members.size > 0 ? <div>
              <h2 className = 'title'>Members</h2>
              <div className = 'members'>
                {members.map((member, key) => {
                  return (
                    <div key = {key} className = 'member'>
                      <div className = 'user-img'>
                        <img src = {_.get(member, 'avatar')} alt = '' />
                      </div>
                      <div className = 'member-info'>
                        <h2>{member.name}</h2>
                        <p>Joined: {moment(member.created).fromNow()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div> : null
            }
          </div>
        </div>
      </div>
    )
  }
}