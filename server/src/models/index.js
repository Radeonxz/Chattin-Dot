import User from './user';

export default class Model {
  constructor(app) {
    this.app = app;
    this.user = new User(app);
  }
}