// ⚠️ DEINE DATEN VON SUPABASE
const SUPABASE_URL = "https://abzivpkrhespyvubtcer.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieml2cGtyaGVzcHl2dWJ0Y2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjQ0MzIsImV4cCI6MjA5NjAwMDQzMn0.V2_K_GOQIgvhTmHRDl5y0EyF0AbeopYJ-u8ermrgOl8";

let currentUser = localStorage.getItem("wm_user_2026") || "";
let currentPin = localStorage.getItem("wm_pin_2026") || ""; 
let isAdmin = false;
const matches = [];

let serverTips = [];
let serverResults = {};
let serverBonusTips = {};

const ADMIN_PASSWORD = "wm2026admin"; 

// 📅 DER KOMPLETTE SPIELPLAN (ALLE 104 SPIELE)
const gruppenMatches = [
    // Spielrunde 1
    { phase: "Gruppe A", date: "11.06.2026", time: "21:00", h: "Mexiko 🇲🇽", a: "Südafrika 🇿🇦" },
    { phase: "Gruppe A", date: "12.06.2026", time: "04:00", h: "Südkorea 🇰🇷", a: "Tschechien 🇨🇿" },
    { phase: "Gruppe B", date: "12.06.2026", time: "21:00", h: "Kanada 🇨🇦", a: "Bosnien-Herzegowina 🇧🇦" },
    { phase: "Gruppe D", date: "13.06.2026", time: "03:00", h: "USA 🇺🇸", a: "Paraguay 🇵🇾" },
    { phase: "Gruppe B", date: "13.06.2026", time: "21:00", h: "Katar 🇶🇦", a: "Schweiz 🇨🇭" },
    { phase: "Gruppe C", date: "14.06.2026", time: "00:00", h: "Brasilien 🇧🇷", a: "Marokko 🇲🇦" },
    { phase: "Gruppe C", date: "14.06.2026", time: "03:00", h: "Haiti 🇭🇹", a: "Schottland 🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    { phase: "Gruppe D", date: "14.06.2026", time: "06:00", h: "Australien 🇦🇺", a: "Türkei 🇹🇷" },
    { phase: "Gruppe E", date: "14.06.2026", time: "19:00", h: "Deutschland 🇩🇪", a: "Curaçao 🇨🇼" },
    { phase: "Gruppe F", date: "14.06.2026", time: "22:00", h: "Niederlande 🇳🇱", a: "Japan 🇯🇵" },
    { phase: "Gruppe E", date: "15.06.2026", time: "01:00", h: "Elfenbeinküste 🇨🇮", a: "Ecuador 🇪🇨" },
    { phase: "Gruppe F", date: "15.06.2026", time: "04:00", h: "Schweden 🇸🇪", a: "Tunesien 🇹🇳" },
    { phase: "Gruppe H", date: "15.06.2026", time: "18:00", h: "Spanien 🇪🇸", a: "Kap Verde 🇨🇻" },
    { phase: "Gruppe G", date: "15.06.2026", time: "21:00", h: "Belgien 🇧🇪", a: "Ägypten 🇪🇬" },
    { phase: "Gruppe H", date: "16.06.2026", time: "00:00", h: "Saudi-Arabien 🇸🇦", a: "Uruguay 🇺🇾" },
    { phase: "Gruppe G", date: "16.06.2026", time: "03:00", h: "Iran 🇮🇷", a: "Neuseeland 🇳🇿" },
    { phase: "Gruppe I", date: "16.06.2026", time: "21:00", h: "Frankreich 🇫🇷", a: "Senegal 🇸🇳" },
    { phase: "Gruppe I", date: "17.06.2026", time: "00:00", h: "Irak 🇮🇶", a: "Norwegen 🇳🇴" },
    { phase: "Gruppe J", date: "17.06.2026", time: "03:00", h: "Argentinien 🇦🇷", a: "Algerien 🇩🇿" },
    { phase: "Gruppe J", date: "17.06.2026", time: "06:00", h: "Österreich 🇦🇹", a: "Jordanien 🇯🇴" },
    { phase: "Gruppe K", date: "17.06.2026", time: "19:00", h: "Portugal 🇵🇹", a: "DR Kongo 🇨🇩" },
    { phase: "Gruppe L", date: "17.06.2026", time: "22:00", h: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", a: "Kroatien 🇭🇷" },
    { phase: "Gruppe L", date: "18.06.2026", time: "01:00", h: "Ghana 🇬🇭", a: "Panama 🇵🇦" },
    { phase: "Gruppe K", date: "18.06.2026", time: "04:00", h: "Usbekistan 🇺🇿", a: "Kolumbien 🇨🇴" },

    // Spielrunde 2
    { phase: "Gruppe A", date: "18.06.2026", time: "18:00", h: "Tschechien 🇨🇿", a: "Südafrika 🇿🇦" },
    { phase: "Gruppe B", date: "18.06.2026", time: "21:00", h: "Schweiz 🇨🇭", a: "Bosnien-Herzegowina 🇧🇦" },
    { phase: "Gruppe B", date: "19.06.2026", time: "00:00", h: "Kanada 🇨🇦", a: "Katar 🇶🇦" },
    { phase: "Gruppe A", date: "19.06.2026", time: "03:00", h: "Mexiko 🇲🇽", a: "Südkorea 🇰🇷" },
    { phase: "Gruppe D", date: "19.06.2026", time: "21:00", h: "USA 🇺🇸", a: "Australien 🇦🇺" },
    { phase: "Gruppe C", date: "20.06.2026", time: "00:00", h: "Schottland 🏴󠁧󠁢󠁳󠁣󠁴󠁿", a: "Marokko 🇲🇦" },
    { phase: "Gruppe C", date: "20.06.2026", time: "03:00", h: "Brasilien 🇧🇷", a: "Haiti 🇭🇹" },
    { phase: "Gruppe D", date: "20.06.2026", time: "06:00", h: "Türkei 🇹🇷", a: "Paraguay 🇵🇾" },
    { phase: "Gruppe F", date: "20.06.2026", time: "19:00", h: "Niederlande 🇳🇱", a: "Japan 🇯🇵" },
    { phase: "Gruppe E", date: "20.06.2026", time: "22:00", h: "Deutschland 🇩🇪", a: "Elfenbeinküste 🇨🇮" },
    { phase: "Gruppe E", date: "21.06.2026", time: "02:00", h: "Ecuador 🇪🇨", a: "Curaçao 🇨🇼" },
    { phase: "Gruppe F", date: "21.06.2026", time: "06:00", h: "Tunesien 🇹🇳", a: "Schweden 🇸🇪" },
    { phase: "Gruppe H", date: "21.06.2026", time: "18:00", h: "Spanien 🇪🇸", a: "Kap Verde 🇨🇻" },
    { phase: "Gruppe G", date: "21.06.2026", time: "21:00", h: "Belgien 🇧🇪", a: "Ägypten 🇪🇬" },
    { phase: "Gruppe H", date: "22.06.2026", time: "00:00", h: "Uruguay 🇺🇾", a: "Saudi-Arabien 🇸🇦" },
    { phase: "Gruppe G", date: "22.06.2026", time: "03:00", h: "Iran 🇮🇷", a: "Neuseeland 🇳🇿" },
    { phase: "Gruppe J", date: "22.06.2026", time: "19:00", h: "Argentinien 🇦🇷", a: "Österreich 🇦🇹" },
    { phase: "Gruppe I", date: "22.06.2026", time: "23:00", h: "Frankreich 🇫🇷", a: "Irak 🇮🇶" },
    { phase: "Gruppe I", date: "23.06.2026", time: "02:00", h: "Norwegen 🇳🇴", a: "Senegal 🇸🇳" },
    { phase: "Gruppe J", date: "23.06.2026", time: "06:00", h: "Jordanien 🇯🇴", a: "Algerien 🇩🇿" },
    { phase: "Gruppe K", date: "23.06.2026", time: "19:00", h: "Portugal 🇵🇹", a: "Usbekistan 🇺🇿" },
    { phase: "Gruppe L", date: "23.06.2026", time: "22:00", h: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", a: "Ghana 🇬🇭" },
    { phase: "Gruppe L", date: "24.06.2026", time: "01:00", h: "Panama 🇵🇦", a: "Kroatien 🇭🇷" },
    { phase: "Gruppe K", date: "24.06.2026", time: "04:00", h: "Kolumbien 🇨🇴", a: "DR Kongo 🇨🇩" },

    // Spielrunde 3
    { phase: "Gruppe A", date: "24.06.2026", time: "21:00", h: "Südafrika 🇿🇦", a: "Südkorea 🇰🇷" },
    { phase: "Gruppe A", date: "24.06.2026", time: "21:00", h: "Tschechien 🇨🇿", a: "Mexiko 🇲🇽" },
    { phase: "Gruppe B", date: "25.06.2026", time: "00:00", h: "Bosnien-Herzegowina 🇧🇦", a: "Katar 🇶🇦" },
    { phase: "Gruppe B", date: "25.06.2026", time: "00:00", h: "Schweiz 🇨🇭", a: "Kanada 🇨🇦" },
    { phase: "Gruppe C", date: "25.06.2026", time: "21:00", h: "Marokko 🇲🇦", a: "Haiti 🇭🇹" },
    { phase: "Gruppe C", date: "25.06.2026", time: "21:00", h: "Schottland 🏴󠁧󠁢󠁳󠁣󠁴󠁿", a: "Brasilien 🇧🇷" },
    { phase: "Gruppe D", date: "26.06.2026", time: "00:00", h: "Paraguay 🇵🇾", a: "Australien 🇦🇺" },
    { phase: "Gruppe D", date: "26.06.2026", time: "00:00", h: "Türkei 🇹🇷", a: "USA 🇺🇸" },
    { phase: "Gruppe E", date: "26.06.2026", time: "21:00", h: "Curaçao 🇨🇼", a: "Elfenbeinküste 🇨🇮" },
    { phase: "Gruppe E", date: "26.06.2026", time: "21:00", h: "Ecuador 🇪🇨", a: "Deutschland 🇩🇪" },
    { phase: "Gruppe F", date: "27.06.2026", time: "00:00", h: "Japan 🇯🇵", a: "Tunesien 🇹🇳" },
    { phase: "Gruppe F", date: "27.06.2026", time: "00:00", h: "Schweden 🇸🇪", a: "Niederlande 🇳🇱" },
    { phase: "Gruppe G", date: "27.06.2026", time: "21:00", h: "Ägypten 🇪🇬", a: "Iran 🇮🇷" },
    { phase: "Gruppe G", date: "27.06.2026", time: "21:00", h: "Neuseeland 🇳🇿", a: "Belgien 🇧🇪" },
    { phase: "Gruppe H", date: "28.06.2026", time: "00:00", h: "Kap Verde 🇨🇻", a: "Saudi-Arabien 🇸🇦" },
    { phase: "Gruppe H", date: "28.06.2026", time: "00:00", h: "Uruguay 🇺🇾", a: "Spanien 🇪🇸" },
    { phase: "Gruppe I", date: "28.06.2026", time: "21:00", h: "Senegal 🇸🇳", a: "Irak 🇮🇶" },
    { phase: "Gruppe I", date: "28.06.2026", time: "21:00", h: "Norwegen 🇳🇴", a: "Frankreich 🇫🇷" },
    { phase: "Gruppe J", date: "29.06.2026", time: "00:00", h: "Algerien 🇩🇿", a: "Österreich 🇦🇹" },
    { phase: "Gruppe J", date: "29.06.2026", time: "00:00", h: "Jordanien 🇯🇴", a: "Argentinien 🇦🇷" },
    { phase: "Gruppe K", date: "29.06.2026", time: "21:00", h: "DR Kongo 🇨🇩", a: "Usbekistan 🇺🇿" },
    { phase: "Gruppe K", date: "29.06.2026", time: "21:00", h: "Kolumbien 🇨🇴", a: "Portugal 🇵🇹" },
    { phase: "Gruppe L", date: "30.06.2026", time: "00:00", h: "Kroatien 🇭🇷", a: "Ghana 🇬🇭" },
    { phase: "Gruppe L", date: "30.06.2026", time: "00:00", h: "Panama 🇵🇦", a: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },

    // K.o.-Runde der letzten 32
    { phase: "Sechzehntelfinale", date: "03.07.2026", time: "21:00", h: "Sieger Gruppe A", a: "Zweiter Gruppe C" },
    { phase: "Sechzehntelfinale", date: "04.07.2026", time: "01:00", h: "Sieger Gruppe B", a: "Dritter Gruppe A/C/D" },
    { phase: "Sechzehntelfinale", date: "04.07.2026", time: "18:00", h: "Zweiter Gruppe A", a: "Zweiter Gruppe B" },
    { phase: "Sechzehntelfinale", date: "04.07.2026", time: "22:00", h: "Sieger Gruppe C", a: "Zweiter Gruppe D" },
    { phase: "Sechzehntelfinale", date: "05.07.2026", time: "18:00", h: "Sieger Gruppe E", a: "Zweiter Gruppe F" },
    { phase: "Sechzehntelfinale", date: "05.07.2026", time: "22:00", h: "Sieger Gruppe F", a: "Dritter Gruppe C/E/F" },
    { phase: "Sechzehntelfinale", date: "06.07.2026", time: "18:00", h: "Sieger Gruppe G", a: "Zweiter Gruppe H" },
    { phase: "Sechzehntelfinale", date: "06.07.2026", time: "22:00", h: "Sieger Gruppe H", a: "Dritter Gruppe E/G/H" },
    { phase: "Sechzehntelfinale", date: "07.07.2026", time: "18:00", h: "Sieger Gruppe I", a: "Zweiter Gruppe J" },
    { phase: "Sechzehntelfinale", date: "07.07.2026", time: "22:00", h: "Sieger Gruppe J", a: "Dritter Gruppe I/K/L" },
    { phase: "Sechzehntelfinale", date: "08.07.2026", time: "18:00", h: "Sieger Gruppe K", a: "Zweiter Gruppe L" },
    { phase: "Sechzehntelfinale", date: "08.07.2026", time: "22:00", h: "Sieger Gruppe L", a: "Zweiter Gruppe K" },
    { phase: "Sechzehntelfinale", date: "09.07.2026", time: "18:00", h: "Sieger Gruppe D", a: "Dritter Gruppe B/F/G" },
    { phase: "Sechzehntelfinale", date: "09.07.2026", time: "22:00", h: "Zweiter Gruppe I", a: "Zweiter Gruppe E" },
    { phase: "Sechzehntelfinale", date: "10.07.2026", time: "18:00", h: "Zweiter Gruppe G", a: "Zweiter Gruppe J" },
    { phase: "Sechzehntelfinale", date: "10.07.2026", time: "22:00", h: "Zweiter Gruppe B", a: "Zweiter Gruppe F" },

    // Achtelfinale
    { phase: "Achtelfinale", date: "11.07.2026", time: "22:00", h: "Gewinner S1", a: "Gewinner S2" },
    { phase: "Achtelfinale", date: "12.07.2026", time: "02:00", h: "Gewinner S3", a: "Gewinner S4" },
    { phase: "Achtelfinale", date: "12.07.2026", time: "22:00", h: "Gewinner S5", a: "Gewinner S6" },
    { phase: "Achtelfinale", date: "13.07.2026", time: "02:00", h: "Gewinner S7", a: "Gewinner S8" },
    { phase: "Achtelfinale", date: "13.07.2026", time: "22:00", h: "Gewinner S9", a: "Gewinner S10" },
    { phase: "Achtelfinale", date: "14.07.2026", time: "02:00", h: "Gewinner S11", a: "Gewinner S12" },
    { phase: "Achtelfinale", date: "14.07.2026", time: "22:00", h: "Gewinner S13", a: "Gewinner S14" },
    { phase: "Achtelfinale", date: "15.07.2026", time: "02:00", h: "Gewinner S15", a: "Gewinner S16" },

    // Viertelfinale
    { phase: "Viertelfinale", date: "17.07.2026", time: "21:00", h: "Gewinner A1", a: "Gewinner A2" },
    { phase: "Viertelfinale", date: "18.07.2026", time: "02:00", h: "Gewinner A3", a: "Gewinner A4" },
    { phase: "Viertelfinale", date: "18.07.2026", time: "21:00", h: "Gewinner A5", a: "Gewinner A6" },
    { phase: "Viertelfinale", date: "19.07.2026", time: "02:00", h: "Gewinner A7", a: "Gewinner A8" },

    // Halbfinale
    { phase: "Halbfinale", date: "22.07.2026", time: "22:00", h: "Gewinner V1", a: "Gewinner V2" },
    { phase: "Halbfinale", date: "23.07.2026", time: "22:00", h: "Gewinner V3", a: "Gewinner V4" },

    // Platz 3 & Finale
    { phase: "Spiel um Platz 3", date: "25.07.2026", time: "22:00", h: "Verlierer H1", a: "Verlierer H2" },
    { phase: "Finale", date: "26.07.2026", time: "21:00", h: "Gewinner H1", a: "Gewinner H2" }
];

// 🌐 DATEN AUS SUPABASE LADEN (GET)
async function getFromSupabase(table) {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
    };
    try {
        const response = await fetch(url, { method: "GET", headers: headers });
        if (!response.ok) throw new Error(`Fehler bei GET ${table}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

// 🌐 DATEN SPEICHERN ODER AKTUALISIEREN (POST / PATCH)
async function saveToSupabase(table, body, method = "POST", rowId = null) {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    if (method === "PATCH" && rowId) {
        url += `?id=eq.${rowId}`;
    }

    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    };

    try {
        const response = await fetch(url, { method: method, headers: headers, body: JSON.stringify(body) });
        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Fehler bei ${method}: ${txt}`);
        }
        return true;
    } catch (e) {
        console.error(e);
        alert("Fehler beim Speichern: " + e.message);
        return false;
    }
}

// 👤 TIPPER ANMELDEN
async function registerUser() {
    const nameInput = document.getElementById("username").value.trim();
    const pinInput = document.getElementById("userpin").value.trim();

    if(nameInput === "") { alert("Bitte Namen eingeben!"); return; }

    if(nameInput.toLowerCase() === "admin") {
        const enteredPass = prompt("Admin-Passwort eingeben:");
        if (enteredPass === ADMIN_PASSWORD) {
            isAdmin = true;
            currentUser = "Admin⚙️";
            currentPin = "";
            alert("Als Admin autorisiert!");
            updateWelcomeMessage();
            renderMatches();
        } else {
            alert("Falsches Passwort!");
        }
        return;
    }

    if(pinInput.length < 4) { alert("Bitte eine 4-stellige PIN eingeben!"); return; }

    const checkUrl = `${SUPABASE_URL}/rest/v1/wm_bonus_tips?user_name=eq.${encodeURIComponent(nameInput)}`;
    let existingRowId = null;

    try {
        const checkRes = await fetch(checkUrl, {
            method: "GET",
            headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const checkData = await checkRes.json();
        
        if (checkData && checkData.length > 0) {
            if (checkData[0].pin && checkData[0].pin !== pinInput) {
                alert(`Der Name '${nameInput}' ist bereits vergeben. Falsche PIN!`);
                return;
            }
            existingRowId = checkData[0].id; 
        }
    } catch(err) {
        console.error("Fehler bei Login-Prüfung", err);
    }

    const wmTip = document.getElementById("bonus-wm").value.trim() || "Kein Tipp";
    const scorerTip = document.getElementById("bonus-scorer").value.trim() || "Kein Tipp";

    currentUser = nameInput;
    currentPin = pinInput;
    localStorage.setItem("wm_user_2026", currentUser);
    localStorage.setItem("wm_pin_2026", currentPin);
    
    const saveData = { user_name: currentUser, pin: currentPin, wm_tip: wmTip, scorer_tip: scorerTip };

    let success = false;
    if (existingRowId) {
        success = await saveToSupabase("wm_bonus_tips", saveData, "PATCH", existingRowId);
    } else {
        success = await saveToSupabase("wm_bonus_tips", saveData, "POST");
    }

    if(success) {
        alert(`Erfolgreich angemeldet als '${currentUser}'!`);
        await fetchServerData();
        updateWelcomeMessage();
        renderMatches();
    }
}

// ⚽ SPIELTIPP ABGEBEN
async function submitTip(matchId) {
    if (!currentUser || currentUser === "Admin⚙️") {
        alert("Bitte melde dich zuerst als Tipper an!");
        return;
    }

    const homeInput = document.getElementById(`home-tip-${matchId}`).value;
    const awayInput = document.getElementById(`away-tip-${matchId}`).value;

    if (homeInput === "" || awayInput === "") {
        alert("Bitte beide Felder ausfüllen!");
        return;
    }

    const scoreString = `${homeInput}:${awayInput}`;

    const checkUrl = `${SUPABASE_URL}/rest/v1/wm_tips?user_name=eq.${encodeURIComponent(currentUser)}&match_id=eq.${matchId}`;
    let existingTipId = null;

    try {
        const res = await fetch(checkUrl, {
            method: "GET",
            headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            existingTipId = data[0].id;
        }
    } catch (e) {
        console.error(e);
    }

    const matchObj = matches.find(m => m.id === matchId);
    const saveData = {
        user_name: currentUser,
        pin: currentPin,
        match_id: matchId,
        match_teams: matchObj ? `${matchObj.h} - ${matchObj.a}` : "Unbekannt",
        phase: matchObj ? matchObj.phase : "Gruppe",
        score: scoreString
    };

    let success = false;
    if (existingTipId) {
        success = await saveToSupabase("wm_tips", saveData, "PATCH", existingTipId);
    } else {
        success = await saveToSupabase("wm_tips", saveData, "POST");
    }

    if (success) {
        alert("Tipp erfolgreich gespeichert!");
        await fetchServerData();
        renderMatches();
    }
}

// ⚙️ ERGEBNIS ALS ADMIN EINTRAGEN
async function submitResult(matchId) {
    if (!isAdmin) return;

    const homeRes = document.getElementById(`home-res-${matchId}`).value;
    const awayRes = document.getElementById(`away-res-${matchId}`).value;

    if (homeRes === "" || awayRes === "") {
        alert("Bitte beide Felder ausfüllen!");
        return;
    }

    const resultString = `${homeRes}:${awayRes}`;

    const checkUrl = `${SUPABASE_URL}/rest/v1/wm_results?match_id=eq.${matchId}`;
    let existingResultId = null;

    try {
        const res = await fetch(checkUrl, {
            method: "GET",
            headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            existingResultId = data[0].id;
        }
    } catch (e) {
        console.error(e);
    }

    const saveData = { match_id: matchId, result: resultString };

    let success = false;
    if (existingResultId) {
        success = await saveToSupabase("wm_results", saveData, "PATCH", existingResultId);
    } else {
        success = await saveToSupabase("wm_results", saveData, "POST");
    }

    if (success) {
        alert("Ergebnis erfolgreich eingetragen!");
        await fetchServerData();
        renderMatches();
    }
}

// 📊 SERVERDATEN AKTUALISIEREN
async function fetchServerData() {
    serverTips = await getFromSupabase("wm_tips");
    
    const results = await getFromSupabase("wm_results");
    serverResults = {};
    results.forEach(r => { serverResults[r.match_id] = r.result; });

    const bonus = await getFromSupabase("wm_bonus_tips");
    serverBonusTips = {};
    bonus.forEach(b => { serverBonusTips[b.user_name] = { wm: b.wm_tip, scorer: b.scorer_tip }; });
}

// 📑 SPIELPLAN BAUEN
function buildMatches() {
    if (typeof gruppenMatches !== 'undefined' && gruppenMatches.length > 0) {
        matches.length = 0; 
        let idCounter = 1;
        gruppenMatches.forEach(m => {
            matches.push({ id: idCounter++, ...m });
        });
    }
}

// 🖨️ WILLKOMMENSNACHRICHT ANPASSEN
function updateWelcomeMessage() {
    const msgZone = document.getElementById("welcome-message");
    if(msgZone) {
        if(currentUser) {
            msgZone.innerHTML = `Eingeloggt als: <strong>${currentUser}</strong>`;
        } else {
            msgZone.innerHTML = "Bitte melde dich an, um deine Tipps abzugeben.";
        }
    }
}

// 🎨 SPIELE IM HTML ANZEIGEN
function renderMatches() {
    const container = document.getElementById("matches-container");
    if (!container) return;
    
    container.innerHTML = "";

    const filterVal = document.getElementById("filter-phase") ? document.getElementById("filter-phase").value : "all";
    let angezeigteSpiele = 0;

    matches.forEach(m => {
        if (filterVal !== "all" && m.phase !== filterVal) return;
        angezeigteSpiele++;

        const serverResult = serverResults[m.id] || "-:-";
        
        let meinTipp = "";
        if (currentUser) {
            const gefunden = serverTips.find(t => t.user_name === currentUser && t.match_id === m.id);
            if (gefunden) meinTipp = gefunden.score;
        }

        let tplHome = "";
        let tplAway = "";
        if (meinTipp) {
            const parts = meinTipp.split(":");
            tplHome = parts[0];
            tplAway = parts[1];
        }

        const andereTipps = serverTips.filter(t => t.match_id === m.id && t.user_name !== currentUser);
        let andereHTML = "";
        if (andereTipps.length > 0) {
            andereHTML = `<div class="other-tips">💡 Tipps: ` + 
                andereTipps.map(t => `<span>👤 ${t.user_name}: ${t.score}</span>`).join(" ") + 
                `</div>`;
        }

        const card = document.createElement("div");
        card.className = "match-card";
        card.innerHTML = `
            <div class="match-meta">Spiel ${m.id} - 📅 ${m.date} um ${m.time} Uhr (${m.phase})</div>
            <div class="match-main">
                <span class="team-name">${m.h}</span>
                <input type="number" id="home-tip-${m.id}" value="${tplHome}" placeholder="0" min="0">
                <span class="vs">:</span>
                <input type="number" id="away-tip-${m.id}" value="${tplAway}" placeholder="0" min="0">
                <span class="team-name">${m.a}</span>
                <button class="btn-tippen" onclick="submitTip(${m.id})">Tippen</button>
            </div>
            <div class="result-display">Echtes Ergebnis: <strong>${serverResult}</strong></div>
            ${andereHTML}
        `;

        if (isAdmin) {
            const adminDiv = document.createElement("div");
            adminDiv.className = "admin-box";
            adminDiv.innerHTML = `
                ⚙️ Admin: 
                <input type="number" id="home-res-${m.id}" placeholder="0" style="width:40px;"> : 
                <input type="number" id="away-res-${m.id}" placeholder="0" style="width:40px;">
                <button onclick="submitResult(${m.id})">Setzen</button>
            `;
            card.appendChild(adminDiv);
        }

        container.appendChild(card);
    });

    if (angezeigteSpiele === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 20px; color: #888;">
            Für die Auswahl "${filterVal}" sind aktuell keine Spiele eingetragen. <br>
            Stelle den Filter oben auf <strong>"Alle Spiele"</strong>!
        </div>`;
    }
}

// 🚀 START
window.addEventListener("DOMContentLoaded", async () => {
    buildMatches();
    updateWelcomeMessage();
    await fetchServerData();
    renderMatches();

    const registerBtn = document.getElementById("btn-register");
    if(registerBtn) registerBtn.addEventListener("click", registerUser);
    
    const filterSelect = document.getElementById("filter-phase");
    if(filterSelect) filterSelect.addEventListener("change", renderMatches);
});
