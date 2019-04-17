import _ from 'lodash'
import moment from 'moment'

export const START_TIME = new Date();

export default class AppRouter {
  constructor(app) {
    this.app = app;
    this.setupRouter = this.setupRouter.bind(this);
    this.setupRouter();
  }

  setupRouter() {
    const app = this.app;
    console.log('yyy');

    /**
    * @endpoint: /
    * @method: GET
    **/
    app.get('/', (req, res, next) => {
      return res.json({
        started: moment(START_TIME).fromNow(),
      })
    });

    /**
    * @endpoint: /api/users
    * @method: POST
    **/
    app.post('/api/users', (req, res, next) => {
      const body = req.body;
      app.models.user.create(body).then((user) => {
        _.unset(user, 'password');
        return res.status(200).json(user);
      })
      .catch(err => {
        return res.status(400).json(err);
      })
    });

    /**
    * @endpoint: /api/users/:id
    * @method: GET
    **/
    app.get('/api/users/:id', (req, res, next) => {
      const userId = _.get(req, 'params.id');

      app.models.user.load(userId).then((user) => {
        _.unset(user, 'password');
        return res.status(200).json(user);
      }).catch(err => {
        return res.status(404).json({
          error: err,
        });
      });
    });
  }
}