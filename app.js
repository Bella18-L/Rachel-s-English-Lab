// ======================
// 1. 多用户账号配置（完全保留你原来的）
// ======================
const users = [
  { username: "1", password: "123456" },
  { username: "rachel", password: "english123" },
  { username: "user1", password: "666666" },
  { username: "student", password: "study789" }
];

const app = document.getElementById("app");
// 收藏、主题状态（完全保留你原来的功能）
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentTheme = localStorage.getItem("theme") || "light";

// ======================
// 2. 语料库数据（加封面图、标签，适配博主风卡片）
// ======================
const episodes = [
  {
    id: "S01E01",
    title: "The Pilot · 第一季第一集",
    desc: "瑞秋逃婚登场，莫妮卡公寓初遇",
    duration: "22:00",
    cover: "https://picsum.photos/id/237/400/200", // 替换成你的剧集封面
    tags: ["S01", "初级", "日常"],
    videoUrl: "https://example.com/S01E01.mp4",
    subtitles: [
      { en: "Well, well, well. Look who's back.", cn: "哎哟哎哟，看看谁回来了。" },
      { en: "We were on a break!", cn: "我们当时已经分手了！" }
    ],
    practice: {
      question: "We were on a ______!",
      answer: "break",
      hint: "分手/暂停"
    }
  },
  {
    id: "S01E02",
    title: "The Sonogram Also Rises · 第一季第二集",
    desc: "妊娠检查，咖啡馆日常",
    duration: "22:00",
    cover: "https://picsum.photos/id/238/400/200",
    tags: ["S01", "初级", "日常"],
    videoUrl: "https://example.com/S01E02.mp4",
    subtitles: [
      { en: "I'm not superstitious, but I am a little stitious.", cn: "我不是迷信，但我有点紧张。" },
      { en: "How you doin'?", cn: "你好呀！（钱德勒经典开场白）" }
    ],
    practice: {
      question: "I'm not superstitious, but I am a little ______.",
      answer: "stitious",
      hint: "迷信的（口语化表达）"
    }
  }
];

// ======================
// 3. 初始化主题（完全保留你原来的黑夜模式）
// ======================
document.documentElement.setAttribute("data-theme", currentTheme);

// ======================
// 4. 页面初始化（显示登录页）
// ======================
showLogin();

// ======================
// 5. 登录页面（完全保留你原来的逻辑）
// ======================
function showLogin() {
  app.innerHTML = `
    <div class="login-container">
      <h1>Rachel's English Lab</h1>
      <input type="text" id="username" placeholder="账号">
      <input type="password" id="password" placeholder="密码">
      <button onclick="login()">登录进入学习</button>
    </div>
  `;
}

// ======================
// 6. 登录判断（多账号，完全保留）
// ======================
function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  const foundUser = users.find(user => 
    user.username === u && user.password === p
  );

  if (foundUser) {
    showHome();
  } else {
    alert("账号或密码错误，请重试！");
  }
}

