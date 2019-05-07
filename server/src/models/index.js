import User from './user';
import Token from './token';
import Connection from './connection';

export default class Model {
  constructor(app) {
    this.app = app;

    this.user = new User(app);
    this.token = new Token(app);
    this.connection = new Connection(app);
  }
}