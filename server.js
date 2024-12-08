const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');
const app = express();
const port = 3000;

const url = 'https://5starstudents.com/COMPUTECHMIDDLESCHOOL';
const excelFile = 'students.xlsx';

const cacheExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds

let idToNameMap = {};
let leaderboardCache = null;
const updateInterval = 5 * 60 * 1000; // 5 minutes

let lastModified = 0;

function loadStudentData() {
  try {
    const stats = fs.statSync(excelFile);
    const currentModified = stats.mtimeMs;

    if (currentModified > lastModified) {
      const workbook = xlsx.readFile(excelFile);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const students = xlsx.utils.sheet_to_json(sheet);

      idToNameMap = {};
      students.forEach(student => {
        const firstName = student['First Name'] || '';
        const lastName = student['Last Name'] || '';
        idToNameMap[student['Student ID']] = `${firstName} ${lastName}`.trim();
      });

      lastModified = currentModified;
      console.log('Student data reloaded');
    } else {
      console.log('Excel file not modified, skipping reload');
    }
  } catch (error) {
    console.error('Error loading student data:', error);
  }
}

// Initial load
loadStudentData();

// Set up periodic checking for Excel file changes
setInterval(loadStudentData, updateInterval);

// ... rest of your server.js code ...

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
        const name = idToNameMap[id] || 'Unknown Student';
        leaderboard.push({ name, points });
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

// Initial fetch
fetchLeaderboard();

// Set up periodic fetching
setInterval(fetchLeaderboard, updateInterval);

// Make sure this route is present and working correctly
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