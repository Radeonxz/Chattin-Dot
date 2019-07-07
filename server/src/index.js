import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import WebSocketServer, {Server} from 'ws';
import AppRouter from './app-router';
import Model from './models';
import Database from './database';
import dotenv from 'dotenv'

const PORT = 3001;
const app = express();
app.server = http.createServer(app);

// Setup env
dotenv.config();

app.use(morgan('dev'));

// Setup CORS
app.use(cors({
  exposedHeaders: '*'
}));

app.use(bodyParser.json({
  limit: '50mb'
}));

app.wss = new Server({
  server: app.server
});

// Connect to MongoDB
const mongodbURI = process.env.MONGODB_URI;
console.log('mongodbURI', mongodbURI);
new Database().connect(mongodbURI, {
  useNewUrlParser: true
}).then((db) => {
  console.log('Successfully connected to MongoDB');
  app.db = db;
}).catch((err) => {
  throw(err);
});

// import models
app.models = new Model(app);

// Import app-router
app.routers = new AppRouter(app);

/*
let clients = [];

app.wss.on('connection', (connection) => {
  const userId = clients.length + 1;

  connection.userId = userId;

  const newClient = {
      ws: connection,
      userId: userId,
  }

  clients.push(newClient);

  console.log('New client connected with userId: ', userId);

  // //listen event new message from client
  connection.on('message', (message) => {

      console.log('Got new message from client, the message is: ', message);
  
      //send back message to client after client connected to the server
      connection.send(message + ' yoyoyo');
  });

  //close connection with clients
  connection.on('close', () => {
      console.log('Client with ID:', userId, 'has disconnected');
      clients = clients.filter((client) => client.userId !== userId);
  });
});
*/

app.server.listen(process.env.PORT || PORT, () => {
  console.log(`App is running on port ${app.server.address().port}`);
});

export default app;

// To use the bundled libc++ please add the following LDFLAGS:
//   LDFLAGS="-L/usr/local/opt/llvm/lib -Wl,-rpath,/usr/local/opt/llvm/lib"

// llvm is keg-only, which means it was not symlinked into /usr/local,
// because macOS already provides this software and installing another version in
// parallel can cause all kinds of trouble.

// If you need to have llvm first in your PATH run:
//   echo 'export PATH="/usr/local/opt/llvm/bin:$PATH"' >> ~/.bash_profile

// For compilers to find llvm you may need to set:
//   export LDFLAGS="-L/usr/local/opt/llvm/lib"
//   export CPPFLAGS="-I/usr/local/opt/llvm/include"