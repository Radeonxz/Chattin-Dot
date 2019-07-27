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

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('app/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'app', 'build', 'index.html'));
  });
}

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