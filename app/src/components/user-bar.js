import React, { Component } from 'react'
import _ from 'lodash'
import UserForm from './user-form'

import avatar from '../images/avatar.jpg'

export default class UserBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUseForm: false,
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
            showUseForm: true,
          })
        }} type='button' className='login-btn'>Sign In</button> : null}
        <div className = 'profile-name'><p>{_.get(me, 'name')}</p></div>
        {/*<div className = 'profile-image'><img src = 'https://randomuser.me/api/portraits/lego/2.jpg' alt = '' /></div>*/}
        <div className = 'profile-image'><img src = {profilePicture ? profilePicture : avatar} alt = '' /></div>
        
        {!me && this.state.showUseForm ? <UserForm onClose={() => {
          this.setState({
            showUseForm: false,
          })
        }} store={store} /> : null}
      </div>
    );
  }
}