const app = document.getElementById("app");
let theme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", theme);

let currentMode = "bilingual";
let currentEp = null;
let searchKeyword = "";

let filters = {
  sort: "asc",
  difficulty: 0,
  gender: "all",
  tags: "all"
};

let learnStatus = JSON.parse(localStorage.getItem("learnStatus")) || {};
let lastPlay = JSON.parse(localStorage.getItem("lastPlay")) || null;
let favs = JSON.parse(localStorage.getItem("favs")) || [];

let users = [];
let episodes = [];

window.onload = loadAll();

async function loadAll() {
  const uRes = await fetch("config/users.json");
  users = await uRes.json();
  const vRes = await fetch("config/videos.json");
  episodes = await vRes.json();
  document.getElementById("loading").style.display = "none";
  showLogin();
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
  if (ok) {
    showHome();
  } else {
    alert("账号或密码错误");
  }
}

function setSearch(val) {
  searchKeyword = val.toLowerCase().trim();
  showHome();
}

function showHome() {
  const total = episodes.length;
  const learned = Object.keys(learnStatus).filter(k => learnStatus[k]).length;
  const unlearned = total - learned;
  const favCount = favs.length;

  let filtered = [...episodes];

  if (searchKeyword) {
    filtered = filtered.filter(ep =>
      ep.subs.some(s => s.en.toLowerCase().includes(searchKeyword))
    );
  }

  app.innerHTML = `
    <div class="navbar">
      <div>英语语料库</div>
      <div style="display:flex;align-items:center;gap:12px;">
        <input class="search-input" placeholder="搜索单词..." oninput="setSearch(this.value)">
        <button class="theme-btn" onclick="toggleTheme()">切换模式</button>
      </div>
    </div>

    <div class="home-container">
      <div class="home-sidebar">
        <div class="stat-item">
          <span>总期数</span>
          <span>${total}</span>
        </div>
        <div class="stat-item">
          <span>已学习</span>
          <span>${learned}</span>
        </div>
        <div class="stat-item">
          <span>未学习</span>
          <span>${unlearned}</span>
        </div>
        <div class="stat-item">
          <span>已收藏</span>
          <span>${favCount}</span>
        </div>

        <div class="filter-section">
          <div class="filter-row">
            <div>难度</div>
            <div class="filter-buttons">
              <span class="star" onclick="setFilter('difficulty',1)">★</span>
              <span class="star" onclick="setFilter('difficulty',2)">★</span>
              <span class="star" onclick="setFilter('difficulty',3)">★</span>
            </div>
          </div>
          <div class="filter-row">
            <div>性别</div>
            <div class="filter-buttons">
              <button class="filter-btn" onclick="setFilter('gender','all')">全部</button>
              <button class="filter-btn" onclick="setFilter('gender','male')">男</button>
              <button class="filter-btn" onclick="setFilter('gender','female')">女</button>
              <button class="filter-btn" onclick="setFilter('gender','mixed')">混合</button>
            </div>
          </div>
          <div class="filter-row">
            <div>主题</div>
            <div class="filter-buttons">
              <button class="filter-btn" onclick="setFilter('tags','all')">全部</button>
              <button class="filter-btn" onclick="setFilter('tags','生活')">生活</button>
              <button class="filter-btn" onclick="setFilter('tags','商务')">商务</button>
            </div>
          </div>
          <button class="clear-filter" onclick="clearFilters()">清空筛选</button>
        </div>
      </div>

      <div class="ep-grid">
        ${filtered.map(ep => {
          const learned = learnStatus[ep.id] ? '<div class="ep-status">已学习</div>' : '';
          return `
            <div class="ep-card" onclick="goPlayer('${ep.id}')">
              <img src="${ep.cover}" class="ep-cover">
              <div class="ep-duration">${ep.duration}</div>
              ${learned}
              <div class="ep-info">
                <div class="ep-id">${ep.id}</div>
                <div class="ep-tags">
                  ${ep.tags.map(t => `<span class="ep-tag">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function setFilter(key, val) {
  filters[key] = val;
  showHome();
}

function clearFilters() {
  filters = { sort: "asc", difficulty: 0, gender: "all", tags: "all" };
  searchKeyword = "";
  showHome();
}

function toggleTheme() {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  showHome();
}

function goPlayer(id) {
  currentEp = episodes.find(e => e.id === id);
  learnStatus[id] = true;
  localStorage.setItem("learnStatus", JSON.stringify(learnStatus));
  renderPlayer();
}

function renderPlayer() {
  const ep = currentEp;
  app.innerHTML = `
    <div class="navbar">
      <div class="navbar-left">
        <button class="back-btn" onclick="showHome()">← 返回</button>
        <span>${ep.id}</span>
      </div>
      <div class="mode-tabs">
        <div class="mode-tab active" onclick="setMode('bilingual')">双语</div>
        <div class="mode-tab" onclick="setMode('english')">英文</div>
        <div class="mode-tab" onclick="setMode('chinese')">中文</div>
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
          <button onclick="restart()">重播</button>
        </div>
      </div>

      <div class="sub-section">
        ${ep.subs.map((s, idx) => `
          <div class="sub-item" onclick="jump(${s.time})">
            <div class="sub-en">${s.en}</div>
            <div class="sub-cn">${s.cn}</div>
          </div>
        `).join('')}

        <div class="vocab-panel">
          <h4>本集词汇</h4>
          ${ep.subs.flatMap(s => s.vocab || []).map(v => `
            <div class="vocab-item">
              <span>${v.word}</span>
              <span>${v.mean}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function setMode(m) {
  currentMode = m;
  renderPlayer();
}

function jump(t) {
  const v = document.getElementById("v");
  v.currentTime = t;
  v.play();
}

function play() { document.getElementById("v").play(); }
function pause() { document.getElementById("v").pause(); }
function restart() { const v = document.getElementById("v"); v.currentTime = 0; v.play(); }
