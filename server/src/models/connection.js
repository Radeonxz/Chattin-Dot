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
    switch(action) {
      case 'create_channel':
        const channel = payload;
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
      })
    });
  }
}