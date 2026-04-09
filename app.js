const app = document.getElementById('app')
const loading = document.getElementById('loading')

let theme = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', theme)

let users = []
let episodes = []
let searchKeyword = ''

let filters = {
  sort: 'asc',
  difficulty: 0,
  gender: 'all',
  tags: 'all'
}

async function loadAll() {
  const u = await fetch('config/users.json')
  users = await u.json()
  const e = await fetch('config/videos.json')
  episodes = await e.json()
  loading.remove()
  showLogin()
}

function showLogin() {
  app.innerHTML = `
    <div class="login-box">
      <h2>登录</h2>
      <input id="user" placeholder="账号">
      <input id="pwd" type="password" placeholder="密码">
      <button onclick="doLogin()">登录</button>
    </div>
  `
}

function doLogin() {
  const u = document.getElementById('user').value
  const p = document.getElementById('pwd').value
  const ok = users.some(x => x.username === u && x.password === p)
  if (ok) showHome()
  else alert('账号或密码错误')
}

function setSearch(v) {
  searchKeyword = v.toLowerCase().trim()
  showHome()
}

function showHome() {
  let list = [...episodes]
  if (searchKeyword) {
    list = list.filter(ep => ep.subs.some(s => s.en.toLowerCase().includes(searchKeyword)))
  }
  app.innerHTML = `
    <div class="navbar">
      <div>英语语料库</div>
      <div style="display:flex;gap:12px;">
        <input class="search-input" placeholder="搜索单词..." oninput="setSearch(this.value)">
        <button class="theme-btn" onclick="toggleTheme()">切换模式</button>
      </div>
    </div>
    <div class="home-container">
      <div class="home-sidebar">
        <div class="stat-item"><span>总期数</span><span>${episodes.length}</span></div>
        <div class="filter-section">
          <div class="filter-row"><div>难度</div></div>
          <div class="filter-buttons">
            <span class="star" onclick="setFilter('difficulty',1)">★</span>
            <span class="star" onclick="setFilter('difficulty',2)">★</span>
            <span class="star" onclick="setFilter('difficulty',3)">★</span>
          </div>
          <div class="filter-row"><div>性别</div></div>
          <div class="filter-buttons">
            <button class="filter-btn" onclick="setFilter('gender','all')">全部</button>
            <button class="filter-btn" onclick="setFilter('gender','female')">女</button>
            <button class="filter-btn" onclick="setFilter('gender','male')">男</button>
          </div>
          <button class="clear-filter" onclick="clearFilter()">清空筛选</button>
        </div>
      </div>
      <div class="ep-grid">
        ${list.map(ep => `
          <div class="ep-card" onclick="goPlay('${ep.id}')">
            <img src="${ep.cover}" class="ep-cover">
            <div class="ep-info">
              <div class="ep-id">${ep.id}</div>
              ${ep.tags.map(t => `<span class="ep-tag">${t}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function setFilter(k, v) {
  filters[k] = v
  showHome()
}
function clearFilter() {
  filters = { sort: 'asc', difficulty: 0, gender: 'all', tags: 'all' }
  searchKeyword = ''
  showHome()
}
function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  showHome()
}
function goPlay(id) {
  const ep = episodes.find(x => x.id === id)
  app.innerHTML = `
    <div class="navbar">
      <button onclick="showHome()">返回</button>
      <h3>${ep.title}</h3>
    </div>
    <div class="player-layout">
      <div class="video-section">
        <div class="video-box"><video src="${ep.video}" controls></video></div>
        <div class="controls">
          <button onclick="prevSub()">上一句</button>
          <button onclick="nextSub()">下一句</button>
        </div>
      </div>
      <div class="sub-section">
        ${ep.subs.map((s,i) => `
          <div class="sub-item" onclick="jump(${s.time})">
            <div>${s.en}</div>
            <div style="color:#888">${s.cn}</div>
          </div>
        `).join('')}
        <div class="vocab-panel">
          ${ep.subs.flatMap(s => s.vocab || []).map(v => `
            <div class="vocab-item">
              <span>${v.word}</span>
              <span>${v.mean}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}
function jump(t) {
  const v = document.querySelector('video')
  v.currentTime = t
  v.play()
}
function prevSub(){}
function nextSub(){}

loadAll()
