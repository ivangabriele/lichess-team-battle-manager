const axios = require("axios");

const { LICHESS_API_ACCESS_TOKEN, LICHESS_API_URL } = process.env;

const axiosInstance = axios.create({
  baseURL: LICHESS_API_URL,
  headers: {
    Authorization: `Bearer ${LICHESS_API_ACCESS_TOKEN}`,
  },
});

module.exports = axiosInstance;
