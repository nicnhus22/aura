const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const db = require('./models');
const fetchTopNGamesForPlatform = require('./services/game')

const Op = Sequelize.Op;

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));


app.get('/api/games', async (req, res) => {
  try {
    const games = await db.Game.findAll()
    return res.send(games)
  } catch (err) {
    console.error('There was an error querying games', err);
    return res.send(err);
  }
})

app.post('/api/games', async (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  try {
    const game = await db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    return res.send(game)
  } catch (err) {
    console.error('***There was an error creating a game', err);
    return res.status(400).send(err);
  }
})

app.delete('/api/games/:id', async (req, res) => {
  try {
    const game = await db.Game.findByPk(parseInt(req.params.id))
    await game.destroy({ force: true })
    return res.send({ id: game.id  })
  } catch (err) {
    console.error('***Error deleting game', err);
    return res.status(400).send(err);
  }
});

app.put('/api/games/:id', async (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  try {
    const game = await db.Game.findByPk(id)
    await game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    return res.send(game)
  } catch (err) {
    console.error('***Error updating game', err);
    return res.status(400).send(err);
  }
});

app.post('/api/games/search', async (req, res) => {
  const { name, platform } = req.body;

  let where = {
    name: {
        [Op.like]:  `%${name}%`
    },
  };

  if(!_.isNil(platform) && !_.isEmpty(platform)) {
    where.platform = platform
  }

  try {
    const game = await db.Game.findAll({
      where: where
    })
    return res.send(game)
  } catch (err) {
    console.error('***There was an error searching for games', err);
    return res.status(400).send(err);
  }
});

app.post('/api/games/populate', async (req, res) => {
  try {
    const platforms = ["android", "ios"]

    for(const platform of platforms) {
      console.log(`Populating games from source ${platform}`);

      const games = await fetchTopNGamesForPlatform(platform);

      await db.Game.bulkCreate(games);

      console.log(`Populated ${games.length} games for platform ${platform}`)
    }

    return res.send()
  } catch (err) {
    console.error('***There was an error searching for games', err);
    return res.status(400).send(err);
  }
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
