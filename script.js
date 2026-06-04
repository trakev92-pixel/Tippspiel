// ⚠️ DEINE DATEN VON SUPABASE (AUTOMATISCH EINGETRAGEN)
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

const gruppenDaten = {
    "Gruppe A": ["Mexiko 🇲🇽", "Südafrika 🇿🇦", "Südkorea 🇰🇷", "Tschechien 🇨🇿"],
    "Gruppe B": ["Kanada 🇨🇦", "Bosnien-Herzegowina 🇧🇦", "Katar 🇶🇦", "Schweiz 🇨🇭"],
    "Gruppe C": ["Brasilien 🇧🇷", "Marokko 🇲🇦", "Haiti 🇭🇹", "Schottland 🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
    "Gruppe D": ["USA 🇺🇸", "Paraguay 🇵🇾", "Australien 🇦🇺", "Türkei 🇹🇷"],
    "Gruppe E": ["Deutschland 🇩🇪", "Curaçao 🇨🇼", "Elfenbeinküste 🇨🇮", "Ecuador 🇪🇨"],
    "Gruppe F": ["Niederlande 🇳🇱", "Japan 🇯🇵", "Schweden 🇸🇪", "Tunesien 🇹🇳"],
    "Gruppe G": ["Belgien 🇧🇪", "Ägypten 🇪🇬", "Iran 🇮🇷", "Neuseeland 🇳🇿"],
    "Gruppe H": ["Spanien 🇪🇸", "Kap Verde 🇨🇻", "Saudi-Arabien 🇸🇦", "Uruguay 🇺🇾"],
    "Gruppe I": ["Frankreich 🇫🇷", "Senegal 🇸🇳", "Irak 🇮🇶", "Norwegen 🇳🇴"],
    "Gruppe J": ["Argentinien 🇦🇷", "Algerien 🇩🇿", "Österreich 🇦🇹", "Jordanien 🇯🇴"],
    "Gruppe K": ["Portugal 🇵🇹", "DR Kongo 🇨🇩", "Usbekistan 🇺🇿", "Kolumbien 🇨🇴"],
    "Gruppe L": ["England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Kroatien 🇭🇷", "Ghana 🇬🇭", "Panama 🇵🇦"]
};

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

// 🌐 DATEN IN SUPABASE SPEICHERN ODER AKTUALISIEREN (POST / PATCH)
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
        alert("Fehler beim Speichern in der Cloud: " + e.message);
        return false;
    }
}

// 👤 TIPPER ANMELDEN / REGISTRIEREN
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
            alert("Als Admin autorisiert! Du kannst Ergebnisse setzen.");
            updateWelcomeMessage();
            renderMatches();
        } else {
            alert("Falsches Admin-Passwort!");
        }
        return;
    }

    if(pinInput.length < 4) { alert("Bitte eine 4-stellige PIN ausdenken/eingeben!"); return; }

    // Prüfen, ob der User in wm_bonus_tips existiert
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
    
    const saveData = {
        user_name: currentUser, pin: currentPin, wm_tip: wmTip, scorer_tip: scorerTip
    };

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

// ⚽ NORMALEN SPIELTIPP ABGEBEN
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

    // Prüfen, ob für diesen User + dieses Match schon ein Tipp in wm_tips existiert
    const checkUrl = `${SUPABASE_URL}/rest/v1/wm_tips?user_name=eq.${encodeURIComponent(currentUser)}&match_id=eq.${matchId}`;
    let existingTipId = null;

    try {
        const res = await fetch(checkUrl, {
            method: "GET",
            headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            existingTipId = data[0].id; // Gefunden -> wir patchen es gleich
        }
    } catch (e) {
        console.error("Fehler bei Tipp-Duplikat-Prüfung", e);
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
        // Bestehenden Tipp aktualisieren
        success = await saveToSupabase("wm_tips", saveData, "PATCH", existingTipId);
    } else {
        // Neuen Tipp anlegen
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

    // Prüfen, ob das Match bereits in wm_results existiert
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

    const saveData = {
        match_id: matchId,
        result: resultString
    };

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
    results.forEach(r => {
        serverResults[r.match_id] = r.result;
    });

    const bonus = await getFromSupabase("wm_bonus_tips");
    serverBonusTips = {};
    bonus.forEach(b => {
        serverBonusTips[b.user_name] = { wm: b.wm_tip, scorer: b.scorer_tip };
    });
}

// 📑 SPIELPLAN GENERIEREN
function generate104Matches() {
    const gruppenMatches = [
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "11.06.2026", time: "21:00", h: "Mexiko 🇲🇽", a: "Südafrika 🇿🇦" },
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "12.06.2026", time: "04:00", h: "Südkorea 🇰🇷", a: "Tschechien 🇨🇿" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "12.06.2026", time: "21:00", h: "Kanada 🇨🇦", a: "Bosnien-Herzegowina 🇧🇦" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "13.06.2026", time: "03:00", h: "USA 🇺🇸", a: "Paraguay 🇵🇾" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "13.06.2026", time: "21:00", h: "Katar 🇶🇦", a: "Schweiz 🇨🇭" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "14.06.2026", time: "00:00", h: "Brasilien 🇧🇷", a: "Marokko 🇲🇦" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "14.06.2026", time: "03:00", h: "Haiti 🇭🇹", a: "Schottland 🏴\u200D󠁢󠁳󠁣󠁴󠁿" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "14.06.2026", time: "06:00", h: "Australien 🇦🇺", a: "Türkei 🇹🇷" }
    ];

    let idCounter = 1;
    gruppenMatches.forEach(m => {
        matches.push({ id: idCounter++, ...m });
    });
}

// 🖨️ WILLKOMMENSNACHRICHT ANPASSEN
function updateWelcomeMessage() {
    const msgZone = document.getElementById("welcome-message");
    if(currentUser) {
        msgZone.innerHTML = `Eingeloggt als: <strong>${currentUser}</strong>`;
    } else {
        msgZone.innerHTML = "Bitte melde dich an, um deine Tipps abzugeben.";
    }
}

// 🎨 SPIELE IM HTML ANZEIGEN
function renderMatches() {
    const container = document.getElementById("matches-container");
    container.innerHTML = "";

    const filterVal = document.getElementById("filter-phase").value;

    matches.forEach(m => {
        if (filterVal !== "all" && m.phase !== filterVal) return;

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

        // Andere Tipps sammeln
        const andereTipps = serverTips.filter(t => t.match_id === m.id && t.user_name !== currentUser);
        let andereHTML = "";
        if (andereTipps.length > 0) {
            andereHTML = `<div class="other-tips">💡 Tipps der anderen: ` + 
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
}

// 🚀 START BEIM LADEN DER SEITE
window.addEventListener("DOMContentLoaded", async () => {
    generate104Matches();
    updateWelcomeMessage();
    
    await fetchServerData();
    renderMatches();

    document.getElementById("btn-register").addEventListener("click", registerUser);
    document.getElementById("filter-phase").addEventListener("change", renderMatches);
});
