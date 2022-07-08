const axios = require('axios');
const _ = require('lodash');
const serializeGame = require('../serializers/game');

/**
 * Fetch top n games for a specifc platform.
 * Remote files are already sorted by rank
 * 
 * @param {string} platform 'ios' | 'android'
 */
async function fetchTopNGamesForPlatform(platform, n = 100) {
  if(platform !== 'ios' && platform !== 'android') {
    throw new Error('Unexpected platform value. Expecting "ios" or "android"');
  }

  console.log(`[GameService] Fetching top ${n} games for ${platform}`);

  const baseURL = "https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com";

  return await axios.get(`${baseURL}/${platform}.top100.json`)
      .then(response => {
        return _.flatten(response.data).slice(0, n).map(rawGame => serializeGame(rawGame));
      })
      .catch(err => {
        throw new Error("Unable to fetch remote JSON file", err);
      });
}

module.exports = fetchTopNGamesForPlatform;