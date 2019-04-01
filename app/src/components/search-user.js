import React, {Component} from 'react'
import _ from 'lodash'

export default class SearchUser extends Component{

  render(){
    const {store, search} = this.props;
    const users = store.searchUsers(search);

    return <div className = 'search-user'>
      <div className = 'user-list'>

      {users.map((user, index) => {
        return <div key = {index} className = 'user'>
          <img src = {_.get(user, 'avatar')} alt = '' />
          <h2>{_.get(user, 'name')}</h2>
        </div>
      })}

      </div>
    </div>
  }


}