// ======================
// 7. 主页（博主风UI + 收藏功能 + 主题切换，完全保留原有逻辑）
// ======================
function showHome() {
  // 生成标签筛选栏
  const tags = [...new Set(episodes.flatMap(ep => ep.tags))];
  const filterHTML = `
    <div class="filter-bar">
      <div class="filter-tag active" data-filter="all">全部</div>
      ${tags.map(tag => `<div class="filter-tag" data-filter="${tag}">${tag}</div>`).join('')}
    </div>
  `;

  // 生成剧集卡片（带收藏按钮）
  const episodesHTML = episodes.map(ep => {
    const isFavorite = favorites.includes(ep.id);
    return `
      <div class="episode-card" onclick="goToPlayer('${ep.id}')">
        <img src="${ep.cover}" alt="${ep.title}" class="episode-cover">
        <div class="episode-content">
          <div class="episode-header">
            <span class="episode-id">${ep.id}</span>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                    onclick="toggleFavorite('${ep.id}', event)" 
                    title="收藏">
              ${isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          <h3 class="episode-title">${ep.title}</h3>
          <p class="episode-desc">${ep.desc}</p>
          <div class="episode-footer">
            <div class="episode-tags">
              ${ep.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <span class="episode-duration">${ep.duration}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  app.innerHTML = `
    <!-- 顶部导航栏（博主风，加主题切换、退出登录） -->
    <nav class="navbar">
      <div class="navbar-brand">📚 Rachel's English Lab</div>
      <div class="navbar-search">
        <input type="text" id="search-input" placeholder="搜索剧集、单词...">
      </div>
      <div class="navbar-actions">
        <button class="theme-toggle" onclick="toggleTheme()">
          ${currentTheme === "light" ? "🌙 黑夜模式" : "☀️ 浅色模式"}
        </button>
        <button class="logout-btn" onclick="logout()">退出登录</button>
      </div>
    </nav>

    ${filterHTML}

    <div class="home-container">
      <div class="home-header">
        <h2>老友记全季语料库</h2>
        <p>精选地道口语，逐句拆解，沉浸式学习</p>
      </div>
      <div class="episodes-grid">
        ${episodesHTML}
      </div>
    </div>
  `;

  // 绑定筛选事件（博主风分类功能）
  document.querySelectorAll(".filter-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      document.querySelectorAll(".filter-tag").forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      // 这里可后续加筛选逻辑，完全不影响现有功能
    });
  });
}

// ======================
// 8. 收藏功能（完全保留你原来的，适配博主风UI）
// ======================
function toggleFavorite(episodeId, event) {
  event.stopPropagation(); // 阻止点击收藏触发卡片跳转
  if (favorites.includes(episodeId)) {
    favorites = favorites.filter(id => id !== episodeId);
  } else {
    favorites.push(episodeId);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  // 刷新按钮状态
  const btn = event.target;
  if (favorites.includes(episodeId)) {
    btn.classList.add("active");
    btn.innerHTML = "❤️";
  } else {
    btn.classList.remove("active");
    btn.innerHTML = "🤍";
  }
}

// ======================
// 9. 主题切换（完全保留你原来的黑夜模式）
// ======================
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);
  // 刷新按钮文字
  document.querySelector(".theme-toggle").innerHTML = 
    currentTheme === "light" ? "🌙 黑夜模式" : "☀️ 浅色模式";
}

// ======================
// 10. 退出登录（保留原有逻辑）
// ======================
function logout() {
  if (confirm("确定要退出登录吗？")) {
    showLogin();
  }
}

// ======================
// 11. 播放页（100%保留你所有功能，升级博主风UI）
// ======================
function goToPlayer(episodeId) {
  const ep = episodes.find(e => e.id === episodeId);
  if (!ep) return;

  const subtitlesHTML = ep.subtitles.map(sub => `
    <div class="subtitle-item">
      <div class="subtitle-en">${sub.en}</div>
      <div class="subtitle-cn">${sub.cn}</div>
    </div>
  `).join('');

  app.innerHTML = `
    <nav class="navbar">
      <div class="navbar-brand">📚 Rachel's English Lab</div>
      <div class="navbar-actions">
        <button class="theme-toggle" onclick="toggleTheme()">
          ${currentTheme === "light" ? "🌙 黑夜模式" : "☀️ 浅色模式"}
        </button>
        <button class="logout-btn" onclick="logout()">退出登录</button>
      </div>
    </nav>

    <div class="player-container">
      <div class="player-header">
        <h2>${ep.title}</h2>
        <p style="color: var(--text-secondary);">${ep.desc}</p>
      </div>

      <video id="video" controls src="${ep.videoUrl}"></video>

      <div class="subtitle-section">
        <h3>📝 逐句字幕</h3>
        ${subtitlesHTML}
      </div>

      <div class="shadowing-section">
        <h3>🎙️ 影子跟读</h3>
        <div class="shadowing-buttons">
          <button onclick="playShadow()">播放跟读</button>
          <button onclick="recordAudio()">录音对比</button>
          <button onclick="resetVideo()">重置视频</button>
        </div>
      </div>

      <div class="practice-section">
        <h3>✍️ 填空练习</h3>
        <div class="practice-item">
          <label>${ep.practice.question.replace("______", `<input type="text" id="practice-input" placeholder="${ep.practice.hint}">`)}</label>
          <button onclick="checkAnswer('${ep.practice.answer}')">检查答案</button>
          <div id="practice-result" class="practice-result"></div>
        </div>
      </div>
    </div>
  `;
}

// ======================
// 12. 跟读功能（完全保留你原来的）
// ======================
function playShadow() {
  const video = document.getElementById("video");
  if (video) video.play();
}

function recordAudio() {
  alert("录音功能已就绪，点击后可开始录制对比发音~");
}

function resetVideo() {
  const video = document.getElementById("video");
  if (video) {
    video.currentTime = 0;
    video.pause();
  }
}

// ======================
// 13. 练习判分（完全保留你原来的）
// ======================
function checkAnswer(correctAnswer) {
  const input = document.getElementById("practice-input").value.trim().toLowerCase();
  const resultEl = document.getElementById("practice-result");

  if (input === correctAnswer.toLowerCase()) {
    resultEl.innerHTML = `<span class="result-correct">✅ 正确！太棒了！</span>`;
  } else {
    resultEl.innerHTML = `<span class="result-wrong">❌ 错误，正确答案是：${correctAnswer}</span>`;
  }
}
