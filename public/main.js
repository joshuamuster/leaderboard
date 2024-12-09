console.log('main.js loaded');

function createLeaderboardEntry(item, index) {
  const entry = document.createElement('div');
  entry.className = 'leaderboard-entry';

  const rank = document.createElement('span');
  rank.className = 'student-rank';
  rank.textContent = `${index + 1}.`;

  const nameContainer = document.createElement('div');
  nameContainer.className = 'student-name';

  const nameParts = item.name.split(' ');
  const firstName = document.createElement('span');
  firstName.className = 'first-name';
  firstName.textContent = nameParts[0]; // Always treat the first part as the first name

  nameContainer.appendChild(firstName);

  if (nameParts.length > 1) {
    const lastName = document.createElement('span');
    lastName.className = 'last-name';
    lastName.textContent = nameParts.slice(1).join(' '); // Join all remaining parts as the last name
    nameContainer.appendChild(lastName);
  }

  const points = document.createElement('span');
  points.className = 'student-points';
  points.textContent = item.points;

  entry.appendChild(rank);
  entry.appendChild(nameContainer);
  entry.appendChild(points);

  return entry;
}

function displayLeaderboard(students) {
  console.log('Displaying leaderboard for', students.length, 'students');
  const leaderboardElement = document.getElementById('leaderboard');
  leaderboardElement.innerHTML = '';

  if (students.length === 0) {
    leaderboardElement.innerHTML = '<p>No data available</p>';
    return;
  }

  students.forEach((student, index) => {
    const entryDiv = createLeaderboardEntry(student, index);
    leaderboardElement.appendChild(entryDiv);
  });
}

// Fetch the leaderboard data from the server
fetch('/api/leaderboard')
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Leaderboard data:', data);
    displayLeaderboard(data);
  })
  .catch(error => {
    console.error('Error fetching leaderboard data:', error);
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '<p>Error loading leaderboard data</p>';
  });