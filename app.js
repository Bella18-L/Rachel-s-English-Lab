const app = document.getElementById("app");
let theme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", theme);

let currentMode = "bilingual";
let currentEp = null;
let loopMode = false;
let abMode = false;
let abStart = 0, abEnd = 0;
let favs = JSON.parse(localStorage.getItem("favs")) || [];
let flashIndex = 0;
let studyTime = 0;
let fontSize = 16;
let currentSubIndex = 0;

let users = [];
let episodes = [];

setInterval(() => studyTime++, 1000);
loadConfig();

async function loadConfig() {
  const uRes = await fetch("/config/users.json");
  users = await uRes.json();
  const vRes = await fetch("/config/videos.json");
  episodes = await vRes.json();
  startApp();
}

function startApp() {
  showLogin();
  syncLoop();
  hideLoading();
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

function showLogin() {
  app.innerHTML = `
    <div class="login-box">
      <h2>登录</h2>
      <input id="u" placeholder="账号">
      <input id="p" type="password" placeholder="密码">
      <button onclick="login()">登录</button>
    </div>
  `;
}

function login() {
  const u = document.getElementById("u").value;
  const p = document.getElementById("p").value;
  const ok = users.some(x => x.username === u && x.password === p);
  ok ? showHome() : alert("账号或密码错误");
}

function showHome() {
  const cards = episodes.map(ep => `
    <div class="ep-card" onclick="goPlayer('${ep.id}')">
      <div class="ep-cover"></div>
      <div class="ep-info">
        <div>${ep.id}</div>
        <div style="color:#888;font-size:14px">${ep.title}</div>
      </div>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="navbar">
      <div>英语语料库</div>
      <button class="theme-btn" onclick="toggleTheme()">切换模式</button>
    </div>
    <div class="home">
      <h2>剧集列表</h2>
      <div class="ep-grid">${cards}</div>
    </div>
  `;
}

function goPlayer(id) {
  currentEp = episodes.find(e => e.id === id);
  if (!currentEp) return;
  renderPlayer();
}

function renderPlayer() {
  const ep = currentEp;
  let subHtml = "";

  ep.subs.forEach((s, idx) => {
    let en = s.en;
    if (currentMode === "dictation") en = s.dictEn;
    if (currentMode === "blank") en = s.blankEn;
    const phonetic = currentMode === "read" ? `<div class="sub-phonetic">${s.phonetic}</div>` : "";

    subHtml += `
      <div class="sub-item" id="sub${idx}" onclick="jumpTo(${s.time}, ${s.endTime}, ${idx})">
        <div class="sub-en">${en}</div>
        ${phonetic}
        <div class="sub-cn">${s.cn}</div>
      </div>
    `;
  });

  let vocabHtml = "";
  ep.subs.forEach(s => {
    s.vocab.forEach(v => {
      const isFav = favs.some(x => x.word === v.word && x.ep === currentEp.id);
      vocabHtml += `
        <div class="vocab-item">
          <div><b>${v.word}</b> · ${v.type} · ${v.mean}</div>
          <span class="vocab-fav" onclick="toggleFav('${v.word}','${v.mean}','${v.type}')">
            ${isFav ? "⭐" : "☆"}
          </span>
        </div>
      `;
    });
  });

  app.innerHTML = `
    <div class="navbar">
      <div class="navbar-left">
        <button class="back-btn" onclick="showHome()">← 返回</button>
        <span>${ep.id} | 学习 ${Math.floor(studyTime/60)} 分钟</span>
      </div>
      <div class="mode-tabs">
        <div class="mode-tab ${currentMode==='bilingual'?'active':''}" onclick="setMode('bilingual')">双语</div>
        <div class="mode-tab ${currentMode==='english'?'active':''}" onclick="setMode('english')">英文</div>
        <div class="mode-tab ${currentMode==='chinese'?'active':''}" onclick="setMode('chinese')">中文</div>
        <div class="mode-tab ${currentMode==='dictation'?'active':''}" onclick="setMode('dictation')">听写</div>
        <div class="mode-tab ${currentMode==='blank'?'active':''}" onclick="setMode('blank')">填空</div>
        <div class="mode-tab ${currentMode==='read'?'active':''}" onclick="setMode('read')">跟读</div>
        <div class="mode-tab ${currentMode==='flash'?'active':''}" onclick="setMode('flash')">闪卡</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="theme-btn" onclick="fontSize++;document.documentElement.style.setProperty('--font-size',fontSize+'px')">A+</button>
        <button class="theme-btn" onclick="fontSize--;document.documentElement.style.setProperty('--font-size',fontSize+'px')">A-</button>
        <button class="theme-btn" onclick="toggleTheme()">模式</button>
      </div>
    </div>

    <div class="player-layout">
      <div class="video-section">
        <div class="video-box">
          <video id="v" src="${ep.video}" controls></video>
        </div>
        <div class="controls">
          <button onclick="play()">播放</button>
          <button onclick="pause()">暂停</button>
          <button onclick="prevSub()">← 上一句</button>
          <button onclick="nextSub()">下一句 →</button>
          <button id="loopBtn" onclick="toggleLoop()">单句循环</button>
          <button onclick="setAB()">AB点</button>
          <button onclick="volUp()">音量+</button>
          <button onclick="volDown()">音量-</button>
          <select onchange="setSpeed(this.value)">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
          <button onclick="restart()">重播</button>
          <button onclick="clearFavs()" style="background:var(--orange)">清空收藏</button>
        </div>
        ${currentMode==='flash'?renderFlash():''}
      </div>

      <div class="sub-section">
        ${subHtml}
        <div class="vocab-panel">
          <h4>本集重点词汇</h4>
          ${vocabHtml}
        </div>
      </div>
    </div>
  `;
}

function setMode(m) {
  currentMode = m;
  loopMode = abMode = false;
  renderPlayer();
}

function jumpTo(time, end, idx) {
  const v = document.getElementById("v");
  v.currentTime = time;
  abStart = time;
  abEnd = end;
  currentSubIndex = idx;
  v.play();
}

function prevSub() {
  if (!currentEp) return;
  currentSubIndex = Math.max(0, currentSubIndex - 1);
  const s = currentEp.subs[currentSubIndex];
  jumpTo(s.time, s.endTime, currentSubIndex);
}

function nextSub() {
  if (!currentEp) return;
  currentSubIndex = Math.min(currentEp.subs.length - 1, currentSubIndex + 1);
  const s = currentEp.subs[currentSubIndex];
  jumpTo(s.time, s.endTime, currentSubIndex);
}

function toggleLoop() {
  loopMode = !loopMode;
  document.getElementById("loopBtn").classList.toggle("loop-active", loopMode);
}

function setAB() {
  const v = document.getElementById("v");
  if (!abMode) {
    abStart = v.currentTime;
    abMode = true;
    alert("AB起点已设置");
  } else {
    abEnd = v.currentTime;
    alert("AB循环已开启");
  }
}

function syncLoop() {
  setInterval(() => {
    const v = document.getElementById("v");
    if (!v || !currentEp) return;
    const t = v.currentTime;

    currentEp.subs.forEach((s, i) => {
      const el = document.getElementById("sub" + i);
      if (!el) return;
      const on = t >= s.time && t <= s.endTime;
      el.classList.toggle("active", on);
      if (on) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    if (loopMode) {
      const cur = currentEp.subs.find(s => t >= s.time && t <= s.endTime);
      if (cur && t > cur.endTime) v.currentTime = cur.time;
    }

    if (abMode && abEnd > abStart && t > abEnd) {
      v.currentTime = abStart;
    }
  }, 100);
}

function toggleFav(word, mean, type) {
  const item = { word, mean, type, ep: currentEp.id };
  const i = favs.findIndex(x => x.word === word && x.ep === currentEp.id);
  i >= 0 ? favs.splice(i, 1) : favs.push(item);
  localStorage.setItem("favs", JSON.stringify(favs));
  renderPlayer();
}

function clearFavs() {
  if (confirm("确定清空所有收藏？")) {
    favs = [];
    localStorage.setItem("favs", "[]");
    renderPlayer();
  }
}

function renderFlash() {
  if (favs.length === 0) return '<div class="flashcard">暂无收藏生词</div>';
  const f = favs[flashIndex % favs.length];
  return `
    <div class="flashcard">
      <div class="flash-word">${f.word}</div>
      <div class="flash-mean">${f.mean} (${f.type})</div>
      <div class="flash-btns">
        <button onclick="flashIndex--;renderPlayer()">上一个</button>
        <button onclick="flashIndex++;renderPlayer()">下一个</button>
      </div>
    </div>
  `;
}

function volUp() {
  const v = document.getElementById("v");
  v.volume = Math.min(1, v.volume + 0.1);
}

function volDown() {
  const v = document.getElementById("v");
  v.volume = Math.max(0, v.volume - 0.1);
}

function play() { document.getElementById("v").play(); }
function pause() { document.getElementById("v").pause(); }
function setSpeed(v) { document.getElementById("v").playbackRate = v; }
function restart() { const v = document.getElementById("v"); v.currentTime = 0; v.play(); }

function toggleTheme() {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  renderPlayer();
}
