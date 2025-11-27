import axios from 'axios';

/**
 * Configured Axios instance for making API requests to the backend.
 * Base URL is set to 'http://localhost:5000/api'.
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to our Express Server
});

export default api;
