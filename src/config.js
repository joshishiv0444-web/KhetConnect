// Central API configuration
// In development: requests go through the CRA proxy (package.json → localhost:5001)
// In production:  set REACT_APP_API_URL to your deployed Render backend URL
//   e.g. REACT_APP_API_URL=https://khetconnect-backend.onrender.com/api/v1

const API = process.env.REACT_APP_API_URL || '/api/v1';

export default API;
