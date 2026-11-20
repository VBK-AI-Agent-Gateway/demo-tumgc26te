/* ===== 星际穿越 · 3D 无尽跑酷 (自包含, 无外部依赖) =====
   自研透视投影 3D 渲染: 星星/跑道/飞船/障碍全部经相机投影到 2D Canvas 绘制
*/
(function () {
  'use strict';

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var overlay = document.getElementById('overlay');
  var titleEl = document.getElementById('title');
  var tagEl = document.getElementById('tag');
  var keysEl = document.getElementById('keys');
  var finalEl = document.getElementById('final');
  var btn = document.getElementById('btn');
  var bestEl = document.getElementById('best');
  var scoreEl = document.getElementById('score');
  var distEl = document.getElementById('dist');
  var spdEl = document.getElementById('spd');
  var energyEl = document.getElementById('energy');
  var flashEl = document.getElementById('flash');

  var W = 0, H = 0, DPR = 1, CX = 0, CY = 0, FOCAL = 0;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W / 2; CY = H * 0.56;
    FOCAL = Math.max(W, H) * 0.9;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---------- 相机 ----------
  var cam = { x: 0, y: 5.0, z: 11.0, pitch: -0.20 };

  // 世界坐标(相对相机) → 屏幕坐标; 返回 null 表示在相机后方/太远
  function project(wx, wy, wz) {
    var dx = wx - cam.x, dy = wy - cam.y, dz = wz - cam.z;
    // 绕 X 轴俯仰
    var c = Math.cos(cam.pitch), s = Math.sin(cam.pitch);
    var ry = dy * c - dz * s;
    var rz = dy * s + dz * c;
    if (rz > -1.2) return null;              // 在相机近处/后方
    var scale = FOCAL / -rz;
    return { x: CX + dx * scale, y: CY + ry * scale, s: scale, z: -rz };
  }

  // ---------- 世界参数 ----------
  var TRACK_W = 15;
  var state = {
    running: false, dead: false,
    x: 0, targetX: 0, speed: 26, baseSpeed: 26, maxSpeed: 80,
    score: 0, distance: 0, energy: 100,
    invuln: 0, shake: 0, t: 0
  };
  var keys = {};
  var best = parseInt(localStorage.getItem('star_runner_best') || '0', 10);
  bestEl.textContent = best > 0 ? ('最高分 ' + best) : '';

  // ---------- 星空 ----------
  var stars = [];
  (function () {
    for (var i = 0; i < 420; i++) {
      stars.push({
        x: (Math.random() * 2 - 1) * 130,
        y: 6 + Math.random() * 90,
        z: -Math.random() * 320,
        c: ['#ffffff', '#9fd8ff', '#ffd7a0', '#c9a8ff'][(Math.random() * 4) | 0],
        r: 0.6 + Math.random() * 1.4
      });
    }
  })();

  // ---------- 障碍 / 能量块 ----------
  var hazards = [], orbs = [];
  function spawnHazard() {
    hazards.push({
      x: (Math.random() * 2 - 1) * (TRACK_W - 1.8),
      y: 0.9 + Math.random() * 2.2,
      z: -130 - Math.random() * 60,
      r: 0.85 + Math.random() * 0.95,
      rot: Math.random() * 6.28,
      spin: (Math.random() - 0.5) * 3.0
    });
  }
  function spawnOrb() {
    orbs.push({
      x: (Math.random() * 2 - 1) * (TRACK_W - 1.8),
      y: 1.1 + Math.random() * 1.7,
      z: -130 - Math.random() * 60,
      rot: Math.random() * 6.28
    });
  }

  function reset() {
    hazards.length = 0; orbs.length = 0;
    state.running = true; state.dead = false;
    state.x = 0; state.targetX = 0; state.speed = state.baseSpeed;
    state.score = 0; state.distance = 0; state.energy = 100;
    state.invuln = 0; state.shake = 0; state.t = 0;
    for (var i = 0; i < 8; i++) spawnHazard();
    for (var j = 0; j < 10; j++) spawnOrb();
    updateHUD();
  }
  function startGame() { reset(); overlay.classList.add('hide'); }

  function die() {
    if (state.dead) return;
    state.dead = true; state.running = false;
    flashEl.style.opacity = '1';
    setTimeout(function () { flashEl.style.opacity = '0'; }, 220);
    if (state.score > best) { best = Math.floor(state.score); localStorage.setItem('star_runner_best', String(best)); }
    titleEl.textContent = '任务结束';
    tagEl.textContent = 'SHIP DESTROYED';
    keysEl.style.display = 'none';
    finalEl.style.display = 'block';
    finalEl.innerHTML = '本次得分<b>' + Math.floor(state.score) + '</b>里程 ' + Math.floor(state.distance) + ' m';
    btn.textContent = '再来一次';
    bestEl.textContent = best > 0 ? ('最高分 ' + best) : '';
    overlay.classList.remove('hide');
  }

  // ---------- 输入 ----------
  window.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
    if ((e.code === 'Space' || e.code === 'Enter') && !state.running) startGame();
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  btn.addEventListener('click', startGame);

  var touchX = null;
  function pmove(px) {
    if (touchX === null) return;
    var lim = TRACK_W - 1.6;
    state.targetX = Math.max(-lim, Math.min(lim, state.targetX + (px - touchX) / (W * 0.14)));
    touchX = px;
  }
  canvas.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchmove', function (e) { pmove(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', function () { touchX = null; });
  canvas.addEventListener('mousedown', function (e) { touchX = e.clientX; });
  window.addEventListener('mousemove', function (e) { if (touchX !== null) pmove(e.clientX); });
  window.addEventListener('mouseup', function () { touchX = null; });

  function updateHUD() {
    scoreEl.textContent = Math.floor(state.score);
    distEl.textContent = Math.floor(state.distance);
    spdEl.textContent = (state.speed / state.baseSpeed).toFixed(1);
    energyEl.style.width = Math.max(0, state.energy) + '%';
    energyEl.style.background = state.energy < 35
      ? 'linear-gradient(90deg,#ff6a6a,#ffb36b)'
      : 'linear-gradient(90deg,#4ef0ff,#66ffb2)';
  }

  // ---------- 绘制工具 ----------
  function poly(pts, fill, stroke, lw) {
    if (pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
  }

  // 障碍: 3D 二十面体近似(八面体轮廓 + 内部线)
  function drawHazard(h) {
    var top = project(h.x, h.y + h.r, h.z);
    var bot = project(h.x, h.y - h.r, h.z);
    var lft = project(h.x - h.r, h.y, h.z);
    var rgt = project(h.x + h.r, h.y, h.z);
    var mid = project(h.x, h.y, h.z);
    if (!top || !bot || !lft || !rgt || !mid) return;
    var g = ctx.createRadialGradient(mid.x, mid.y, 1, mid.x, mid.y, Math.max(4, (rgt.x - lft.x) * 0.6));
    g.addColorStop(0, '#ff8a9c'); g.addColorStop(0.5, '#ff2d4d'); g.addColorStop(1, '#8c0018');
    poly([top, rgt, bot, lft], g, '#ff5c78', 1.5);
    ctx.strokeStyle = 'rgba(255,200,210,.55)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y); ctx.lineTo(bot.x, bot.y);
    ctx.moveTo(lft.x, lft.y); ctx.lineTo(rgt.x, rgt.y);
    ctx.stroke();
  }

  // 能量块: 3D 八面体(菱形)
  function drawOrb(o) {
    var top = project(o.x, o.y + 0.62, o.z);
    var bot = project(o.x, o.y - 0.62, o.z);
    var lft = project(o.x - 0.62, o.y, o.z);
    var rgt = project(o.x + 0.62, o.y, o.z);
    if (!top || !bot || !lft || !rgt) return;
    ctx.save();
    ctx.shadowColor = '#4ef0ff'; ctx.shadowBlur = 16;
    poly([top, rgt, bot, lft], 'rgba(78,240,255,.85)', '#bff6ff', 1.5);
    poly([top, lft, bot, rgt], 'rgba(160,240,255,.35)', null, 0);
    ctx.restore();
  }

  // 跑道: 透视梯形网格
  function drawTrack() {
    // 主跑道面
    var farL = project(-TRACK_W, 0, -150), farR = project(TRACK_W, 0, -150);
    var nearL = project(-TRACK_W, 0, 8), nearR = project(TRACK_W, 0, 8);
    if (farL && farR && nearL && nearR) {
      var g = ctx.createLinearGradient(0, farL.y, 0, nearL.y);
      g.addColorStop(0, 'rgba(19,26,58,.15)');
      g.addColorStop(1, 'rgba(30,40,90,.75)');
      poly([farL, farR, nearR, nearL], g, null, 0);
      // 左右发光护栏
      ctx.strokeStyle = 'rgba(123,92,255,.9)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(farL.x, farL.y); ctx.lineTo(nearL.x, nearL.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,94,199,.9)';
      ctx.beginPath(); ctx.moveTo(farR.x, farR.y); ctx.lineTo(nearR.x, nearR.y); ctx.stroke();
    }
    // 横向网格线(跑动感)
    var off = (state.distance % 6);
    for (var i = 0; i < 26; i++) {
      var z = 8 - i * 6 - off;
      var L = project(-TRACK_W, 0, z), R = project(TRACK_W, 0, z);
      if (!L || !R) continue;
      var a = 0.42 * (1 - i / 26);
      ctx.strokeStyle = 'rgba(47,107,255,' + a + ')'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(R.x, R.y); ctx.stroke();
    }
    // 中央光带
    var c1 = project(-0.3, 0, 8), c2 = project(0.3, 0, 8);
    var c3 = project(0.3, 0, -150), c4 = project(-0.3, 0, -150);
    if (c1 && c2 && c3 && c4) {
      ctx.save(); ctx.shadowColor = '#4ef0ff'; ctx.shadowBlur = 14;
      poly([c1, c2, c3, c4], 'rgba(78,240,255,.35)', null, 0); ctx.restore();
    }
  }

  // 飞船(相对相机固定在近处, 只做左右/倾斜)
  function drawShip() {
    var sx = CX + (state.x - cam.x) * (FOCAL / 11.5);
    var sy = CY + (state.y - cam.y + 1.6) * (FOCAL / 11.5);
    var sc = (FOCAL / 11.5) * 0.55;
    var tilt = -(state.targetX - state.x) * 0.4;

    ctx.save();
    ctx.translate(sx, sy); ctx.rotate(tilt * 0.5);
    // 引擎光焰
    var fl = 0.8 + Math.sin(state.t * 24) * 0.22 + (state.speed / state.maxSpeed) * 0.5;
    ctx.save(); ctx.shadowColor = '#4ef0ff'; ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(139,233,255,.9)';
    ctx.beginPath();
    ctx.moveTo(-0.9 * sc, 0.9 * sc);
    ctx.lineTo(0.9 * sc, 0.9 * sc);
    ctx.lineTo(0, (1.4 + fl) * sc * 1.5);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // 机翼
    ctx.fillStyle = '#dfe9ff';
    ctx.beginPath();
    ctx.moveTo(-2.6 * sc, 0.5 * sc);
    ctx.lineTo(2.6 * sc, 0.5 * sc);
    ctx.lineTo(1.5 * sc, 0.95 * sc);
    ctx.lineTo(-1.5 * sc, 0.95 * sc);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8fb6ff'; ctx.lineWidth = 1.5; ctx.stroke();
    // 机身
    var bg = ctx.createLinearGradient(0, -1.6 * sc, 0, 0.9 * sc);
    bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.5, '#cfdcff'); bg.addColorStop(1, '#7f93c9');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(0, -1.7 * sc);
    ctx.quadraticCurveTo(0.85 * sc, -0.9 * sc, 0.7 * sc, 0.6 * sc);
    ctx.lineTo(-0.7 * sc, 0.6 * sc);
    ctx.quadraticCurveTo(-0.85 * sc, -0.9 * sc, 0, -1.7 * sc);
    ctx.closePath(); ctx.fill();
    // 驾驶舱
    ctx.save(); ctx.shadowColor = '#4ef0ff'; ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(78,240,255,.95)';
    ctx.beginPath(); ctx.ellipse(0, -0.75 * sc, 0.4 * sc, 0.52 * sc, 0, 0, 6.29); ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // ---------- 主循环 ----------
  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    state.t += dt;

    if (state.running) {
      state.speed = Math.min(state.maxSpeed, state.baseSpeed + state.distance * 0.035);

      var kx = 0;
      if (keys.KeyA || keys.ArrowLeft) kx -= 1;
      if (keys.KeyD || keys.ArrowRight) kx += 1;
      if (kx !== 0) state.targetX += kx * 17 * dt;
      if (keys.Space) { state.speed = Math.min(state.maxSpeed, state.speed + 46 * dt); state.energy -= 26 * dt; }
      if (state.energy <= 0) { state.energy = 0; state.speed = Math.max(state.baseSpeed, state.speed - 40 * dt); }

      var lim = TRACK_W - 1.6;
      state.targetX = Math.max(-lim, Math.min(lim, state.targetX));
      state.x += (state.targetX - state.x) * Math.min(1, dt * 11);
      state.distance += state.speed * dt;
      state.score += state.speed * dt * 0.55;

      // 相机轻微跟随 + 抖动
      state.shake = Math.max(0, state.shake - dt * 1.3);
      var shk = state.shake * 6;
      cam.x += (state.x * 0.5 - cam.x) * Math.min(1, dt * 4);
      cam.y = 5.0 + Math.sin(state.t * 1.5) * 0.08 + (Math.random() - 0.5) * shk * 0.15;

      // 障碍推进
      for (var i = hazards.length - 1; i >= 0; i--) {
        var h = hazards[i];
        h.z += state.speed * dt;
        h.rot += h.spin * dt;
        if (h.z > 6) { hazards.splice(i, 1); spawnHazard(); continue; }
        var dx = h.x - state.x, dz = h.z, dy = h.y - 1.4;
        if (state.invuln <= 0 && dx * dx + dz * dz < (h.r + 0.7) * (h.r + 0.7) && Math.abs(dy) < 1.6) die();
      }
      // 能量块推进
      for (var k = orbs.length - 1; k >= 0; k--) {
        var o = orbs[k];
        o.z += state.speed * dt; o.rot += dt * 2.4;
        if (o.z > 6) { orbs.splice(k, 1); spawnOrb(); continue; }
        var ox = o.x - state.x, oz = o.z, oy = o.y - 1.4;
        if (ox * ox + oz * oz < 1.9 * 1.9 && Math.abs(oy) < 1.7) {
          state.energy = Math.min(100, state.energy + 26); state.score += 55;
          orbs.splice(k, 1); spawnOrb();
        }
      }
      if (Math.abs(state.x) > TRACK_W - 0.9) { state.energy -= 30 * dt; state.shake = 0.4; }
      if (state.energy <= 0 && Math.abs(state.x) > TRACK_W - 0.9) die();

      if (state.invuln > 0) { state.invuln -= dt; }
      updateHUD();
    }

    // ---------- 渲染 ----------
    ctx.clearRect(0, 0, W, H);
    // 背景渐变
    var bg = ctx.createRadialGradient(CX, CY * 0.7, 40, CX, CY, Math.max(W, H));
    bg.addColorStop(0, '#101a44'); bg.addColorStop(0.55, '#080c22'); bg.addColorStop(1, '#04050e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // 星星
    for (var si = 0; si < stars.length; si++) {
      var st = stars[si];
      var p = project(st.x, st.y, st.z);
      if (!p) continue;
      ctx.globalAlpha = Math.min(1, 240 / p.z);
      ctx.fillStyle = st.c;
      var rr = Math.max(0.4, st.r * (p.s / (FOCAL / 11.5)) * 0.9);
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.29); ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawTrack();

    // 远景障碍/能量块按远→近排序
    var items = [];
    for (var a = 0; a < hazards.length; a++) items.push({ k: 'h', o: hazards[a], z: hazards[a].z });
    for (var b = 0; b < orbs.length; b++) items.push({ k: 'o', o: orbs[b], z: orbs[b].z });
    items.sort(function (p, q) { return p.z - q.z; });
    for (var it = 0; it < items.length; it++) {
      if (items[it].k === 'h') drawHazard(items[it].o); else drawOrb(items[it].o);
    }

    drawShip();

    // 速度线
    if (state.running && state.speed > state.baseSpeed * 1.15) {
      ctx.strokeStyle = 'rgba(120,200,255,.25)'; ctx.lineWidth = 1.5;
      for (var v = 0; v < 14; v++) {
        var ang = (v / 14) * 6.283 + state.t;
        var r1 = Math.max(W, H) * 0.32, r2 = r1 + 60 + Math.random() * 50;
        ctx.beginPath();
        ctx.moveTo(CX + Math.cos(ang) * r1, CY + Math.sin(ang) * r1);
        ctx.lineTo(CX + Math.cos(ang) * r2, CY + Math.sin(ang) * r2);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(frame);
})();
