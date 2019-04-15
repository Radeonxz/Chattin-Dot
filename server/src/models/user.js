import _ from 'lodash';
import { isEmail } from '../helper';

export default class User {
  constructor(app) {
    this.app = app;
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
    return callback(null, user);
  }

  create(user) {
    const db = this.app.db;
    // console.log('db shoule be', db);
    console.log('user is', user);
    return new Promise((resolve, reject) => {
      this.beforeSave(user, (err, user) => {
        console.log('After validation:', err, user);
        if(err) {
          // return reject(err);
          return reject({message: 'Error when saving the user'});
        }
        // return resolve(db);
        console.log('herererere');
        console.log('users hererere', user);
        db.collection('users').insertOne(user, (err, info) => {
          console.log('user shoule be', user);
          if(err) {
            reject({message: 'Error when saving the user'});
          } 
          return resolve(user);
        });
      });
    });
  }
  
}