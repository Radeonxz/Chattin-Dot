import axios from 'axios';
const apiURL = 'http://localhost:3001';

export default class Service {
  get() {

  }

  post(endpoint = '', data = {}, options = {headers: {'Content-Type': 'application/json'}}) {
    const url = `${apiURL}/${endpoint}`;
    return axios.post(url, data, options);
  }
}