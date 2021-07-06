const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs'); 
const path = require('path');
const https = require('https');

async function saveJsonResponse(filepath, json_data) {
    const pathname = path.join(`C:/python/test/fantasy_football/json_response/${filepath}.txt`);
    fs.writeFile(pathname, JSON.stringify(json_data, null, 4), err => { 
        if (err) {
          console.error(err);
          return;
        }
    });
}

const DEBUG = false;

const { MongoClient } = require('mongodb');
const { restart } = require('nodemon');

require('dotenv').config();

const app = express();

const dbUri = process.env.MONGO_DB_URI || 'mongodb://localhost:27017/fantasy_football';
const PORT = process.env.PORT || 5000;

console.log('process.env.PORT', process.env.PORT);

let db;
MongoClient.connect(dbUri, { useUnifiedTopology: true }, function(err, client) {
    if(!err) {
        console.log("mongodb connected");
        db = client.db('fantasy_football');
    }
});

app.use(express.static(path.join(__dirname, '/frontend/ui/build')));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/api/test', (req, res) => {
    const filepath = 'test.txt';
    const json_data = {
        a: 'b',
        c: 'd'
    }
    if (DEBUG)
        saveJsonResponse(filepath, json_data)
    res.send('hello');
});

app.get('/api/current_gw', (req, res) => {
    const curr_datetime = (new Date()).toISOString();
    db.collection('fixture_list').find({datetime: {$lt: curr_datetime}}).sort({datetime: -1}).limit(1).toArray((err, data) => {
        if(data.length === 1) {
            const r = {"curr_gw": data[0].gw};  
            res.json(r);
            if (DEBUG)
                saveJsonResponse('current_gw', r)
            return;            
        }
        res.json({"curr_gw": 0})
    })
});

app.get('/api/players/:num_players_string?', (req, res) => {
    let num_players_string = req.params.num_players_string;
    if (!num_players_string) {
        num_players_string = '9999';
    }
    let num_players = num_players_string.split('=')[1];
    num_players = parseInt(num_players);
    db.collection('players_data').find().sort({total_points: -1}).limit(num_players).toArray((err, players_data) => {
        res.json(players_data);
        if (DEBUG)
            saveJsonResponse('players', players_data);
    });
});


app.get('/api/fixture_difficulty', (req, res) => {
    db.collection('fixture_list_with_difficulty').find().toArray((err, result) => {
        res.json(result);
        if (DEBUG)
            saveJsonResponse('fixture_difficulty', result);
    });
});


app.get('/api/fixture_list', (req, res) => {
    db.collection('fixture_list').find().toArray((err, result) => {
        res.json(result);
        if (DEBUG)
            saveJsonResponse('fixture_list', result);
    });
});


app.get('/api/team_ids', (req, res) => {
    db.collection('team_ids').find().toArray((err, team_ids) => {
        res.json(team_ids);
        if (DEBUG)
            saveJsonResponse('team_ids', team_ids);
    });
});


app.get('/api/teams_stats', async (req, res) => {
    try {
        const cursor = await db.collection('teams_stats').find();
        const stats_array = await cursor.toArray();
        res.json(stats_array);
        if (DEBUG)
            saveJsonResponse('teams_stats', stats_array);
    }
    catch (err) {
        console.log('err', err);
    }
});


app.get('/api/team_fixture_lists/:team_name', async (req, res) => {
    const team_name = req.params.team_name;
    console.log('team_name', team_name);
    try {
        const result = await db.collection('team_fixture_lists').findOne({team_name: team_name});
        res.json(result.fixture_list);
        if (DEBUG)
            saveJsonResponse('team_fixture_lists', result.fixture_list);
    }
    catch (err) {
        console.log('err', err);
    }
});


app.get('/api/squads/:manager_id/:curr_gw?', (req, res) => {
    const manager_id = req.params.manager_id;
    db.collection('manager_data').find({manager_id: manager_id}).toArray((err, data) => {
        res.json(data);
        if (DEBUG)
            saveJsonResponse('managers', data);
    });
});


app.get('/api/managers/:manager_id', (req, res) => {
    const manager_id = req.params.manager_id;
    db.collection('manager_data').find({manager_id: manager_id}).toArray((err, data) => {
        res.json(data);
        if (DEBUG)
            saveJsonResponse('managers', data);
    });
});


app.get('/api/player_season_stats/:web_name_id', (req, res) => {
    const web_name_id = req.params.web_name_id;
    const player_id = web_name_id.split('_').slice(-1)[0];
    db.collection('player_season_stats').findOne({player_id: Number(player_id)})
        .then(data => {
            res.json(data);
            if (DEBUG)
                saveJsonResponse('player_season_stats', data);
        })
        .catch(err => console.log(err));
});


app.get('/api/player_gw_stats/:web_name_id', (req, res) => {
    const web_name_id = req.params.web_name_id;
    const player_id = web_name_id.split('_').slice(-1)[0];
    db.collection('player_gw_stats').findOne({player_id: Number(player_id)})
        .then(data => {
            res.json(data);
            if (DEBUG)
                saveJsonResponse('player_gw_stats', data);
        })
        .catch(err => console.log(err));
});


app.get('/api/leagues/:league_id', (req, res) => {
    const league_id = req.params.league_id;
    db.collection('leagues').findOne({league_id: league_id})
        .then(data => {
            res.json(data);
            if (DEBUG)
                saveJsonResponse('leagues', data);
        })
        .catch(err => console.log(err));
});


app.get('/api/squads_for_league_id/:league_id/:curr_gw', (req, res) => {
    const league_id = req.params.league_id;
    const curr_gw = Number(req.params.curr_gw);
    db.collection('squads_for_league_id').findOne({league_id: league_id, curr_gw: curr_gw})
        .then(result => {
            res.json(result['data']);
            if (DEBUG)
                saveJsonResponse('squads_for_league_id', result['data']);
        })
        .catch(err => console.log(err));    
});

  
app.get('/api/live_data/:gw', (req, res) => {

    function make_https_request(url, res, callback) {
        https.get(url, (res2) => {
            let body = [];
            res2.on('data', (chunk) => {
                body.push(chunk)
            }).on('end', () => {
                body = Buffer.concat(body).toString();
                callback(body);
            });
        }).on('error', (e) => {
            console.error(e);
        });
    }
    const gw = req.params.gw;
    const url = `https://fantasy.premierleague.com/api/event/${gw}/live/`;
    const callback = body => {
        res.json(JSON.parse(body));
        if (DEBUG)
            saveJsonResponse('live_data', JSON.parse(body));
    }
    make_https_request(url, res, callback);
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/ui/build/index.html'));
});

app.listen(PORT, () => console.log(`serving from  ${process.env.API_BASE_URL}:${PORT}`));
