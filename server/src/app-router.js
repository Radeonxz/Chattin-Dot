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
    * @endpoint: /api/users/me
    * @method: GET
    **/
    app.get('/api/users/me', (req, res, next) => {
      let tokenId = req.get('authorization');
      if(!tokenId) {
        // get token from query
        tokenId = _.get(req, 'query.auth');
      }

      app.models.token.load(tokenId).then((accessToken) => {
        return res.json(accessToken);
      }).catch(err => {
        return res.status(401).json({
          error: err
        })
      });
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

    /**
    * @endpoint: /api/users/login
    * @method: POST
    **/

    app.post('/api/users/login', (req, res, next) => {
      const body = _.get(req, 'body');
      app.models.user.login(body).then((token) => {
        console.log('successfully logged in', token);
        _.unset(token, 'user.password');
        return res.status(200).json(token);
      }).catch(err => {
        return res.status(401).json({
          error: err
        })
      })
    });



  }
}