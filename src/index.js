import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import { Server } from "ws";
import AppRouter from "./app-router";
import Model from "./models";
import Database from "./database";
import path from "path";

const PORT = 3001;
const app = express();
app.server = http.createServer(app);

app.use(morgan("dev"));

// Setup CORS
app.use(
  cors({
    exposedHeaders: "*"
  })
);

app.use(
  bodyParser.json({
    limit: "50mb"
  })
);

app.wss = new Server({
  server: app.server
});

// Connect to MongoDB
const mongodbURI = process.env.MONGODB_URI;
new Database()
  .connect(mongodbURI)
  .then(db => {
    console.log("Successfully connected to MongoDB");
    app.db = db;
  })
  .catch(err => {
    throw err;
  });

// import models
app.models = new Model(app);

// Import app-router
app.routers = new AppRouter(app);

// Serve static assets if in production
const clientPath = path.join(__dirname, "build");
app.use("/", express.static(clientPath));

app.server.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running on port ${app.server.address().port}`);
});

export default app;
