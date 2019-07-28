import React, {Component} from 'react'
import _ from 'lodash'

export default class SearchUser extends Component{
  constructor(props) {
    super(props);
    this.handleOnclick = this.handleOnclick.bind(this);
  }

  handleOnclick(user) {
    if(this.props.onSelect) {
      this.props.onSelect(user);
    }
  }

  render(){
    const {store} = this.props;
    const users = store.getSearchUsers();

    return <div className = 'search-user'>
      <div className = 'user-list'>
      {users.map((user, index) => {
        return (<div onClick={() => this.handleOnclick(user)} key = {index} className = 'user'>
          <img src = {_.get(user, 'avatar')} alt = '' />
          <h2>{_.get(user, 'name')}</h2>
        </div>)
      })}
      </div>
    </div>
  }
}