import axios from 'axios';

// This logic checks: "Are we on the live site?"
// If YES -> Use the Render link.
// If NO  -> Use the Localhost link.
const baseUrl = import.meta.env.MODE === 'production' 
  ? 'https://nexus-c2v7.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseUrl, 
});

export default api;