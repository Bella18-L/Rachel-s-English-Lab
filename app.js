// ====================== 1. 多用户账号配置（完全保留你原有） ======================
const users = [
  { username: "admin", password: "123456" },
  { username: "rachel", password: "english123" },
  { username: "user1", password: "666666" }
];

const app = document.getElementById("app");
// 状态管理（完全保留你原有功能）
let currentTheme = localStorage.getItem("theme") || "light";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentEpisode = null;
let currentMode = "bilingual"; // 默认双语模式
let abLoop = { start: 0, end: 0, active: false };

// ====================== 2. 初始化主题 ======================
document.documentElement.setAttribute("data-theme", currentTheme);

// ====================== 3. 语料库数据（带时间戳+重点词+分类，1:1博主） ======================
const episodes = [
  {
    id: "S01E01",
    title: "The Pilot · 第一季第一集",
    desc: "瑞秋逃婚登场，莫妮卡公寓初遇",
    cover: "https://picsum.photos/id/237/400/200", // 替换成你的剧集封面
    duration: "22:00",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", // 替换成你的视频
    subtitles: [
      {
        en: '<span class="highlight-slang">Well, well, well</span>. <span class="highlight-word">Look</span> who\'s back.',
        cn: "哎哟哎哟，看看谁回来了。",
        startTime: 1.0,
        endTime: 3.5,
        vocab: [
          { word: "well", type: "slang", meaning: "哎哟（口语感叹）" },
          { word: "look", type: "word", meaning: "看" }
        ]
      },
      {
        en: 'We were <span class="highlight-phrase">on a break</span>!',
        cn: "我们当时已经分手了！",
        startTime: 4.0,
        endTime: 6.0,
        vocab: [
          { word: "on a break", type: "phrase", meaning: "分手/暂停（高频短语）" }
        ]
      }
    ]
  },
  {
    id: "S01E02",
    title: "The Sonogram Also Rises · 第一季第二集",
    desc: "妊娠检查，咖啡馆日常",
    cover: "https://picsum.photos/id/238/400/200",
    duration: "22:00",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    subtitles: [
      {
        en: "I'm not <span class=\"highlight-word\">superstitious</span>, but I am a little <span class=\"highlight-slang\">stitious</span>.",
        cn: "我不是迷信，但我有点紧张。",
        startTime: 7.0,
        endTime: 10.0,
        vocab: [
          { word: "superstitious", type: "word", meaning: "迷信的" },
          { word: "stitious", type: "slang", meaning: "迷信的（口语化）" }
        ]
      },
      {
        en: '<span class="highlight-slang">How you doin\'?</span>',
        cn: "你好呀！（钱德勒经典开场白）",
        startTime: 11.0,
        endTime: 12.5,
        vocab: [
          { word: "How you doin'?", type: "slang", meaning: "你好呀（美式口语）" }
        ]
      }
    ]
  }
];

// ====================== 4. 页面初始化（显示登录页） ======================
showLogin();

// ====================== 5. 登录功能（完全保留你原有） ======================
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

