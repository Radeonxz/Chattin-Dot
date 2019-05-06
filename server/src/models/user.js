import _ from 'lodash'
import { isEmail } from '../helper'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import { OrderedMap } from 'immutable'

const saltRound = 10;

export default class User {
  constructor(app) {
    this.app = app;
    this.users = new OrderedMap();
  }

  search(q='') {
    return new Promise((resolve, reject) => {
      const regex = new RegExp(q, 'i');
      const query = {
        $or: [
          {name: {$regex: regex}},
          {email: {$regex: regex}},
        ],
      };
      this.app.db.collection('users').find(query, {_id: true, name: true, created: true}).toArray((err, results) => {
        if(err || !results || !results.length) {
          return reject({messae: 'User not Found'});
        }
        return resolve(results);
      })
    })
  }

  login(user) {
    const email = _.get(user, 'email', '');
    const password = _.get(user, 'password', '');

    return new Promise((resolve, reject) => {
      if(!password || !email || !isEmail(email)) {
        return reject({message: 'An error occured when login'});
      }

      // find user by email in db
      this.findUserByEmail(email, (err, result) => {
        if(err) {
          return reject({message: 'Login Error'});
        }

        // check user password
        const hashPassword = _.get(result, 'password');
        const isMatch = bcrypt.compareSync(password, hashPassword);
        console.log(isMatch);
        if(!isMatch) {
          return reject({message: 'Login Error'});
        }

        // user login successfully and create new token
        const userId = result._id;
        this.app.models.token.create(userId).then((token) => {
          token.user = result;
          return resolve(token);
        }).catch(err => {
          return reject({message: 'Login Error'});
        })
        
      })
    })
  }

  findUserByEmail(email, callback = () => {}) {
    this.app.db.collection('users').findOne({email: email}, (err, result) => {
      if(err || !result) {
        return callback({message: 'User not found'})
      }

      return callback(null, result);
    });
  }

  load(id) {
    id = `${id}`;
    
    return new Promise((resolve, reject) => {

      // Find in user in cache
      const userInCache = this.users.get(id);
      if(userInCache) {
        return resolve(userInCache);
      }

      // If not found in cache
      this.findUserById(id, (err, user) => {
        if(!err && user) {
          this.users = this.users.set(id, user);
        }
        return err ? reject(err) : resolve(user);
      });
    });
  }

  findUserById(id, callback = () => {}) {
    console.log('first query in db');
    if(!id) {
      return callback({message: 'Non valid user id'}, null);
    }
    const userId = new ObjectId(id);
    this.app.db.collection('users').findOne({_id: userId}, (err, result) => {
      if(err || !result) {
        return callback({message: 'User not found'});
      }
      return callback(null, result);
    });
  }

  beforeSave(user, callback = () => {}) {
    let errors = [];
    const fields = ['name', 'email', 'password'];
    const validations = {
      name: {
        errorMessage: 'name is required',
        do: () => {
          const name = _.get(user, 'name', '');
          return name.length;
        }
      },
      email: {
        errorMessage: 'email is incorrect',
        do: () => {
          const email = _.get(user, 'email', '');
          return !email.length || !isEmail(email) ? false : true;
        }
      },
      password: {
        errorMessage: 'password is required and more than 8 characters',
        do: () => {
          const password = _.get(user, 'password', '');
          return !password.length || password.length < 8 ? false : true;
        }
      }
    }

    fields.forEach((field) => {
      const fieldValidation = _.get(validations, field);
      if(fieldValidation) {
        const isValid = fieldValidation.do();
        const msg = fieldValidation.errorMessage;
        return !isValid ? errors.push(msg) : null;
      }
    });

    if(errors.length) {
      const err = _.join(errors, ', ');
      return callback(err, null);
    }

    // Check if email is existing in db
    const email = _.toLower(_.trim(_.get(user, 'email', '')));
    this.app.db.collection('users').findOne({email: email}, (err, result) => {
      if(err || result) {
        return callback({message: 'Email is already exist'}, null);
      }

      // return success callback
      const password = _.get(user, 'password');
      const hashPassword = bcrypt.hashSync(password, saltRound);
      
      const userFormatted = {
        name: `${_.trim(_.get(user, 'name'))}`,
        email: email,
        password: hashPassword,
        created: new Date(),
      };
      return callback(null, userFormatted);
    });
  }

  create(user) {
    const db = this.app.db;

    return new Promise((resolve, reject) => {
      this.beforeSave(user, (err, user) => {
        console.log('After validation:', err, user);
        if(err) {
          return reject(err);
        }

        db.collection('users').insertOne(user, (err, info) => {
          if(err) {
            reject({message: 'Error when saving the user'});
          }
          
          const userId = _.get(user, '_id').toString();
          this.users = this.users.set(userId, user);
          return resolve(user);
        });
      });
    });
  }
  
}