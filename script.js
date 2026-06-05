// ⚠️ HIER DEINE DATEN VON SUPABASE EINTRAGEN!
const SUPABASE_URL = "https://abzivpkrhespyvubtcer.supabase.co"; 
const SUPABASE_KEY = "HIER_DEINEN_ANON_PUBLIC_KEY_EINFUEGEN";

let currentUser = localStorage.getItem("wm_user_2026") || "";
let currentPin = localStorage.getItem("wm_pin_2026") || ""; // Merkt sich die PIN
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

// Initialisierung der App, wenn die Webseite geladen wird
document.addEventListener("DOMContentLoaded", async () => {
    generate104Matches();
    buildKachelnAndTabs();
    await fetchServerData();
    updateWelcomeMessage();
    switchTab("tippen"); // Standardmäßig das Tippen-Tab öffnen
});

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
    
    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    };

    // Nutzt das native PostgreSQL-Upsert über Header, falls wir POSTen (verhindert Duplicate Key Errors)
    if (method === "POST") {
        headers["Prefer"] = "resolution=merge-duplicates,return=minimal";
    }

    if (method === "PATCH") {
        url += `?user_name=eq.${encodeURIComponent(body.user_name)}&pin=eq.${encodeURIComponent(body.pin)}`;
    }

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

