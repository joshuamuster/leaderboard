console.log('DOM fully loaded and parsed');

document.addEventListener('DOMContentLoaded', () => {
    const leaderboard = new Leaderboard('leaderboard-container');
    leaderboard.fetchAndDisplay();
});