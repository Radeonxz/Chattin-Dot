import React, { Component } from 'react'
import _ from 'lodash'
import classNames from 'classnames'

export default class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      isLogin: true,
      user: {
        name: '',
        email: '',
        password: ''
      }
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.onTextFieldChange = this.onTextFieldChange.bind(this);
    this.onClickOutside = this.onClickOutside.bind(this);
  }

  onClickOutside(event) {
    if(this.ref && !this.ref.contains(event.target)) {
      if(this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.onClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.onClickOutside);
  }

  onSubmit(event) {
    const {user, isLogin} = this.state;
    const { store } = this.props;
    event.preventDefault();

    this.setState({message: null}, () => {
      if(isLogin) {
        store.login(user.email, user.password)
        .then((user) => {
          if(this.props.onClose) {
            this.props.onClose();
          }
          // this.setState({
          //   message: null,
          // });
        })
        .catch((err) => {
          this.setState({
            message: {
              body: err,
              type: 'error'
            }
          });
        });
      } else {
        store.register(user).then((_) => {
          this.setState({
            message: {
              body: 'User created.',
              type: 'success'
            }
          }, () => {
            // login user after register
            store.login(user.email, user.password)
            .then(() => {
              if(this.props.onClose) {
                this.props.onClose();
              }
            });
          });
        });
      }
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
    const {user, message, isLogin} = this.state;
    return (
      <div className='user-form' ref={(ref) => this.ref = ref}>
        <form onSubmit={this.onSubmit} method='post'>
          {message ? <p className={classNames('app-message', _.get(message, 'type'))}>{_.get(message, 'body')}</p> : null}
          {!isLogin ? <div className='form-item'>
            <label>Name</label>
            <input value={_.get(user, 'name', '')} onChange={this.onTextFieldChange} type='text' placeholder='Name' name={'name'} />
          </div> : null}

          <div className='form-item'>
            <label>Email</label>
            <input value={_.get(user, 'email')} onChange={this.onTextFieldChange} type='email' placeholder='Email address' name='email' />
          </div>

          <div className='form-item'>
            <label>Password</label>
            <input value={_.get(user, 'password')} onChange={this.onTextFieldChange} type='password' placeholder='Password' name='password' />
          </div>

          <div className='form-info'>
            <h6>*Sign in with test accounts</h6>
            <h6>john@123.com/123456789</h6>
            <h6>jane@123.com/123456789</h6>
          </div>

          <div className='form-actions'>
            {isLogin ? <button onClick={() => {
              this.setState({
                isLogin: false,
              });
            }} type='button'>Create new accouont?</button> : null}

            <button className='primary' type='submit'>{isLogin ? 'Sign In' : 'Create new account'}</button>
          </div>
        </form>
      </div>
    );
  }
}