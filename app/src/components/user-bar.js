import React, { Component } from 'react'
import _ from 'lodash'
import UserForm from './user-form'
import UserMenu from './user-menu'

import avatar from '../images/avatar.jpg'

export default class UserBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUserForm: false,
      showUserMenu: false,
    }
  }

  render() {
    const { store } = this.props;
    const me = store.getCurrentUser();
    const profilePicture = _.get(me, 'avatar');
    return (
      <div className = 'user-bar'>
        {!me ? <button onClick={() => {
          this.setState({
            showUserForm: true,
          })
        }} type='button' className='login-btn'>Sign In</button> : null}
        
        <div className = 'profile-name'><p>{_.get(me, 'name')}</p></div>
        {/*<div className = 'profile-image'><img src = 'https://randomuser.me/api/portraits/lego/2.jpg' alt = '' /></div>*/}
        
        <div className = 'profile-image' onClick={() => {
          this.setState({
            showUserMenu: true,
          })
        }}><img src = {profilePicture ? profilePicture : avatar} alt = '' /></div>
        
        {!me && this.state.showUserForm ? <UserForm onClose={() => {
          this.setState({
            showUserForm: false,
          })
        }} store={store} /> : null}

        {this.state.showUserMenu ? <UserMenu onClose={() => {
            this.setState({
              showUserMenu: false,
            })
          }} store={store}/> : null}
      </div>
    );
  }
}