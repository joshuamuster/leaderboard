class Leaderboard {
    constructor(containerId, updateInterval = 60000) {
        this.containerId = containerId;
        this.updateInterval = updateInterval;
    }

    createLeaderboardEntry(item, index) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';

// Add the house-specific class
if (['1', '2', '3', '4', '5'].includes(item.house)) {
    entryDiv.classList.add(`leaderHouse-${item.house}`);
}

// Create the house image element
const houseImage = document.createElement('img');
houseImage.className = 'house-image';
houseImage.alt = `House ${item.house}`;

// Set the image source based on the house number
if (['1', '2', '3', '4'].includes(item.house)) {
    houseImage.src = `images/CircleFrame-${item.house}b.png`;
} else {
    houseImage.src = 'images/default-house.png'; // A default image for unknown houses
    houseImage.alt = 'Unknown House';
}

entryDiv.innerHTML = `
    <div class="house"></div>
    <div class="rank">${index + 1}</div>
    <div class="name">${item.name}</div>
    <div class="points">${item.points}</div>
`;

// Insert the house image into the house span
entryDiv.querySelector('.house').appendChild(houseImage);
        return entryDiv;
    }

    displayLeaderboard(students) {
        console.log('Displaying leaderboard for', students.length, 'students');
        const leaderboardElement = document.getElementById(this.containerId);
        leaderboardElement.innerHTML = '';

        if (students.length === 0) {
            leaderboardElement.innerHTML = '<p>No data available</p>';
            return;
        }

        // Sort students by points in descending order
        students.sort((a, b) => b.points - a.points);

        students.forEach((student, index) => {
            const entryDiv = this.createLeaderboardEntry(student, index);
            leaderboardElement.appendChild(entryDiv);
        });
    }

    fetchAndDisplay() {
        console.log('Fetching leaderboard data');
        fetch('/api/leaderboard')
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Leaderboard data:', data);
                this.displayLeaderboard(data);
            })
            .catch(error => {
                console.error('Error fetching leaderboard data:', error);
                const leaderboardElement = document.getElementById(this.containerId);
                leaderboardElement.innerHTML = '<p>Error loading leaderboard data</p>';
            });
    }

    startPeriodicUpdate() {
        this.fetchAndDisplay(); // Initial fetch
        setInterval(() => this.fetchAndDisplay(), this.updateInterval);
    }
}