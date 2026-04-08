const users = [
  { username: "1", password: "123456" },
  { username: "user1", password: "111111" }
];

const app = document.getElementById("app");
let theme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", theme);

// 剧集数据（带时间戳 + 彩色重点词）
const episodes = [
  {
    id: "S01E01",
    title: "S01E01  Pilot",
    video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    subtitles: [
      {
        en: '<span class="highlight-word">Well</span>, <span class="highlight-slang">look</span> who\'s here!',
        cn: "看看谁来了！",
        time: 1.0
      },
      {
        en: 'We were <span class="highlight-phrase">on a break</span>!',
        cn: "我们当时分手了！",
        time: 3.0
      }
    ]
  }
];

// 初始化
showLogin();

// 登录
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
  let u = document.getElementById("u").value;
  let p = document.getElementById("p").value;
  let ok = users.some(x => x.username === u && x.password === p);
  if (ok) showHome();
  else alert("账号或密码错误");
}

// 主页
function showHome() {
  let cards = episodes.map(ep => `
    <div class="ep-card" onclick="goPlayer('${ep.id}')">
      <div class="ep-cover"></div>
      <div class="ep-info">
        <div class="ep-title">${ep.id}</div>
        <div class="ep-desc">${ep.title}</div>
      </div>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="navbar">
      <div>English Lab</div>
      <button onclick="toggleTheme()">切换模式</button>
    </div>
    <div class="home-container">
      <h2>剧集列表</h2>
      <div class="ep-grid">${cards}</div>
    </div>
  `;
}

// 播放页（博主布局 + 全部功能）
function goPlayer(id) {
  let ep = episodes.find(x => x.id === id);
  if (!ep) return;

  let subs = ep.subtitles.map((s, i) => `
    <div class="subtitle-item" onclick="jump(${s.time})">
      <div class="subtitle-en">${s.en}</div>
      <div class="subtitle-cn">${s.cn}</div>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="navbar">
      <div class="navbar-left">
        <button class="back-btn" onclick="showHome()">← 返回主页</button>
        <span>${ep.id}</span>
      </div>
      <button onclick="toggleTheme()">切换模式</button>
    </div>

    <div class="player-layout">
      <div class="video-section">
        <div class="video-wrapper">
          <video id="v" src="${ep.video}" controls></video>
        </div>
        <div class="toolbar">
          <button onclick="play()">播放</button>
          <button onclick="pause()">暂停</button>
          <button onclick="restart()">重新播放</button>
        </div>
      </div>

      <div class="subtitle-section">
        ${subs}
      </div>
    </div>
  `;
}

// 点击字幕跳时间（你要的功能）
function jump(t) {
  let v = document.getElementById("v");
  if (v) {
    v.currentTime = t;
    v.play();
  }
}

// 视频控制
function play() { document.getElementById("v")?.play(); }
function pause() { document.getElementById("v")?.pause(); }
function restart() {
  let v = document.getElementById("v");
  v.currentTime = 0; v.play();
}

// 黑夜模式
function toggleTheme() {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
