// ======================
// 1. 多用户账号配置（在这里加人）
// ======================
const users = [
  { username: "1", password: "123456" },
  { username: "2", password: "english123" },
  { username: "user1", password: "666666" },
  { username: "student", password: "study789" }
];

const app = document.getElementById("app");

// ======================
// 2. 语料库数据（你原来的）
// ======================
const episodes = [
  {
    id: "S01E01",
    title: "The Pilot · 第一季第一集",
    desc: "瑞秋逃婚登场，莫妮卡公寓初遇",
    duration: "22:00",
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
// 3. 页面初始化
// ======================
showLogin();

// ======================
// 4. 登录页面
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
// 5. 登录判断（已支持多账号）
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
// 6. 主页（剧集列表）
// ======================
function showHome() {
  const episodesHTML = episodes.map(ep => `
    <div class="episode-card" onclick="goToPlayer('${ep.id}')">
      <h3>${ep.id}</h3>
      <p>${ep.title}</p>
      <span class="episode-duration">${ep.duration}</span>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="home-container">
      <div class="home-header">
        <h2>📚 老友记全季语料库</h2>
        <p>精选地道口语，逐句拆解，沉浸式学习</p>
      </div>
      <div class="episodes-grid">
        ${episodesHTML}
      </div>
    </div>
  `;
}

// ======================
// 7. 播放页
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
// 8. 跟读功能
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
// 9. 练习判分
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
