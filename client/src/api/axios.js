import axios from 'axios';

/**
 * Configured Axios instance for making API requests.
 * Base URL is set to point to the local Express server ('http://localhost:5000/api').
 *
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to our Express Server
});

export default api;
