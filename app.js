// 登录信息
const USER = "admin"
const PWD = "123456"

// 一开始显示登录页
showLogin()

// 登录页面
function showLogin() {
  app.innerHTML = `
    <h2>登录</h2>
    <input id="u" placeholder="账号"><br>
    <input id="p" type="password" placeholder="密码"><br>
    <button onclick="login()">登录</button>
  `
}

// 登录判断
function login() {
  let u = document.getElementById("u").value
  let p = document.getElementById("p").value
  if (u === USER && p === PWD) {
    showHome()
  } else {
    alert("账号密码错误")
  }
}

// 主页
function showHome() {
  app.innerHTML = `<h2>语料库列表</h2>`
}
