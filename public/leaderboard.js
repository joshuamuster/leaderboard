class Leaderboard {
    constructor(containerId) {
        this.containerId = containerId;
    }

    createLeaderboardEntry(item, index) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        entryDiv.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="name">${item.name}</span>
            <span class="points">${item.points}</span>
        `;
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
}