// 📅 GENERIERUNG ALLER 104 SPIELE
function generate104Matches() {
    const gruppenMatches = [
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "11.06.2026", time: "21:00", h: "Mexiko 🇲🇽", a: "Südafrika 🇿🇦" },
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "12.06.2026", time: "04:00", h: "Südkorea 🇰🇷", a: "Tschechien 🇨🇿" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "12.06.2026", time: "21:00", h: "Kanada 🇨🇦", a: "Bosnien-Herzegowina 🇧🇦" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "13.06.2026", time: "03:00", h: "USA 🇺🇸", a: "Paraguay 🇵🇾" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "13.06.2026", time: "21:00", h: "Katar 🇶🇦", a: "Schweiz 🇨🇭" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "14.06.2026", time: "00:00", h: "Brasilien 🇧🇷", a: "Marokko 🇲🇦" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "14.06.2026", time: "03:00", h: "Haiti 🇭🇹", a: "Schottland 🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "14.06.2026", time: "06:00", h: "Australien 🇦🇺", a: "Türkei 🇹🇷" },
        { phase: "Gruppe E", cat: "Gruppe E-H", date: "14.06.2026", time: "19:00", h: "Deutschland 🇩🇪", a: "Curaçao 🇨🇼" },
        { phase: "Gruppe F", cat: "Gruppe E-H", date: "14.06.2026", time: "22:00", h: "Niederlande 🇳🇱", a: "Japan 🇯🇵" },
        { phase: "Gruppe E", cat: "Gruppe E-H", date: "15.06.2026", time: "01:00", h: "Elfenbeinküste 🇨🇮", a: "Ecuador 🇪🇨" },
        { phase: "Gruppe F", cat: "Gruppe E-H", date: "15.06.2026", time: "04:00", h: "Schweden 🇸🇪", a: "Tunesien 🇹🇳" },
        { phase: "Gruppe H", cat: "Gruppe E-H", date: "15.06.2026", time: "18:00", h: "Spanien 🇪🇸", a: "Kap Verde 🇨🇻" },
        { phase: "Gruppe G", cat: "Gruppe E-H", date: "15.06.2026", time: "21:00", h: "Belgien 🇧🇪", a: "Ägypten 🇪🇬" },
        { phase: "Gruppe H", cat: "Gruppe E-H", date: "16.06.2026", time: "00:00", h: "Saudi-Arabien 🇸🇦", a: "Uruguay 🇺🇾" },
        { phase: "Gruppe G", cat: "Gruppe E-H", date: "16.06.2026", time: "03:00", h: "Iran 🇮🇷", a: "Neuseeland 🇳🇿" },
        { phase: "Gruppe I", cat: "Gruppe I-L", date: "16.06.2026", time: "21:00", h: "Frankreich 🇫🇷", a: "Senegal 🇸🇳" },
        { phase: "Gruppe I", cat: "Gruppe I-L", date: "17.06.2026", time: "00:00", h: "Irak 🇮🇶", a: "Norwegen 🇳🇴" },
        { phase: "Gruppe J", cat: "Gruppe I-L", date: "17.06.2026", time: "03:00", h: "Argentinien 🇦🇷", a: "Algerien 🇩🇿" },
        { phase: "Gruppe J", cat: "Gruppe I-L", date: "17.06.2026", time: "06:00", h: "Österreich 🇦🇹", a: "Jordanien 🇯🇴" },
        { phase: "Gruppe K", cat: "Gruppe I-L", date: "17.06.2026", time: "19:00", h: "Portugal 🇵🇹", a: "DR Kongo 🇨🇩" },
        { phase: "Gruppe L", cat: "Gruppe I-L", date: "17.06.2026", time: "22:00", h: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", a: "Kroatien 🇭🇷" },
        { phase: "Gruppe L", cat: "Gruppe I-L", date: "18.06.2026", time: "01:00", h: "Ghana 🇬🇭", a: "Panama 🇵🇦" },
        { phase: "Gruppe K", cat: "Gruppe I-L", date: "18.06.2026", time: "04:00", h: "Usbekistan 🇺🇿", a: "Kolumbien 🇨🇴" },
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "18.06.2026", time: "18:00", h: "Tschechien 🇨🇿", a: "Südafrika 🇿🇦" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "18.06.2026", time: "21:00", h: "Schweiz 🇨🇭", a: "Bosnien-Herzegowina 🇧🇦" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "19.06.2026", time: "00:00", h: "Kanada 🇨🇦", a: "Katar 🇶🇦" },
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "19.06.2026", time: "03:00", h: "Mexiko 🇲🇽", a: "Südkorea 🇰🇷" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "19.06.2026", time: "21:00", h: "USA 🇺🇸", a: "Australien 🇦🇺" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "20.06.2026", time: "00:00", h: "Schottland 🏴󠁧󠁢󠁳󠁣󠁴󠁿", a: "Marokko 🇲🇦" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "20.06.2026", time: "03:00", h: "Brasilien 🇧🇷", a: "Haiti 🇭🇹" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "20.06.2026", time: "06:00", h: "Türkei 🇹🇷", a: "Paraguay 🇵🇾" },
        { phase: "Gruppe F", cat: "Gruppe E-H", date: "20.06.2026", time: "19:00", h: "Niederlande 🇳🇱", a: "Japan 🇯🇵" },
        { phase: "Gruppe E", cat: "Gruppe E-H", date: "20.06.2026", time: "22:00", h: "Deutschland 🇩🇪", a: "Elfenbeinküste 🇨🇮" },
        { phase: "Gruppe E", cat: "Gruppe E-H", date: "21.06.2026", time: "02:00", h: "Ecuador 🇪🇨", a: "Curaçao 🇨🇼" },
        { phase: "Gruppe F", cat: "Gruppe E-H", date: "21.06.2026", time: "06:00", h: "Tunesien 🇹🇳", a: "Japan 🇯🇵" },
        { phase: "Gruppe H", cat: "Gruppe E-H", date: "21.06.2026", time: "18:00", h: "Spanien 🇪🇸", a: "Kap Verde 🇨🇻" },
        { phase: "Gruppe G", cat: "Gruppe E-H", date: "21.06.2026", time: "21:00", h: "Belgien 🇧🇪", a: "Ägypten 🇪🇬" },
        { phase: "Gruppe H", cat: "Gruppe E-H", date: "22.06.2026", time: "00:00", h: "Uruguay 🇺🇾", a: "Saudi-Arabien 🇸🇦" },
        { phase: "Gruppe G", cat: "Gruppe E-H", date: "22.06.2026", time: "03:00", h: "Iran 🇮🇷", a: "Neuseeland 🇳🇿" },
        { phase: "Gruppe J", cat: "Gruppe I-L", date: "22.06.2026", time: "19:00", h: "Argentinien 🇦🇷", a: "Österreich 🇦🇹" },
        { phase: "Gruppe I", cat: "Gruppe I-L", date: "22.06.2026", time: "23:00", h: "Frankreich 🇫🇷", a: "Irak 🇮🇶" },
        { phase: "Gruppe I", cat: "Gruppe I-L", date: "23.06.2026", time: "02:00", h: "Norwegen 🇳🇴", a: "Senegal 🇸🇳" },
        { phase: "Gruppe J", cat: "Gruppe I-L", date: "23.06.2026", time: "05:00", h: "Jordanien 🇯🇴", a: "Algerien 🇩🇿" },
        { phase: "Gruppe K", cat: "Gruppe I-L", date: "23.06.2026", time: "19:00", h: "Portugal 🇵🇹", a: "Usbekistan 🇺🇿" },
        { phase: "Gruppe L", cat: "Gruppe I-L", date: "22.06.2026", time: "22:00", h: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", a: "Kroatien 🇭🇷" },
        { phase: "Gruppe L", cat: "Gruppe I-L", date: "24.06.2026", time: "01:00", h: "Ghana 🇬🇭", a: "Panama 🇵🇦" },
        { phase: "Gruppe K", cat: "Gruppe I-L", date: "24.06.2026", time: "04:00", h: "Kolumbien 🇨🇴", a: "DR Kongo 🇨🇩" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "24.06.2026", time: "21:00", h: "Schweiz 🇨🇭", a: "Kanada 🇨🇦" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "24.06.2026", time: "21:00", h: "Bosnien-Herzegowina 🇧🇦", a: "Katar 🇶🇦" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "25.06.2026", time: "00:00", h: "Schottland 🏴󠁧󠁢󠁳󠁣󠁴󠁿", a: "Brasilien 🇧🇷" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "25.06.2026", time: "00:00", h: "Marokko 🇲🇦", a: "Haiti 🇭🇹" },
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "25.06.2026", time: "03:00", h: "Tschechien 🇨🇿", a: "Mexiko 🇲🇽" },
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "25.06.2026", time: "03:00", h: "Südafrika 🇿🇦", a: "Südkorea 🇰🇷" },
        { phase: "Gruppe E", cat: "Gruppe E-H", date: "25.06.2026", time: "22:00", h: "Ecuador 🇪🇨", a: "Deutschland 🇩🇪" },
        { phase: "Gruppe E", cat: "Gruppe E-H", date: "25.06.2026", time: "22:00", h: "Curaçao 🇨🇼", a: "Elfenbeinküste 🇨🇮" },
        { phase: "Gruppe F", cat: "Gruppe E-H", date: "26.06.2026", time: "01:00", h: "Japan 🇯🇵", a: "Schweden 🇸🇪" },
        { phase: "Gruppe F", cat: "Gruppe E-H", date: "26.06.2026", time: "01:00", h: "Tunesien 🇹🇳", a: "Niederlande 🇳🇱" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "26.06.2026", time: "04:00", h: "Türkei 🇹🇷", a: "USA 🇺🇸" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "26.06.2026", time: "04:00", h: "Paraguay 🇵🇾", a: "Australien 🇦🇺" },
        { phase: "Gruppe I", cat: "Gruppe I-L", date: "26.06.2026", time: "21:00", h: "Norwegen 🇳🇴", a: "Frankreich 🇫🇷" },
        { phase: "Gruppe I", cat: "Gruppe I-L", date: "26.06.2026", time: "21:00", h: "Senegal 🇸🇳", a: "Irak 🇮🇶" },
        { phase: "Gruppe H", cat: "Gruppe E-H", date: "27.06.2026", time: "02:00", h: "Uruguay 🇺🇾", a: "Spanien 🇪🇸" },
        { phase: "Gruppe H", cat: "Gruppe E-H", date: "27.06.2026", time: "02:00", h: "Kap Verde 🇨🇻", a: "Saudi-Arabien 🇸🇦" },
        { phase: "Gruppe G", cat: "Gruppe E-H", date: "27.06.2026", time: "05:00", h: "Neuseeland 🇳🇿", a: "Belgien 🇧🇪" },
        { phase: "Gruppe G", cat: "Gruppe E-H", date: "27.06.2026", time: "05:00", h: "Ägypten 🇪🇬", a: "Iran 🇮🇷" },
        { phase: "Gruppe L", cat: "Gruppe I-L", date: "27.06.2026", time: "23:00", h: "Panama 🇵🇦", a: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
        { phase: "Gruppe L", cat: "Gruppe I-L", date: "27.06.2026", time: "23:00", h: "Kroatien 🇭🇷", a: "Ghana 🇬🇭" },
        { phase: "Gruppe K", cat: "Gruppe I-L", date: "25.06.2026", time: "01:30", h: "Kolumbien 🇨🇴", a: "Portugal 🇵🇹" },
        { phase: "Gruppe K", cat: "Gruppe I-L", date: "28.06.2026", time: "01:30", h: "DR Kongo 🇨🇩", a: "Usbekistan 🇺🇿" },
        { phase: "Gruppe J", cat: "Gruppe I-L", date: "28.06.2026", time: "04:00", h: "Jordanien 🇯🇴", a: "Argentinien 🇦🇷" },
        { phase: "Gruppe J", cat: "Gruppe I-L", date: "28.06.2026", time: "04:00", h: "Algerien 🇩🇿", a: "Österreich 🇦🇹" }
    ];

    const koMatches = [
        { phase: "Sechzehntelfinale", cat: "KO", date: "28.06.2026", time: "21:00", h: "2. Gruppe A 🥈", a: "2. Gruppe B 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "29.06.2026", time: "19:00", h: "1. Gruppe C 🥇", a: "2. Gruppe F 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "29.06.2026", time: "22:30", h: "1. Gruppe E 🥇", a: "3. Gruppe A/B/C/D/F 🥉" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "30.06.2026", time: "03:00", h: "1. Gruppe F 🥇", a: "2. Gruppe C 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "30.06.2026", time: "19:00", h: "2. Gruppe E 🥈", a: "2. Gruppe I 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "30.06.2026", time: "23:00", h: "1. Gruppe I 🥇", a: "3. Gruppe C/D/F/G/H 🥉" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "01.07.2026", time: "03:00", h: "1. Gruppe A 🥇", a: "3. Gruppe C/E/F/H/I 🥉" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "01.07.2026", time: "18:00", h: "1. Gruppe L 🥇", a: "3. Gruppe E/F/G/I/K 🥉" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "01.07.2026", time: "22:00", h: "1. Gruppe G 🥇", a: "3. Gruppe A/E/H/I/J 🥉" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "02.07.2026", time: "02:00", h: "1. Gruppe D 🥇", a: "3. Gruppe B/E/F/I/J 🥉" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "02.07.2026", time: "21:00", h: "1. Gruppe H 🥇", a: "2. Gruppe J 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "03.07.2026", time: "01:00", h: "2. Gruppe K 🥈", a: "2. Gruppe L 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "03.07.2026", time: "05:00", h: "1. Gruppe B 🥇", a: "3. Gruppe E/F/G/H/I 🥉" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "03.07.2026", time: "20:00", h: "2. Gruppe D 🥈", a: "2. Gruppe G 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "04.07.2026", time: "00:00", h: "1. Gruppe J 🥇", a: "2. Gruppe H 🥈" },
        { phase: "Sechzehntelfinale", cat: "KO", date: "04.07.2026", time: "03:30", h: "1. Gruppe K 🥇", a: "3. Gruppe D/E/I/J/L 🥉" },
        { phase: "Achtelfinale", cat: "KO", date: "04.07.2026", time: "19:00", h: "Sieger 28.06. 21:00", a: "Sieger 29.06. 19:00" },
        { phase: "Achtelfinale", cat: "KO", date: "04.07.2026", time: "23:00", h: "Sieger 29.06. 22:30", a: "Sieger 30.06. 03:00" },
        { phase: "Achtelfinale", cat: "KO", date: "05.07.2026", time: "22:00", h: "Sieger 30.06. 19:00", a: "Sieger 30.06. 23:00" },
        { phase: "Achtelfinale", cat: "KO", date: "06.07.2026", time: "02:00", h: "Sieger 01.07. 03:00", a: "Sieger 01.07. 18:00" },
        { phase: "Achtelfinale", cat: "KO", date: "06.07.2026", time: "19:00", h: "Sieger 01.07. 22:00", a: "Sieger 02.07. 02:00" },
        { phase: "Achtelfinale", cat: "KO", date: "07.07.2026", time: "02:00", h: "Sieger 02.07. 21:00", a: "Sieger 03.07. 01:00" },
        { phase: "Achtelfinale", cat: "KO", date: "07.07.2026", time: "18:00", h: "Sieger 03.07. 05:00", a: "Sieger 03.07. 20:00" },
        { phase: "Achtelfinale", cat: "KO", date: "07.07.2026", time: "22:00", h: "Sieger 04.07. 00:00", a: "Sieger 04.07. 03:30" },
        { phase: "Viertelfinale", cat: "KO", date: "09.07.2026", time: "22:00", h: "Sieger Achtelfinale 04.07. 19:00", a: "Sieger Achtelfinale 04.07. 23:00" },
        { phase: "Viertelfinale", cat: "KO", date: "10.07.2026", time: "21:00", h: "Sieger Achtelfinale 06.07. 19:00", a: "Sieger Achtelfinale 07.07. 02:00" },
        { phase: "Viertelfinale", cat: "KO", date: "11.07.2026", time: "23:00", h: "Sieger Achtelfinale 05.07. 22:00", a: "Sieger Achtelfinale 06.07. 02:00" },
        { phase: "Viertelfinale", cat: "KO", date: "12.07.2026", time: "02:00", h: "Sieger Achtelfinale 07.07. 18:00", a: "Sieger Achtelfinale 07.07. 22:00" },
        { phase: "Halbfinale", cat: "KO", date: "14.07.2026", time: "21:00", h: "Sieger Viertelfinale 09.07.", a: "Sieger Viertelfinale 10.07." },
        { phase: "Halbfinale", cat: "KO", date: "15.07.2026", time: "21:00", h: "Sieger Viertelfinale 11.07.", a: "Sieger Viertelfinale 12.07." },
        { phase: "Spiel um Platz 3", cat: "KO", date: "18.07.2026", time: "23:00", h: "Verlierer Halbfinale 14.07.", a: "Verlierer Halbfinale 15.07." },
        { phase: "💥 FINALE 💥", cat: "KO", date: "19.07.2026", time: "21:00", h: "Sieger Halbfinale 14.07.", a: "Sieger Halbfinale 15.07." }
    ];

    const allRawMatches = [...gruppenMatches, ...koMatches];
    let matchCounter = 1;
    matches.length = 0; 
    allRawMatches.forEach(m => {
        matches.push({
            id: matchCounter++,
            phase: m.phase,
            filterCategory: m.cat,
            date: m.date,
            time: m.time,
            home: m.h,
            away: m.a
        });
    });
}

