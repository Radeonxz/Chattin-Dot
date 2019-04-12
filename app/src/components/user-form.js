import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'

export default class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      user: {
        email: '',
        password: ''
      }
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.onTextFieldChange = this.onTextFieldChange.bind(this);
  }

  onSubmit(event) {
    const { user } = this.state;
    const { store } = this.props;
    event.preventDefault();
    this.setState({message: null}, () => {
      store.login(user.email, user.password)
      .then((user) => {
        console.log('callback', user);
        this.setState({
          message: null,
        });
      })
      .catch((err) => {
        this.setState({
          message: {
            body: err,
            type: 'error'
          }
        });
      });
    });
    
    if(user.email && user.password) {
      
    }
  }

  onTextFieldChange(event) {
    let { user } = this.state;
    const field = event.target.name;
    user[field] = event.target.value;
    this.setState({
      user: user
    });
  }

  render() {
    const { user, message } = this.state;
    return (
      <div className='user-form'>
        <form onSubmit={this.onSubmit} method='post'>
          {message ? <p className={classNames('app-message', _.get(message, 'type'))}>{_.get(message, 'body')}</p> : null}
          <div className='form-item'>
            <label>Email</label>
            <input value={_.get(user, 'email')} onChange={this.onTextFieldChange} type='email' placeholder='Email address' name='email' />
          </div>

          <div className='form-item'>
            <label>Password</label>
            <input value={_.get(user, 'password')} onChange={this.onTextFieldChange} type='password' placeholder='Password' name='password' />
          </div>

          <div className='form-actions'>
            <button type='button'>Create new accouont?</button>
            <button className='primary' type='submit'>Sign In</button>
          </div>
        </form>
      </div>
    );
  }
}