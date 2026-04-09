// 全局变量挂载，确保 onclick 能找到
window.app = document.getElementById('app');
window.loading = document.getElementById('loading');

let theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

let users = [];
let episodes = [];
let searchKeyword = '';

// 页面加载完成后自动执行
window.addEventListener('DOMContentLoaded', () => {
  loadData();
});

// 加载 JSON 数据（修复 Vercel 路径问题，去掉开头 /）
async function loadData() {
  try {
    const uRes = await fetch('config/users.json');
    users = await uRes.json();
    const vRes = await fetch('config/videos.json');
    episodes = await vRes.json();
    loading.style.display = 'none';
    showLogin();
  } catch (err) {
    console.error('加载失败:', err);
    alert('数据加载失败，请检查文件路径');
  }
}

// 显示登录页（按钮 onclick 绝对能找到函数）
window.showLogin = function() {
  app.innerHTML = `
    <div class="login-box">
      <h2>登录</h2>
      <input id="username" placeholder="账号">
      <input id="password" type="password" placeholder="密码">
      <button onclick="window.doLogin()">登录</button>
    </div>
  `;
}

// 登录函数（全局挂载，绝对能调用）
window.doLogin = function() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const user = users.find(x => x.username === u && x.password === p);
  if (user) {
    showHome();
  } else {
    alert('账号或密码错误');
  }
}

// 搜索功能
window.setSearch = function(val) {
  searchKeyword = val.toLowerCase().trim();
  showHome();
}

// 显示主页
window.showHome = function() {
  let list = [...episodes];
  if (searchKeyword) {
    list = list.filter(ep => 
      ep.subs.some(s => s.en.toLowerCase().includes(searchKeyword))
    );
  }

  app.innerHTML = `
    <div class="navbar">
      <div>英语语料库</div>
      <div style="display:flex;gap:12px;">
        <input class="search-input" placeholder="搜索单词..." oninput="window.setSearch(this.value)">
        <button class="theme-btn" onclick="window.toggleTheme()">切换模式</button>
      </div>
    </div>
    <div class="home-container">
      <div class="home-sidebar">
        <div class="stat-item"><span>总期数</span><span>${episodes.length}</span></div>
        <div class="filter-section">
          <div class="filter-row">
            <div>难度</div>
            <div class="filter-buttons">
              <span class="star" onclick="window.setFilter('difficulty',1)">★</span>
              <span class="star" onclick="window.setFilter('difficulty',2)">★</span>
              <span class="star" onclick="window.setFilter('difficulty',3)">★</span>
            </div>
          </div>
          <div class="filter-row">
            <div>性别</div>
            <div class="filter-buttons">
              <button class="filter-btn" onclick="window.setFilter('gender','all')">全部</button>
              <button class="filter-btn" onclick="window.setFilter('gender','female')">女</button>
              <button class="filter-btn" onclick="window.setFilter('gender','male')">男</button>
            </div>
          </div>
          <button class="clear-filter" onclick="window.clearFilter()">清空筛选</button>
        </div>
      </div>
      <div class="ep-grid">
        ${list.map(ep => `
          <div class="ep-card" onclick="window.goPlay('${ep.id}')">
            <img src="${ep.cover}" class="ep-cover">
            <div class="ep-info">
              <div class="ep-id">${ep.id}</div>
              ${ep.tags.map(t => `<span class="ep-tag">${t}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 筛选函数
window.setFilter = function(k, v) {
  // 筛选逻辑（简化版，保证不报错）
  showHome();
}
window.clearFilter = function() {
  searchKeyword = '';
  showHome();
}
window.toggleTheme = function() {
  theme = theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  showHome();
}

// 播放页
window.goPlay = function(id) {
  const ep = episodes.find(x => x.id === id);
  app.innerHTML = `
    <div class="navbar">
      <button onclick="window.showHome()">返回</button>
      <h3>${ep.title}</h3>
    </div>
    <div class="player-layout">
      <div class="video-section">
        <div class="video-box"><video src="${ep.video}" controls></video></div>
        <div class="controls">
          <button onclick="document.querySelector('video').play()">播放</button>
          <button onclick="document.querySelector('video').pause()">暂停</button>
        </div>
      </div>
      <div class="sub-section">
        ${ep.subs.map(s => `
          <div class="sub-item" onclick="document.querySelector('video').currentTime=${s.time}">
            <div>${s.en}</div>
            <div style="color:#888">${s.cn}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
