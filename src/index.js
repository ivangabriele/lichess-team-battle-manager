const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const moment = require("moment");
const os = require("os");

dotenv.config();

const GOOGLE_SHEET_URL = [
  `https://spreadsheets.google.com/feeds/cells/`,
  process.env.GOOGLE_SHEET_ID,
  `/1/public/full?alt=json`,
].join("");

const axiosInstance = axios.create({
  baseURL: "https://lichess.org/api",
  headers: {
    Authorization: `Bearer ${process.env.LICHESS_API_ACCESS_TOKEN}`,
  },
});

const now = () => moment().toISOString();
const waitFor = (inMs) => new Promise((resolve) => setTimeout(resolve, inMs));

async function start() {
  try {
    const { data: teamsData } = await axiosInstance.get(GOOGLE_SHEET_URL);

    console.log(teamsData.feed.entry);
  } catch (err) {
    console.log(now(), `[start()] Error: ${err}`);
    console.log(err);
  }
}

start();