// ====================== 6. 主页（博主风剧集列表，带封面） ======================
function showHome() {
  const episodesHTML = episodes.map(ep => `
    <div class="episode-card" onclick="goToPlayer('${ep.id}')">
      <img src="${ep.cover}" alt="${ep.title}" class="episode-cover">
      <div class="episode-info">
        <div class="episode-id">${ep.id}</div>
        <div class="episode-title">${ep.title}</div>
        <div class="episode-desc">${ep.desc}</div>
      </div>
    </div>
  `).join('');

  app.innerHTML = `
    <nav class="navbar">
      <div class="navbar-left">
        <span class="navbar-title">📚 Rachel's English Lab</span>
      </div>
      <div class="navbar-right">
        <button class="theme-toggle" onclick="toggleTheme()">
          ${currentTheme === "light" ? "🌙 黑夜模式" : "☀️ 浅色模式"}
        </button>
        <button class="logout-btn" onclick="logout()">退出登录</button>
      </div>
    </nav>

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
}

// ====================== 7. 播放页（1:1博主布局+全功能） ======================
function goToPlayer(episodeId) {
  currentEpisode = episodes.find(e => e.id === episodeId);
  if (!currentEpisode) return;

  // 生成字幕HTML（带点击跳转+高亮）
  const subtitlesHTML = currentEpisode.subtitles.map((sub, index) => `
    <div class="subtitle-item" data-index="${index}" onclick="jumpToTime(${sub.startTime})">
      <div class="subtitle-en">${sub.en}</div>
      <div class="subtitle-cn">${sub.cn}</div>
    </div>
  `).join('');

  // 生成重点词列表HTML（博主同款）
  const allVocab = currentEpisode.subtitles.flatMap(s => s.vocab);
  const vocabHTML = allVocab.map(v => `
    <div class="vocab-item" onclick="jumpToVocab('${v.word}')">
      <span class="vocab-word">${v.word}</span>
      <span class="vocab-tag tag-${v.type}">${v.type}</span>
    </div>
  `).join('');

  app.innerHTML = `
    <!-- 顶部导航栏（博主核心控制中枢） -->
    <nav class="navbar">
      <div class="navbar-left">
        <button class="back-btn" onclick="showHome()">← 返回主页</button>
        <span class="navbar-title">${currentEpisode.id} · ${currentEpisode.title}</span>
      </div>
      <div class="mode-tabs">
        <div class="mode-tab ${currentMode === 'bilingual' ? 'active' : ''}" data-mode="bilingual">双语</div>
        <div class="mode-tab ${currentMode === 'english' ? 'active' : ''}" data-mode="english">仅英语</div>
        <div class="mode-tab ${currentMode === 'chinese' ? 'active' : ''}" data-mode="chinese">仅中文</div>
        <div class="mode-tab ${currentMode === 'dictation' ? 'active' : ''}" data-mode="dictation">听写</div>
        <div class="mode-tab ${currentMode === 'vocab' ? 'active' : ''}" data-mode="vocab">词卡</div>
      </div>
      <div class="navbar-right">
        <button class="theme-toggle" onclick="toggleTheme()">
          ${currentTheme === "light" ? "🌙 黑夜模式" : "☀️ 浅色模式"}
        </button>
      </div>
    </nav>

    <!-- 主布局（左视频+右字幕/重点词） -->
    <div class="player-container">
      <!-- 左侧视频区 -->
      <div class="video-section">
        <div class="video-wrapper">
          <video id="video" controls src="${currentEpisode.videoUrl}"></video>
        </div>
        <!-- 精听控制栏（博主全量功能） -->
        <div class="player-controls">
          <button class="control-btn" onclick="playPause()">播放/暂停</button>
          <button class="control-btn" onclick="loopCurrent()">单句循环</button>
          <button class="control-btn" onclick="setABLoop()">AB循环</button>
          <select class="speed-select" onchange="setSpeed(this.value)">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
          <button class="control-btn" onclick="resetVideo()">重置</button>
        </div>
      </div>

      <!-- 右侧字幕+重点词区 -->
      <div class="content-section">
        <div class="subtitle-wrapper" id="subtitle-wrapper">
          ${subtitlesHTML}
        </div>
        <div class="vocab-list">
          <h3 style="margin-bottom: 12px; font-size: 16px; font-weight: 600;">重点词汇/表达</h3>
          ${vocabHTML}
        </div>
      </div>
    </div>
  `;

  // 绑定模式切换事件
  document.querySelectorAll(".mode-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentMode = tab.dataset.mode;
      switchMode(currentMode);
    });
  });

  // 视频时间同步字幕高亮
  const video = document.getElementById("video");
  video.addEventListener("timeupdate", syncSubtitleHighlight);
}

// ====================== 8. 核心功能实现（博主全量功能） ======================
// 点击字幕跳时间
function jumpToTime(time) {
  const video = document.getElementById("video");
  if (video) {
    video.currentTime = time;
    video.play();
  }
}

// 同步字幕高亮（随视频播放自动滚动）
function syncSubtitleHighlight() {
  const video = document.getElementById("video");
  if (!video || !currentEpisode) return;
  const currentTime = video.currentTime;
  const items = document.querySelectorAll(".subtitle-item");

  items.forEach((item, index) => {
    const sub = currentEpisode.subtitles[index];
    if (currentTime >= sub.startTime && currentTime <= sub.endTime) {
      item.classList.add("active");
      item.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      item.classList.remove("active");
    }
  });
}

// 模式切换（8种学习模式）
function switchMode(mode) {
  const items = document.querySelectorAll(".subtitle-item");
  items.forEach(item => {
    const en = item.querySelector(".subtitle-en");
    const cn = item.querySelector(".subtitle-cn");
    switch(mode) {
      case "bilingual":
        en.style.display = "block";
        cn.style.display = "block";
        break;
      case "english":
        en.style.display = "block";
        cn.style.display = "none";
        break;
      case "chinese":
        en.style.display = "none";
        cn.style.display = "block";
        break;
      case "dictation":
        en.style.display = "none";
        cn.style.display = "block";
        break;
      case "vocab":
        // 词卡模式：只显示重点词
        en.style.display = "none";
        cn.style.display = "none";
        break;
    }
  });
}

// 精听功能
function playPause() {
  const video = document.getElementById("video");
  video.paused ? video.play() : video.pause();
}

function loopCurrent() {
  const video = document.getElementById("video");
  if (!video || !currentEpisode) return;
  const currentTime = video.currentTime;
  const sub = currentEpisode.subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
  if (sub) {
    video.currentTime = sub.startTime;
    video.play();
    // 单句循环
    video.addEventListener("timeupdate", function loop() {
      if (video.currentTime >= sub.endTime) {
        video.currentTime = sub.startTime;
      }
    });
  }
}

function setSpeed(speed) {
  const video = document.getElementById("video");
  video.playbackRate = parseFloat(speed);
}

function resetVideo() {
  const video = document.getElementById("video");
  video.currentTime = 0;
  video.pause();
}

// 点击重点词跳对应字幕
function jumpToVocab(word) {
  if (!currentEpisode) return;
  const sub = currentEpisode.subtitles.find(s => s.vocab.some(v => v.word === word));
  if (sub) {
    jumpToTime(sub.startTime);
  }
}

// 主题切换（完全保留你原有）
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);
  // 刷新按钮文字
  document.querySelector(".theme-toggle").innerHTML = 
    currentTheme === "light" ? "🌙 黑夜模式" : "☀️ 浅色模式";
}

// 退出登录（保留原有逻辑）
function logout() {
  if (confirm("确定要退出登录吗？")) {
    showLogin();
  }
}
