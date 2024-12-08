const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://5starstudents.com/COMPUTECHMIDDLESCHOOL';

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const leaderboard = [];

    // Select the table rows within the div with id="topLeaderboardDiv"
    $('#topLeaderboardDiv table tbody tr').each((index, element) => {
      const id = $(element).find('td:nth-child(1)').text().trim();
      const points = $(element).find('td:nth-child(2)').text().trim();
      
      // Ensure the row is not empty
      if (id && points) {
        leaderboard.push({ id, points });
      }
    });

    console.log(leaderboard);
  })
  .catch(error => {
    console.error('Error fetching the leaderboard:', error);
  });