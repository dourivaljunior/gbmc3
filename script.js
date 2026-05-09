let currentView = "list";
let currentSong = null;
let currentLyricsText = "";
let musicDatabase = [];

const resultsDiv = document.getElementById("resultsContent");
const searchInput = document.getElementById("searchInput");

function filterSongs(songs, query) {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return songs.filter(s => s.nome.toLowerCase().includes(q) || s.artista.toLowerCase().includes(q));
}

async function loadLyrics(file) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error();
        return await res.text();
    } catch {
        return "❌ Letra não encontrada.";
    }
}

function showDetail(song) {
    currentSong = song;
    currentView = "detail";
    render();
}

function renderDetail() {
    if (!currentSong) return;
    resultsDiv.innerHTML = `
        <div>
            <button class="back-btn" id="backBtn" style="background:rgba(255,255,255,0.15); border:none; color:white; padding:10px 24px; border-radius:40px; cursor:pointer; margin-bottom:30px;">← Voltar</button>
            <div style="display:flex; flex-wrap:wrap; gap:30px; background:rgba(0,0,0,0.75); border-radius:32px; padding:40px;">
                <div style="flex:3; min-width:280px;">
                    <h3 style="color:#ffb347; margin-bottom:20px;">📖 ${escapeHtml(currentSong.nome)} - ${escapeHtml(currentSong.artista)}</h3>
                    <div style="font-family:monospace; white-space:pre-wrap; max-height:65vh; overflow:auto; line-height:1.6;">${escapeHtml(currentLyricsText).replace(/\n/g,'<br>')}</div>
                </div>
                <div style="flex:1; min-width:260px; display:flex; flex-direction:column; gap:24px;">
                    <div style="background:rgba(255,255,255,0.08); border-radius:24px; padding:24px; text-align:center;">
                        <h4 style="color:#ffcc77; margin-bottom:16px;">🎧 Música Original</h4>
                        <audio controls src="${currentSong.mp3}" style="width:100%"></audio>
                    </div>
                    <div style="background:rgba(255,255,255,0.08); border-radius:24px; padding:24px; text-align:center;">
                        <h4 style="color:#ffcc77; margin-bottom:16px;">🎹 Backing Track</h4>
                        <audio controls src="${currentSong.backingTrack}" style="width:100%"></audio>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById("backBtn")?.addEventListener("click", () => {
        currentView = "list";
        currentSong = null;
        render();
    });
}

function renderList() {
    const term = searchInput.value;
    
    // Busca vazia: NÃO MOSTRA NADA (mensagem removida)
    if (!term.trim()) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    let filtered = filterSongs(musicDatabase, term);
    if (filtered.length === 0) {
        resultsDiv.innerHTML = `<div class="empty-message">😕 Nenhuma música encontrada para "${escapeHtml(term)}"</div>`;
        return;
    }

    let html = `<div class="results-info">✨ ${filtered.length} música(s) encontrada(s)</div>`;
    filtered.forEach(song => {
        html += `
            <div class="music-card">
                <div class="music-info">
                    <div class="music-title" data-song='${JSON.stringify(song)}'>
                        <div class="music-name">${escapeHtml(song.nome)}</div>
                        <div class="music-artist">${escapeHtml(song.artista)}</div>
                    </div>
                    <div class="link-lyrics">📄 Letra</div>
                    <div class="music-controls">
                        <div class="player-label"><span>🎧 Original</span><audio controls src="${song.mp3}"></audio></div>
                        <div class="player-label"><span>🎹 Backing</span><audio controls src="${song.backingTrack}"></audio></div>
                    </div>
                </div>
            </div>
        `;
    });
    resultsDiv.innerHTML = html;

    document.querySelectorAll('.music-title').forEach(el => {
        el.addEventListener('click', async (e) => {
            const song = JSON.parse(el.dataset.song);
            currentLyricsText = await loadLyrics(song.txt);
            showDetail(song);
        });
    });
}

function render() {
    if (currentView === "detail") renderDetail();
    else renderList();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function loadDB() {
    if (typeof musicData !== 'undefined') {
        musicDatabase = musicData;
        render();
    } else {
        resultsDiv.innerHTML = '<div class="empty-message">⚠️ Erro ao carregar playlist.</div>';
    }
}

searchInput.addEventListener("input", () => { if (currentView === "list") render(); });
loadDB();