// 📊 UPDATET LOKALE VARIABLEN AUS SERVER-DATENSÄTZEN
async function fetchServerData() {
    const tipsData = await getFromSupabase("wm_tips");
    const resultsData = await getFromSupabase("wm_results");
    const bonusData = await getFromSupabase("wm_bonus_tips");

    serverTips = tipsData.map(t => ({
        id: t.id, 
        user: t.user_name, pin: t.pin, matchId: t.match_id, matchTeams: t.match_teams,
        phase: t.phase, score: t.score, homeGoals: t.home_goals, awayGoals: t.away_goals
    }));

    serverResults = {};
    resultsData.forEach(r => {
        serverResults[r.match_id] = { id: r.id, home: r.home_goals, away: r.away_goals };
    });

    serverBonusTips = {};
    bonusData.forEach(b => {
        // Wir speichern die Bonustipps jetzt über die Kombination aus Name UND Pin ab!
        serverBonusTips[`${b.user_name}_${b.pin}`] = { pin: b.pin, wm: b.wm_tip, scorer: b.scorer_tip };
    });
}

// 📑 ERSTELLT DIE STRUKTUR UND TABS
function buildKachelnAndTabs() {
    let kachelLeiste = document.querySelector(".kachel-leiste");
    if (!kachelLeiste) return;

    const kachelDefinitionen = [
        { id: "tippen", text: "⚽ Spiele & Tippen" },
        { id: "gruppen", text: "📅 WM-Gruppen" },
        { id: "tippspielrangliste", text: "🏆 Tippspielrangliste" },
        { id: "wm-ergebnisse", text: "📊 Offizielle WM-Ergebnisse" }
    ];

    kachelLeiste.innerHTML = "";
    kachelDefinitionen.forEach(k => {
        kachelLeiste.innerHTML += `<button id="btn-${k.id}" class="kachel" onclick="switchTab('${k.id}')">${k.text}</button>`;
    });

    let contentArea = document.getElementById("tab-content-area");
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div id="tab-tippen" class="tab-content" style="display:none;"></div>
        <div id="tab-gruppen" class="tab-content" style="display:none;">
            <h3>📅 Offizielle WM-Gruppen</h3>
            <div id="gruppen-container" class="gruppen-grid"></div>
        </div>
        <div id="tab-tippspielrangliste" class="tab-content" style="display:none; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"></div>
        <div id="tab-wm-ergebnisse" class="tab-content" style="display:none;">
            <h3>📊 Offizielle WM-Ergebnisse</h3>
            <table>
                <thead>
                    <tr><th>Spiel</th><th>Datum & Zeit</th><th>Begegnung</th><th>Endergebnis</th></tr>
                </thead>
                <tbody id="wm-results-body"></tbody>
            </table>
        </div>
    `;

    document.getElementById("tab-tippen").innerHTML = `
        <div class="welcome-box" id="admin-status-bar">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                <span id="welcome-msg" style="font-weight:bold;"></span>
                <div style="display:flex; flex-direction:column; gap:8px; background:white; padding:15px; border-radius:8px; border:1px solid #cbd5e0; min-width:280px;" id="login-form-area">
                    <div style="font-weight:bold; font-size:0.9rem; color:#4a5568;">👤 Tipper-Anmeldung (Mit PIN-Schutz)</div>
                    <div style="display:flex; gap:6px;">
                        <input type="text" id="username" placeholder="Name" style="flex:2; padding:8px; border-radius:4px; border:1px solid #cbd5e0;">
                        <input type="password" id="userpin" placeholder="4-stg. PIN" maxlength="4" style="flex:1; padding:8px; border-radius:4px; border:1px solid #cbd5e0; text-align:center;">
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label style="font-size:0.75rem; font-weight:bold; color:#718096; display:block;">🔮 Weltmeister-Tipp:</label>
                            <input type="text" id="bonus-wm" placeholder="z.B. Brasilien" style="padding:6px; width:100%; box-sizing:border-box; border-radius:4px; border:1px solid #cbd5e0; font-size:0.85rem;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.75rem; font-weight:bold; color:#718096; display:block;">⚽ Top-Torjäger:</label>
                            <input type="text" id="bonus-scorer" placeholder="z.B. Mbappé" style="padding:6px; width:100%; box-sizing:border-box; border-radius:4px; border:1px solid #cbd5e0; font-size:0.85rem;">
                        </div>
                    </div>
                    <button onclick="registerUser()" style="background:#3182ce; color:white; font-weight:bold; padding:8px; border:none; border-radius:4px; cursor:pointer;">Speichern & Anmelden</button>
                </div>
            </div>
        </div>
        <div class="filter-box" style="margin: 15px 0; padding: 10px; background:#edf2f7; border-radius:8px;">
            <label style="font-weight:bold; margin-right:10px;">Phase filtern:</label>
            <select id="stage-filter" onchange="renderMatches()" style="padding:6px; border-radius:4px;">
                <option value="ALL">Alle Spiele anzeigen</option>
                <option value="Gruppe A-D">Gruppen A - D</option>
                <option value="Gruppe E-H">Gruppen E - H</option>
                <option value="Gruppe I-L">Gruppen I - L</option>
                <option value="KO">K.o.-Runde</option>
            </select>
        </div>
        <div id="matches-container"></div>
    `;
}

// 🔄 SCHALTET ZWISCHEN TABS UM
async function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.kachel').forEach(el => {
        el.style.background = '#e2e8f0';
        el.style.color = '#2d3748';
    });
    
    const targetTab = document.getElementById(`tab-${tabName}`);
    const targetBtn = document.getElementById(`btn-${tabName}`);
    
    if(targetTab) targetTab.style.display = 'block';
    if(targetBtn) {
        targetBtn.style.background = '#3182ce';
        targetBtn.style.color = 'white';
    }

    await fetchServerData();

    if (tabName === "gruppen") {
        renderGruppen();
    } else if (tabName === "tippspielrangliste") {
        renderLeaderboard();
    } else if (tabName === "wm-ergebnisse") {
        renderWMResultsTab();
    } else if (tabName === "tippen") {
        renderMatches();
    }
}

// 👤 ANMELDUNG & REGISTRIERUNG (KOMPLETT ÜBERARBEITET FÜR COMPOSITE PRIMARY KEY)
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

    // Sicherheitsprüfung: Prüfen, ob der Name existiert, aber eine andere PIN nutzt
    const checkUrl = `${SUPABASE_URL}/rest/v1/wm_bonus_tips?user_name=eq.${encodeURIComponent(nameInput)}`;
    try {
        const checkRes = await fetch(checkUrl, {
            method: "GET",
            headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const checkData = await checkRes.json();
        
        if (checkData && checkData.length > 0) {
            // Wenn der Name existiert, MUSS die PIN übereinstimmen um sich einzuloggen
            const match = checkData.find(d => d.pin === pinInput);
            if (!match) {
                alert(`Fehler: Der Name '${nameInput}' ist bereits mit einer anderen PIN geschützt!`);
                return; 
            }
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

    // Durch den neuen resolution=merge-duplicates Header in saveToSupabase 
    // wird aus dem POST automatisch ein sicheres Einloggen/Überschreiben (Upsert)
    let success = await saveToSupabase("wm_bonus_tips", saveData, "POST");

    if(success) {
        alert(`Erfolgreich eingeloggt als '${currentUser}'!`);
        await fetchServerData();
        updateWelcomeMessage();
        renderMatches();
    }
}

function updateWelcomeMessage() {
    const welcome = document.getElementById("welcome-msg");
    const formArea = document.getElementById("login-form-area");
    if(!welcome) return;

    if(isAdmin) {
        document.getElementById("admin-status-bar").style.background = "#fed7d7"; 
        welcome.innerHTML = `<span style="color:#c53030;">⚙️ Modus: <strong>Admin-Zentrale</strong></span>`;
        formArea.innerHTML = `<button onclick="logoutAdmin()" style="background:#e53e3e; color:white; padding:8px; border-radius:4px; border:none; cursor:pointer;">Admin beenden</button>`;
    } else if(currentUser) {
        const userBonus = serverBonusTips[`${currentUser}_${currentPin}`] || { wm: "Kein Tipp", scorer: "Kein Tipp" };

        welcome.innerHTML = `
            👋 Angemeldet als: <strong style="color:#3182ce; font-size:1.2rem;">${currentUser}</strong> <small style="color:#a0aec0;">(🔒 PIN aktiv)</small><br>
            <span style="font-size:0.9rem; color:#4a5568; display:block; margin-top:5px;">
                🔮 WM-Tipp: <strong>${userBonus.wm}</strong> | 👟 Top-Torjäger: <strong>${userBonus.scorer}</strong>
            </span>
        `;
        formArea.innerHTML = `
            <button onclick="resetLoginForm()" style="background:#4a5568; color:white; padding:8px; border-radius:4px; border:none; cursor:pointer;">User wechseln / Tipps ändern</button>
        `;
    } else {
        welcome.innerText = "Bitte melde dich an, um deine Tipps abzugeben.";
    }
}

function resetLoginForm() {
    currentUser = "";
    currentPin = "";
    localStorage.removeItem("wm_user_2026");
    localStorage.removeItem("wm_pin_2026");
    buildKachelnAndTabs();
    updateWelcomeMessage();
    renderMatches();
}

function logoutAdmin() {
    isAdmin = false;
    currentUser = "";
    currentPin = "";
    localStorage.removeItem("wm_user_2026");
    localStorage.removeItem("wm_pin_2026");
    document.getElementById("admin-status-bar").style.background = "#edf2f7";
    
    buildKachelnAndTabs();
    updateWelcomeMessage();
    switchTab("tippen");
}

// 🧮 PUNKTEBERECHNUNG: Exakt = 4, Tendenz = 2, Falsche Tendenz aber ein richtiges Tor = 1, Sonst = 0
function calculatePoints(tHome, tAway, rHome, rAway) {
    const th = parseInt(tHome);
    const ta = parseInt(tAway);
    const rh = parseInt(rHome);
    const ra = parseInt(rAway);

    if (isNaN(th) || isNaN(ta) || isNaN(rh) || isNaN(ra)) return 0;
    if (th === rh && ta === ra) return 4;
    if (th === rh || ta === ra) {
        const tippTendenz = th > ta ? 1 : (th < ta ? -1 : 0);
        const realTendenz = rh > ra ? 1 : (rh < ra ? -1 : 0);
        if (tippTendenz === realTendenz) return 2;
        return 1;
    }

    const tippTendenz = th > ta ? 1 : (th < ta ? -1 : 0);
    const realTendenz = rh > ra ? 1 : (rh < ra ? -1 : 0);
    if (tippTendenz === realTendenz) return 2;

    return 0; 
}

// ⚽ SPEICHERT ODER UPDATET EINEN TIPPSPIEL-EINTRAG (FÜR ALLE 104 SPIELE GEEIGNET)
async function saveTip(matchId, matchTeams, phase) {
    if (!currentUser || currentUser === "Admin⚙️") {
        alert("Bitte melde dich zuerst als Tipper an!");
        return;
    }

    const homeInput = document.getElementById(`home-tip-${matchId}`).value;
    const awayInput = document.getElementById(`away-tip-${matchId}`).value;

    if (homeInput === "" || awayInput === "") {
        alert("Bitte trage beide Felder für das Ergebnis ein!");
        return;
    }

    const scoreString = `${homeInput}:${awayInput}`;
    
    // 🔒 ÜBERARBEITET: Sucht den existierenden Tipp anhand von user UND pin, damit Kevins sich nicht löschen!
    const existingTip = serverTips.find(t => t.user === currentUser && t.pin === currentPin && t.matchId === matchId);

    const saveData = {
        user_name: currentUser,
        pin: currentPin,
        match_id: matchId,
        match_teams: matchTeams,
        phase: phase,
        score: scoreString,
        home_goals: parseInt(homeInput),
        away_goals: parseInt(awayInput)
    };

    let success = false;
    if (existingTip && existingTip.id) {
        success = await saveToSupabase("wm_tips", saveData, "PATCH", existingTip.id);
    } else {
        success = await saveToSupabase("wm_tips", saveData, "POST");
    }

    if (success) {
        alert("Tipp erfolgreich abgegeben!");
        await fetchServerData();
        renderMatches();
    }
}
