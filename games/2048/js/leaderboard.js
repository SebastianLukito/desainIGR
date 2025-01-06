// leaderboard.js
document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();
    const scoresList = document.getElementById('scoresList'); // Mengganti ini

    function updateLeaderboard() {
    db.collection("gameScores")
        .orderBy("score", "desc")
        .limit(10)
        .get()
        .then(function(querySnapshot) {
        scoresList.innerHTML = ''; // Clear previous entries in tbody only
        querySnapshot.forEach(function(doc) {
            const data = doc.data();
            const row = scoresList.insertRow(); // Menggunakan insertRow untuk membuat baris baru
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            cell1.textContent = data.username;
            cell2.textContent = data.score;
        });
        })
        .catch(function(error) {
        console.error("Error fetching scores: ", error);
        });
    }

    // Call the update function periodically if you want to auto-refresh the scores
    updateLeaderboard();
    setInterval(updateLeaderboard, 30000); // Refresh every 30 seconds
});
