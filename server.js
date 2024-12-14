const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const app = express();
const port = 3000;

const url = 'https://5starstudents.com/COMPUTECHMIDDLESCHOOL';
const csvFile = 'students.csv';

const cacheExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds

let idToStudentMap = {};
let leaderboardCache = null;
const updateInterval = 5 * 60 * 1000; // 5 minutes

let lastModified = 0;

function loadStudentData() {
  try {
    const stats = fs.statSync(csvFile);
    const currentModified = stats.mtimeMs;

    if (currentModified > lastModified) {
      const fileContent = fs.readFileSync(csvFile, 'utf8');
      const students = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      idToStudentMap = {};
      students.forEach(student => {
        const firstName = student['First Name'] || '';
        const lastName = student['Last Name'] || '';
        const house = student['House'] || 'N/A';
        idToStudentMap[student['Student ID']] = {
          name: `${firstName} ${lastName}`.trim(),
          house: house
        };
      });

      lastModified = currentModified;
      console.log('Student data reloaded');
    } else {
      console.log('CSV file not modified, skipping reload');
    }
  } catch (error) {
    console.error('Error loading student data:', error);
  }
}

async function fetchLeaderboard() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const leaderboard = [];

    $('#topLeaderboardDiv table tbody tr').each((index, element) => {
      const id = $(element).find('td:nth-child(1)').text().trim();
      const points = $(element).find('td:nth-child(2)').text().trim();

      if (id && points) {
        const studentInfo = idToStudentMap[id] || { name: 'Unknown Student', house: 'N/A' };
        leaderboard.push({ 
          name: studentInfo.name, 
          house: studentInfo.house, 
          points 
        });
      }
    });

    leaderboardCache = {
      data: leaderboard,
      timestamp: new Date().getTime()
    };
    console.log('Leaderboard fetched and cached');
  } catch (error) {
    console.error('Error fetching the leaderboard:', error);
  }
}

// Initial load and fetch
loadStudentData();
fetchLeaderboard();

// Set up periodic checking for CSV file changes and leaderboard updates
setInterval(loadStudentData, updateInterval);
setInterval(fetchLeaderboard, updateInterval);

app.get('/api/leaderboard', async (req, res) => {
  if (!leaderboardCache || (new Date().getTime() - leaderboardCache.timestamp > cacheExpirationTime)) {
    await fetchLeaderboard();
  }
  
  if (leaderboardCache && leaderboardCache.data) {
    console.log('Sending leaderboard data:', leaderboardCache.data);
    res.json(leaderboardCache.data);
  } else {
    console.log('Unable to fetch leaderboard data');
    res.status(500).json({ error: 'Unable to fetch leaderboard data' });
  }
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});