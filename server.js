const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Erlaubt deinem Frontend (egal wo es liegt), mit dem Server zu reden
app.use(cors());
app.use(express.json());

// Hier speichert der Server die Daten zentral im Arbeitsspeicher
let wm_tips = [];
let wm_results = {};
let wm_bonus_tips = {};

// --- API ENDPUNKTE ---

// 1. Alle Daten auf einmal abrufen (beim Laden der Seite)
app.get('/api/data', (req, res) => {
    res.json({
        tips: wm_tips,
        results: wm_results,
        bonus: wm_bonus_tips
    });
});

// 2. Tipp abgeben / aktualisieren
app.post('/api/tips', (req, res) => {
    const newTip = req.body;
    if (!newTip.user || !newTip.matchId) {
        return res.status(400).json({ error: "Ungültige Daten" });
    }
    // Alten Tipp des Users für dieses Spiel löschen, falls vorhanden
    wm_tips = wm_tips.filter(t => !(t.user === newTip.user && t.matchId === newTip.matchId));
    wm_tips.push(newTip);
    res.json({ success: true, tips: wm_tips });
});

// 3. Bonus-Tipps (Weltmeister & Torjäger) speichern
app.post('/api/bonus', (req, res) => {
    const { user, wm, scorer } = req.body;
    if (!user) return res.status(400).json({ error: "User fehlt" });
    
    wm_bonus_tips[user] = { wm: wm || "Kein Tipp", scorer: scorer || "Kein Tipp" };
    res.json({ success: true, bonus: wm_bonus_tips });
});

// 4. Offizielles Spielergebnis setzen (Admin)
app.post('/api/results', (req, res) => {
    const { matchId, home, away } = req.body;
    if (!matchId) return res.status(400).json({ error: "MatchId fehlt" });
    
    wm_results[matchId] = { home, away };
    res.json({ success: true, results: wm_results });
});

// Server starten
app.listen(PORT, () => {
    console.log(`WM-Server läuft auf Port ${PORT}`);
});
