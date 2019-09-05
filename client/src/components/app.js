import React, {Component} from 'react';
import Store from '../store';
import Messenger from './messenger';

//import ReactDOM from 'react-dom'
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fab, fas)

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      store: new Store(this),
    }
  }

  render() {
    const {store} = this.state;
    return <div className= 'app-wrapper'>
      <Messenger store = {store} />
    </div>
  }
}