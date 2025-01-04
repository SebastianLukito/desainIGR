import { db } from '../../../js/fbconfig.js';
import {firebaseApp} from '../../../js/fbconfig.js';

(function () {
// Ambil username dari cookie
const user = getCookie("username");
let currentScore = 0;

// Fungsi untuk memperbarui leaderboard
function updateLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = ""; // Kosongkan leaderboard sebelumnya

    db.collection("gameScores")
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = `${data.username}: ${data.score}`;
        leaderboard.appendChild(li);
        });
    })
    .catch((error) => {
        console.error("Error fetching leaderboard:", error);
    });
}

// Fungsi untuk menyimpan skor ke Firestore
function saveScore(user, score) {
    db.collection("gameScores")
    .add({
        username: user,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
        console.log("Score successfully saved!");
        updateLeaderboard(); // Update leaderboard setelah menyimpan skor
    })
    .catch((error) => {
        console.error("Error saving score:", error);
    });
}

// Pantau perubahan skor di halaman
document.querySelector(".score-container").addEventListener("DOMSubtreeModified", () => {
    const newScore = parseInt(document.querySelector(".score-container").textContent, 10);
    if (newScore > currentScore) {
    currentScore = newScore;
    saveScore(user, currentScore);
    }
});

// Inisialisasi leaderboard saat halaman dimuat
updateLeaderboard();
})();
