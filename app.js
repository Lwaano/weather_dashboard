const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public directory

const db = new sqlite3.Database('./db/history.db');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY, city TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS weather (id INTEGER PRIMARY KEY, city TEXT, temperature REAL, condition TEXT, wind_speed REAL, humidity INTEGER, pressure REAL)');
});

// Endpoint to save favorite cities
app.post('/api/favorites', (req, res) => {
    const { city } = req.body;
    db.run('INSERT INTO favorites (city) VALUES (?)', [city], (err) => {
        if (err) {
            res.status(500).send('Error saving favorite city');
        } else {
            res.status(200).send('Favorite city saved');
        }
    });
});

// Endpoint to get favorite cities
app.get('/api/favorites', (req, res) => {
    db.all('SELECT * FROM favorites', [], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving favorite cities');
        } else {
            res.status(200).json(rows);
        }
    });
});

// Endpoint to save weather history (should be in app.js)
app.post('/saveWeatherData', (req, res) => {
    const { city, temperature, condition, wind_speed, humidity, pressure } = req.body;
    db.run('INSERT INTO weather (city, temperature, condition, wind_speed, humidity, pressure) VALUES (?, ?, ?, ?, ?, ?)', 
        [city, temperature, condition, wind_speed, humidity, pressure], (err) => {
        if (err) {
            res.status(500).json({ error: 'Error saving weather data' });
            //console.error('Error saving weather data:', err);
           //res.status(500).send('Error saving weather data'); // Return a 500 error
        } else {
            res.status(200).json({ message: 'Weather history saved' });
            //res.status(200).send('Weather history saved');
            //res.send('Weather data saved successfully!');
        }
    });
});

// Endpoint to get weather history
app.get('/api/history', (req, res) => {
    db.all('SELECT * FROM weather', [], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving weather history');
        } else {
            res.status(200).json(rows);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
