import _ from 'lodash'
import { isEmail } from '../helper'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'

const saltRound = 10;

export default class User {
  constructor(app) {
    this.app = app;
  }

  load(id) {
    return new Promise((resolve, reject) => {
      this.findUserById(id, (err, user) => {
        return err ? reject(err) : resolve(user);
      });
    });
  }

  findUserById(id, callback = () => {}) {
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
          return resolve(user);
        });
      });
    });
  }
  
}