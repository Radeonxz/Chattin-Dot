export default class realtime {
  constructor(store) {
    this.store = store;
    this.ws = null;
    this.isConnected = false;
    this.connect();
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
        console.log('CLIENT server says', event.data);
      }

    };

    ws.onclose = () => {
      console.log('You are disconnected...');
      this.isConnected = false;
    }
  }
}