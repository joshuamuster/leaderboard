console.log('main.js loaded');

function createLeaderboardEntry(item, index) {
  const entryDiv = document.createElement('div');
  entryDiv.className = 'leaderboard-entry';

  const rankSpan = document.createElement('span');
  rankSpan.className = 'student-rank';
  rankSpan.textContent = `${index + 1}.`;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'student-name';
  
  // Split the full name into an array of words
  const nameParts = item.name.split(' ');
  
  // Assume the last word is the last name, and everything else is the first name
  const lastName = nameParts.pop();
  const firstName = nameParts.join(' ');
  
  nameSpan.innerHTML = `
    <span class="first-name">${firstName}</span> 
    <span class="last-name">${lastName}</span>
  `;

  const pointsSpan = document.createElement('span');
  pointsSpan.className = 'student-points';
  pointsSpan.textContent = `${item.points} points`;

  entryDiv.appendChild(rankSpan);
  entryDiv.appendChild(nameSpan);
  entryDiv.appendChild(pointsSpan);

  return entryDiv;
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