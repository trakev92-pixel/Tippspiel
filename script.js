// ⚠️ HIER DEINE DATEN VON SUPABASE EINTRAGEN!
const SUPABASE_URL = "https://abzivpkrhespyvubtcer.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieml2cGtyaGVzcHl2dWJ0Y2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjQ0MzIsImV4cCI6MjA5NjAwMDQzMn0.V2_K_GOQIgvhTmHRDl5y0EyF0AbeopYJ-u8ermrgOl8";

let currentUser = localStorage.getItem("wm_user_2026") || "";
let currentPin = localStorage.getItem("wm_pin_2026") || ""; // Merkt sich die PIN im Browser
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
    
    // Wenn wir updaten (PATCH), hängen wir die ID der Zeile an die URL
    if (method === "PATCH" && rowId) {
        url += `?id=eq.${rowId}`;
    }

    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
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

function generate104Matches() {
    const gruppenMatches = [
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "11.06.2026", time: "21:00", h: "Mexiko 🇲🇽", a: "Südafrika 🇿🇦" },
        { phase: "Gruppe A", cat: "Gruppe A-D", date: "12.06.2026", time: "04:00", h: "Südkorea 🇰🇷", a: "Tschechien 🇨🇿" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "12.06.2026", time: "21:00", h: "Kanada 🇨🇦", a: "Bosnien-Herzegowina 🇧🇦" },
        { phase: "Gruppe D", cat: "Gruppe A-D", date: "13.06.2026", time: "03:00", h: "USA 🇺🇸", a: "Paraguay 🇵🇾" },
        { phase: "Gruppe B", cat: "Gruppe A-D", date: "13.06.2026", time: "21:00", h: "Katar 🇶🇦", a: "Schweiz 🇨🇭" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "14.06.2026", time: "00:00", h: "Brasilien 🇧🇷", a: "Marokko 🇲🇦" },
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "14.06.2026", time: "03:00", h: "Haiti 🇭🇹", a: "Schottland 🏴󠁧󠁢󠁣󠁴󠁿" },
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
        { phase: "Gruppe C", cat: "Gruppe A-D", date: "20.06.2026", time: "00:00", h: "Schottland 🏴󠁧󠁢󠁣󠁴󠁿", a: "Marokko 🇲🇦" },
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
        { phase: "Gruppe I", cat: "Gruppe I-L", date: "23.06.2026", time: "02:
