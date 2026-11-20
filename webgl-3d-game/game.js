/* ===== 星际穿越 · 3D 无尽跑酷 ===== */
(function () {
  'use strict';

  var canvas = document.getElementById('c');
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

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060f);
  scene.fog = new THREE.Fog(0x080a1e, 45, 165);

  var camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 5.2, 11.5);
  camera.lookAt(0, 2.2, -22);

  scene.add(new THREE.AmbientLight(0x8899ff, 1.15));
  var key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-9, 16, 8); scene.add(key);
  var rim = new THREE.PointLight(0x4ef0ff, 2.2, 120); rim.position.set(0, 5, 6); scene.add(rim);
  var rim2 = new THREE.PointLight(0xff5ec7, 1.8, 120); rim2.position.set(6, 3, -18); scene.add(rim2);

  (function buildStars() {
    var N = 1800, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    var palette = [new THREE.Color(0xffffff), new THREE.Color(0x9fd8ff), new THREE.Color(0xffd7a0), new THREE.Color(0xc9a8ff)];
    for (var i = 0; i < N; i++) {
      var r = 90 + Math.random() * 190, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph) * 0.6 + 30;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      var c = palette[(Math.random() * palette.length) | 0];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.92 })));
  })();

  var trackW = 15, laneZ = -125;
  var trackMat = new THREE.MeshStandardMaterial({ color: 0x131a3a, emissive: 0x0a1240, emissiveIntensity: 0.65, metalness: 0.85, roughness: 0.32 });
  var track = new THREE.Mesh(new THREE.BoxGeometry(trackW * 2, 0.6, 300), trackMat);
  track.position.set(0, -0.3, -40);
  scene.add(track);

  var strip = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 300),
    new THREE.MeshBasicMaterial({ color: 0x4ef0ff, transparent: true, opacity: 0.55 }));
  strip.rotation.x = -Math.PI / 2; strip.position.set(0, 0.02, -40); scene.add(strip);

  var railGeo = new THREE.BoxGeometry(0.32, 0.32, 300);
  [-trackW, trackW].forEach(function (x) {
    var r = new THREE.Mesh(railGeo, new THREE.MeshBasicMaterial({ color: x < 0 ? 0x7b5cff : 0xff5ec7, transparent: true, opacity: 0.9 }));
    r.position.set(x, 0.16, -40); scene.add(r);
  });

  var gridLines = [];
  var lineMat = new THREE.MeshBasicMaterial({ color: 0x2f6bff, transparent: true, opacity: 0.5 });
  for (var gi = 0; gi < 60; gi++) {
    var ln = new THREE.Mesh(new THREE.BoxGeometry(trackW * 2, 0.05, 0.14), lineMat);
    ln.position.set(0, 0.03, -gi * 6 - 4);
    scene.add(ln); gridLines.push(ln);
  }

  var ship = new THREE.Group();
  var hullMat = new THREE.MeshStandardMaterial({ color: 0xdfe9ff, metalness: 0.95, roughness: 0.18, emissive: 0x223066, emissiveIntensity: 0.5 });

  var body = new THREE.Mesh(new THREE.ConeGeometry(0.85, 3.1, 24), hullMat);
  body.rotation.x = Math.PI / 2; body.position.y = 0.95; ship.add(body);

  var wing = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.16, 1.0), hullMat);
  wing.position.set(0, 0.75, 0.55); ship.add(wing);

  var cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0x4ef0ff, emissive: 0x4ef0ff, emissiveIntensity: 1.4, metalness: 0.6, roughness: 0.12, transparent: true, opacity: 0.92 }));
  cockpit.position.set(0, 0.92, -0.35); ship.add(cockpit);

  var flames = [];
  [-0.72, 0.72].forEach(function (x) {
    var f = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.9, 12), new THREE.MeshBasicMaterial({ color: 0x8be9ff, transparent: true, opacity: 0.92 }));
    f.rotation.x = -Math.PI / 2; f.position.set(x, 0.72, 1.85); ship.add(f); flames.push(f);
  });
  var engineLight = new THREE.PointLight(0x4ef0ff, 3.4, 26); engineLight.position.set(0, 0.9, 1.8); ship.add(engineLight);

  ship.position.set(0, 0.75, 3.5);
  scene.add(ship);

  var hazards = [], orbs = [];
  var hazardGeo = new THREE.IcosahedronGeometry(1, 0);
  var hazardMat = new THREE.MeshStandardMaterial({ color: 0xff3550, emissive: 0xff1744, emissiveIntensity: 1.1, metalness: 0.5, roughness: 0.35, flatShading: true });
  var orbGeo = new THREE.OctahedronGeometry(0.62, 0);
  var orbMat = new THREE.MeshStandardMaterial({ color: 0x4ef0ff, emissive: 0x4ef0ff, emissiveIntensity: 1.6, metalness: 0.4, roughness: 0.2 });

  function spawnHazard() {
    var m = new THREE.Mesh(hazardGeo, hazardMat);
    var size = 0.75 + Math.random() * 0.9;
    m.scale.setScalar(size);
    m.position.set((Math.random() * 2 - 1) * (trackW - 1.6), 0.7 + Math.random() * 2.1, laneZ - Math.random() * 40);
    m.userData = { spin: (Math.random() - 0.5) * 3.2, r: size + 0.85 };
    scene.add(m); hazards.push(m);
  }
  function spawnOrb() {
    var o = new THREE.Mesh(orbGeo, orbMat);
    o.position.set((Math.random() * 2 - 1) * (trackW - 1.6), 1.0 + Math.random() * 1.6, laneZ - Math.random() * 40);
    scene.add(o); orbs.push(o);
  }

  var state = {
    running: false, dead: false,
    x: 0, vx: 0, targetX: 0, z: 0,
    speed: 26, baseSpeed: 26, maxSpeed: 78,
    score: 0, distance: 0, energy: 100,
    invuln: 0, shake: 0, t: 0
  };
  var keys = {};
  var best = parseInt(localStorage.getItem('star_runner_best') || '0', 10);
  bestEl.textContent = best > 0 ? ('最高分 ' + best) : '';

  function reset() {
    hazards.forEach(function (h) { scene.remove(h); }); hazards.length = 0;
    orbs.forEach(function (o) { scene.remove(o); }); orbs.length = 0;
    state.running = true; state.dead = false;
    state.x = 0; state.vx = 0; state.targetX = 0; state.z = 0;
    state.speed = state.baseSpeed; state.score = 0; state.distance = 0;
    state.energy = 100; state.invuln = 0; state.shake = 0; state.t = 0;
    ship.position.set(0, 0.75, 3.5); ship.visible = true;
    for (var i = 0; i < 9; i++) spawnHazard();
    for (var j = 0; j < 12; j++) spawnOrb();
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

  window.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
    if ((e.code === 'Space' || e.code === 'Enter') && !state.running) { startGame(); }
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  btn.addEventListener('click', startGame);

  var touchX = null;
  function pointerStart(px) { touchX = px; }
  function pointerMove(px) {
    if (touchX === null) return;
    var d = (px - touchX) / (window.innerWidth * 0.16);
    state.targetX = Math.max(-(trackW - 1.5), Math.min(trackW - 1.5, state.targetX + d));
    touchX = px;
  }
  canvas.addEventListener('touchstart', function (e) { pointerStart(e.touches[0].clientX); }, { passive: true });
  canvas.addEventListener('touchmove', function (e) { pointerMove(e.touches[0].clientX); }, { passive: true });
  canvas.addEventListener('touchend', function () { touchX = null; });
  canvas.addEventListener('mousedown', function (e) { pointerStart(e.clientX); });
  window.addEventListener('mousemove', function (e) { if (touchX !== null) pointerMove(e.clientX); });
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

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta(), 0.05);
    state.t += dt;

    if (state.running) {
      state.speed = Math.min(state.maxSpeed, state.baseSpeed + state.distance * 0.035);

      var kx = 0;
      if (keys.KeyA || keys.ArrowLeft) kx -= 1;
      if (keys.KeyD || keys.ArrowRight) kx += 1;
      if (kx !== 0) state.targetX += kx * 17 * dt;
      if (keys.KeyW || keys.ArrowUp) state.energy = Math.min(100, state.energy + 3 * dt);
      if (keys.KeyS || keys.ArrowDown) state.energy = Math.min(100, state.energy + 3 * dt);
      if (keys.Space) { state.speed = Math.min(state.maxSpeed, state.speed + 46 * dt); state.energy -= 26 * dt; }
      if (state.energy <= 0) { state.energy = 0; state.speed = Math.max(state.baseSpeed, state.speed - 40 * dt); }

      var limit = trackW - 1.5;
      state.targetX = Math.max(-limit, Math.min(limit, state.targetX));
      state.x += (state.targetX - state.x) * Math.min(1, dt * 11);
      state.distance += state.speed * dt;
      state.score += state.speed * dt * 0.55;

      ship.position.x = state.x;
      ship.rotation.z = -(state.targetX - state.x) * 0.42;
      ship.rotation.y = (state.targetX - state.x) * 0.28;

      if (state.invuln > 0) { state.invuln -= dt; ship.visible = (Math.floor(state.t * 14) % 2 === 0); }
      else ship.visible = true;

      for (var i = hazards.length - 1; i >= 0; i--) {
        var h = hazards[i];
        h.position.z += state.speed * dt;
        h.rotation.x += h.userData.spin * dt; h.rotation.y += h.userData.spin * 0.7 * dt;
        if (h.position.z > 8) { scene.remove(h); hazards.splice(i, 1); spawnHazard(); continue; }
        var dx = h.position.x - ship.position.x, dz = h.position.z - ship.position.z;
        var dy = h.position.y - (ship.position.y + 0.8);
        if (state.invuln <= 0 && dx * dx + dz * dz < h.userData.r * h.userData.r && Math.abs(dy) < 1.7) { die(); }
      }

      for (var k = orbs.length - 1; k >= 0; k--) {
        var o = orbs[k];
        o.position.z += state.speed * dt;
        o.rotation.y += dt * 2.6; o.rotation.x += dt * 1.3;
        o.position.y += Math.sin(state.t * 3 + k) * dt * 0.6;
        if (o.position.z > 8) { scene.remove(o); orbs.splice(k, 1); spawnOrb(); continue; }
        var ox = o.position.x - ship.position.x, oz = o.position.z - ship.position.z, oy = o.position.y - (ship.position.y + 0.8);
        if (ox * ox + oz * oz < 1.55 * 1.55 && Math.abs(oy) < 1.7) {
          state.energy = Math.min(100, state.energy + 26);
          state.score += 55;
          scene.remove(o); orbs.splice(k, 1); spawnOrb();
        }
      }

      if (Math.abs(state.x) > trackW - 0.9) { state.energy -= 30 * dt; state.shake = 0.35; }
      if (state.energy <= 0 && Math.abs(state.x) > trackW - 0.9) die();

      var fl = 0.75 + Math.sin(state.t * 22) * 0.28 + (state.speed / state.maxSpeed) * 0.6;
      for (var fi = 0; fi < flames.length; fi++) flames[fi].scale.set(1, fl, 1);
      engineLight.intensity = 2.4 + Math.sin(state.t * 20) * 0.7;

      for (var li = 0; li < gridLines.length; li++) {
        var ln = gridLines[li];
        ln.position.z += state.speed * dt * 0.28;
        if (ln.position.z > 8) ln.position.z -= 360;
      }
    }

    state.shake = Math.max(0, state.shake - dt * 1.3);
    var sh = state.shake * 0.6;
    camera.position.x += ((state.x * 0.55) - camera.position.x) * Math.min(1, dt * 4.2);
    camera.position.y = 5.2 + Math.sin(state.t * 1.5) * 0.12 + (Math.random() - 0.5) * sh;
    camera.position.z = 11.5;
    camera.lookAt(state.x * 0.7, 2.1 + (Math.random() - 0.5) * sh * 0.6, -24);

    rim.intensity = 1.9 + Math.sin(state.t * 3) * 0.5;

    if (state.running) updateHUD();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
})();
