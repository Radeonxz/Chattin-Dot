import { OrderedMap } from "immutable"
import { ObjectId } from 'mongodb'
import _ from 'lodash'

export default class connection {
  constructor(app) {
    this.app = app;

    this.connections = OrderedMap();

    // TODO redis db
    this.modelDidLoad();
  }

  decodeMessage(msg) {
    let messageObject = null;
    try {
      messageObject = JSON.parse(msg);
    } catch(err) {
      console.log('An error occured when decode the msg', msg);
    }
    return messageObject;
  }

  send(ws, obj) {
    const message = JSON.stringify(obj);
    ws.send(message);
  }

  doTheJob(socketId, msg) {
    const action = _.get(msg, 'action');
    const payload = _.get(msg, 'payload');
    const userConnection = this.connections.get(socketId);

    switch(action) {
      case 'create_message':
        if(userConnection.isAuthenticated) {
          let messageObject = payload;
          messageObject.userId = _.get(userConnection, 'userId');
          // console.log('got msg from client about creating new message', payload);

          this.app.models.message.create(messageObject).then((message) => {
            console.log('created new message', message);

            const channelId = _.toString(_.get(message, 'channelId'));
            this.app.models.channel.load(channelId).then((channel) => {
              console.log('got channel of the message', channel);
              const memberIds = _.get(channel, 'members', []);

              _.each(memberIds, (memberId) => {
                memberId = _.toString(memberId);
                const memberConnections = this.connections.filter((c) => _.toString(c.userId) === memberId);
                memberConnections.forEach((connection) => {
                  const ws = connection.ws;
                  this.send(ws, {
                    action: 'message_added',
                    payload: message,
                  });
                });
              });
            })
            // message created successful


          }).catch(err => {
            // send back to the socket client who sent this meesage with error
            const ws =userConnection.ws;
            this.send(ws, {
              action: 'create_message_error',
              payload: payload,
            });
          });
        }
        
      
      
        break;

      case 'create_channel':
        let channel = payload;
        const userId = userConnection.userId;
        channel.userId = userId;

        this.app.models.channel.create(channel).then((channelObject) => {
          // Successfully created new channel
          // console.log('successfully ceated new channel', channelObject);

          // Send notification to all members in this channel
          let memberConnections = [];
          const memberIds = _.get(channelObject, 'members', []);

          // fetch all users has memberId
          const query = {
            _id: {$in: memberIds}
          };

          const queryOptions = {
            _id: 1,
            nema: 1,
            created: 1,
          };

          this.app.models.user.find(query, queryOptions).then((users) => {
            channelObject.users = users;

            _.each(memberIds, (id) => {
              const userId = id.toString();
              const memberConnection = this.connections.filter((con) => `${con.userId}` === userId);
              if(memberConnection.size) {
                memberConnection.forEach((con) => {
                  const ws = con.ws;
                  const obj = {
                    action: 'channel_added',
                    payload: channelObject,
                  }
  
                  // send to socket client for matched userid users
                  this.send(ws, obj);
                });
                console.log('memberconnections', memberConnection);
              }
            });
          });
          // const memberConnections = this.connections.filter((con) => `${con.userId}` = )
        });
        console.log('sss', channel);
        break;


      case 'auth':
        const userTokenId = payload;
        let connection = this.connections.get(socketId);
        if(connection) {
          // find user with token and verify it
          this.app.models.token.loadTokenAndUser(userTokenId).then((token) => {
            const userId = token.userId;
            connection.isAuthenticated = true;
            connection.userId = `${userId}`;
            this.connections = this.connections.set(socketId, connection);

            // now send back to client that you are logged in
            const obj = {
              action: 'auth_success',
              payload: 'You are verified',
            }
            this.send(connection.ws, obj);
          }).catch((err) => {
            // send back to socket client that you are not logged in
            const obj = {
              action: 'auth_error',
              payload: 'An error occured when authentication...' + userTokenId,
            };
            this.send(connection.ws, obj);
          });
        }

        break;
      
      default:
      break;
    }
  }

  modelDidLoad() {
    this.app.wss.on('connection', (ws) => {
      const socketId = new ObjectId().toHexString();

      const clientConnection = {
        _id: socketId,
        ws: ws,
        userId: null,
        isAuthenticated: false,
      }
      // save this connection client into cache
      this.connections = this.connections.set(socketId, clientConnection);
      

      // listen msg from websocket client
      ws.on('message', (msg) => {
        const message = this.decodeMessage(msg);
        this.doTheJob(socketId, message);
      });

      ws.on('close', () => {
        // remove this socket client from cache collection
        this.connections = this.connections.remove(socketId);
      });
    });
  }
}