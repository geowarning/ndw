/* ================================================================
 * games.js v3 — 产品目录 3D 互动游戏（Three.js）
 *   aqua : AquaSentry  —— 发射口视角，调角度抛射救生圈（真实物理）
 *   pyro : PyroGuard   —— 网格解谜，最短路径清理树叶
 *   两个游戏各 7 个难度，最高难度重复生成
 * ================================================================ */
(function () {
  var running = false;
  var scene, camera, renderer, clock;
  var rafId = null;
  var container = null, cv = null;
  var state = null, L = {};
  var frameEl = null;
  var panelEl = null;
  var G = 9.81;
  var ENV_TEX = null;

  /* ---------------- renderer ---------------- */
  function setupRenderer(canvas) {
    cv = canvas;
    frameEl = cv.parentElement;
    var w = Math.max(320, frameEl.clientWidth);
    var h = Math.max(300, Math.min(560, Math.floor(w * 0.72)));
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    cv.style.display = 'none';
    frameEl.appendChild(renderer.domElement);
    container = renderer.domElement;
    container.style.width = '100%';
    container.style.borderRadius = '10px';
    container.style.display = 'block';
    frameEl.style.position = 'relative';
    frameEl.style.overflow = 'hidden';
    return { w: w, h: h };
  }

  function makeLights(x, y, z) {
    scene.add(new THREE.AmbientLight(0xfff2e0, 0.65));
    scene.add(new THREE.HemisphereLight(0x9ab7c8, 0x2f6b3a, 0.3));
    var sun = new THREE.DirectionalLight(0xffe9c4, 1.2);
    sun.position.set(x, y, z);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    var d = 40;
    sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
    sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0x88bbff, 0.35);
    fill.position.set(-10, 8, -8);
    scene.add(fill);
    return sun;
  }

  function metal(color, rough) {
    return new THREE.MeshStandardMaterial({ color: color, metalness: 0.7, roughness: rough == null ? 0.45 : rough });
  }

  /* ---------------- 程序化纹理与公园场景 ---------------- */
  function canvasTexture(size, draw) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    draw(g, size);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function skyTexture() {
    return canvasTexture(64, function (g, s) {
      var grad = g.createLinearGradient(0, 0, 0, s);
      grad.addColorStop(0, '#2b4a63');
      grad.addColorStop(0.45, '#5b8aa3');
      grad.addColorStop(0.7, '#9ab7c8');
      grad.addColorStop(0.86, '#e2a06a');
      grad.addColorStop(1, '#f7d3a0');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    });
  }

  function waterNormalTexture() {
    return canvasTexture(256, function (g, s) {
      var img = g.createImageData(s, s);
      for (var y = 0; y < s; y++) {
        for (var x = 0; x < s; x++) {
          var i = (y * s + x) * 4;
          var nx = Math.sin(x / s * Math.PI * 8) * 0.35 + Math.sin((x + y) / s * Math.PI * 5) * 0.35;
          var ny = Math.cos(y / s * Math.PI * 7) * 0.35 + Math.cos((x - y) / s * Math.PI * 3) * 0.35;
          img.data[i] = Math.max(0, Math.min(255, 128 + nx * 60));
          img.data[i + 1] = Math.max(0, Math.min(255, 128 + ny * 60));
          img.data[i + 2] = 255;
          img.data[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    });
  }

  function grassTexture() {
    return canvasTexture(128, function (g, s) {
      g.fillStyle = '#275030';
      g.fillRect(0, 0, s, s);
      for (var i = 0; i < 900; i++) {
        var v = Math.random();
        g.fillStyle = v < 0.4 ? '#2f6338' : v < 0.8 ? '#1f4728' : '#387040';
        g.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
    });
  }

  function addParkTree(scene, x, z, scale) {
    var g = new THREE.Group();
    var s = scale || 1;
    var trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24 * s, 0.34 * s, 3 * s, 7),
      new THREE.MeshStandardMaterial({ color: 0x5b3d24, roughness: 0.95 })
    );
    trunk.position.y = 1.5 * s;
    trunk.castShadow = true;
    g.add(trunk);
    var colors = [0x2f7a3a, 0x3b8a44, 0x266b31];
    for (var i = 0; i < 3; i++) {
      var foliage = new THREE.Mesh(
        new THREE.IcosahedronGeometry((1.5 - i * 0.22) * s, 1),
        new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.9, flatShading: true })
      );
      foliage.position.set((Math.random() - 0.5) * 0.6 * s, (3.1 + i * 0.85) * s, (Math.random() - 0.5) * 0.6 * s);
      foliage.castShadow = true;
      g.add(foliage);
    }
    g.position.set(x, 0.4, z);
    scene.add(g);
    return g;
  }

  function addBuilding(scene, x, z, w, h, d, color) {
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.75, metalness: 0.15 })
    );
    body.position.set(x, h / 2 + 0.4, z);
    body.castShadow = true;
    body.receiveShadow = true;
    scene.add(body);
    var winMat = new THREE.MeshBasicMaterial({ color: 0xffd98a });
    for (var r = 0; r < Math.max(1, Math.floor(h / 3.2)); r++) {
      for (var c = -1; c <= 1; c++) {
        var win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.16, 1.0, 0.12), winMat);
        win.position.set(x + c * w * 0.25, 2.4 + r * 3.2, z + d / 2 + 0.07);
        scene.add(win);
      }
    }
  }

  function addMountain(scene, x, z, radius, height) {
    var m = new THREE.Mesh(
      new THREE.ConeGeometry(radius, height, 6, 1),
      new THREE.MeshStandardMaterial({ color: 0x6b7d78, roughness: 0.95, flatShading: true })
    );
    m.position.set(x, height / 2 - 6, z);
    scene.add(m);
  }

  function addKiosk(scene, x, z) {
    var g = new THREE.Group();
    var wall = new THREE.MeshStandardMaterial({ color: 0xd8cbb0, roughness: 0.85 });
    var red = new THREE.MeshStandardMaterial({ color: 0xb5523f, roughness: 0.7 });
    var white = new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.8 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 3), wall);
    body.position.y = 1.2;
    body.castShadow = true;
    g.add(body);
    var roof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.25, 3.6), red);
    roof.position.y = 2.55;
    g.add(roof);
    for (var i = 0; i < 4; i++) {
      var stripe = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 1.2), i % 2 ? white : red);
      stripe.position.set(-1.5 + i * 1.0, 2.05, 1.5);
      g.add(stripe);
    }
    var counter = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.12, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 })
    );
    counter.position.set(0, 0.9, 1.6);
    g.add(counter);
    g.position.set(x, 0.4, z);
    scene.add(g);
  }

  function addPark(scene) {
    var grassMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.95, map: grassTexture() });
    grassMat.map.repeat.set(6, 2);

    // 左、右、远三面湖岸，把水面围成一个湖
    var left = new THREE.Mesh(new THREE.BoxGeometry(100, 0.6, 220), grassMat);
    left.position.set(-80, 0.05, -50);
    left.receiveShadow = true;
    scene.add(left);
    var right = left.clone();
    right.position.x = 80;
    scene.add(right);
    var far = new THREE.Mesh(new THREE.BoxGeometry(260, 0.6, 70), grassMat);
    far.position.set(0, 0.05, -118);
    far.receiveShadow = true;
    scene.add(far);

    // 沿湖步道
    var paveMat = new THREE.MeshStandardMaterial({ color: 0xbfb5a3, roughness: 0.9 });
    [[-31.5, -50, 3, 220], [31.5, -50, 3, 220], [0, -84.5, 63, 3]].forEach(function (p) {
      var pave = new THREE.Mesh(new THREE.BoxGeometry(p[2], 0.12, p[3]), paveMat);
      pave.position.set(p[0], 0.4, p[1]);
      pave.receiveShadow = true;
      scene.add(pave);
    });

    // 道路
    var road = new THREE.Mesh(
      new THREE.BoxGeometry(210, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: 0x2b2b30, roughness: 0.9 })
    );
    road.position.set(0, 0.42, -96);
    road.receiveShadow = true;
    scene.add(road);
    var dashMat = new THREE.MeshBasicMaterial({ color: 0xc8b560 });
    for (var i = -11; i <= 11; i++) {
      var dash = new THREE.Mesh(new THREE.BoxGeometry(6, 0.03, 0.4), dashMat);
      dash.position.set(i * 9, 0.47, -96);
      scene.add(dash);
    }

    // 远岸与两岸的树
    for (var t = 0; t < 16; t++) {
      addParkTree(scene, -36 + t * 5, -110 - (t % 3) * 4, 0.9 + Math.random() * 0.5);
    }
    for (var s = 0; s < 16; s++) {
      var side = s % 2 ? 1 : -1;
      addParkTree(scene, side * (40 + Math.random() * 20), -12 - s * 8, 0.8 + Math.random() * 0.5);
    }

    addBuilding(scene, -62, -128, 10, 16, 8, 0x3a4a58);
    addBuilding(scene, -18, -136, 14, 22, 10, 0x2f3b47);
    addBuilding(scene, 40, -130, 12, 18, 9, 0x44525e);
    addBuilding(scene, 84, -140, 16, 26, 12, 0x2a3540);

    // 远山
    addMountain(scene, -95, -225, 70, 90);
    addMountain(scene, 5, -245, 95, 120);
    addMountain(scene, 115, -230, 65, 80);

    // 售货亭
    addKiosk(scene, -40, -66);
    addKiosk(scene, 42, -84);
    addKiosk(scene, 8, -92);

    // 岸边岩石
    for (var r = 0; r < 16; r++) {
      var rx = (r % 2 ? 1 : -1) * (28 + Math.random() * 3);
      var rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.7 + Math.random() * 0.8, 0),
        new THREE.MeshStandardMaterial({ color: 0x8a857c, roughness: 0.95, flatShading: true })
      );
      rock.position.set(rx, 0.25, -28 - r * 6);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      scene.add(rock);
    }

    // 栈桥
    var pier = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.9 })
    );
    pier.position.set(20, 0.35, -22);
    pier.receiveShadow = true;
    scene.add(pier);
    for (var p = 0; p < 4; p++) {
      var post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a3320, roughness: 0.95 })
      );
      post.position.set(20 + (p % 2 ? 1.6 : -1.6), 0.2, -16 - Math.floor(p / 2) * 12);
      scene.add(post);
    }
  }

  /* ================================================================
   * 面板（关卡切换 / 结算 / 失败）
   * ================================================================ */
  function showPanel(html) {
    hidePanel();
    panelEl = document.createElement('div');
    panelEl.className = 'game-panel';
    panelEl.innerHTML = html;
    frameEl.appendChild(panelEl);
    return panelEl;
  }
  function hidePanel() {
    if (panelEl && panelEl.parentNode) { panelEl.parentNode.removeChild(panelEl); }
    panelEl = null;
  }

  /* ================================================================
   * AquaSentry v3
   * ================================================================ */
  var PHYS = {
    mass: 0.5,        // 救生圈 500g
    cd: 0.8,          // 阻力系数
    rho: 1.225,       // 空气密度
    area: 0.025,      // 平飞时环边缘朝前的迎风面积 m²
    v0: 26            // 发射初速度 m/s（降低后目标需更高抛射角）
  };
  PHYS.k = 0.5 * PHYS.rho * PHYS.cd * PHYS.area / PHYS.mass;

  function aquaConfig(level) {
    return {
      targets: level,
      time: 30 + level * 9,          // L1=39s … L7=93s
      // 目标落在最大射程的 ~0.90–0.99 区间：低抛解约 24–33°，高抛解约 44–50°。
      rangeMin: 30.6 + (level - 1) * 0.28,
      rangeMax: 32.6 + (level - 1) * 0.16,
      spread: 2 + level * 1.6       // 目标横向散布
    };
  }

  function initAqua(level) {
    var cfg = aquaConfig(level);
    var S = {
      type: 'aqua', level: level, cfg: cfg,
      yaw: 0, pitch: 32 * Math.PI / 180,
      targets: [], rings: [], shots: 0, hits: 0,
      saved: 0, timeLeft: cfg.time,
      cooldown: 0, cooldownMax: 1,
      over: false, startWall: performance.now(),
      yawGroup: null, headGroup: null,
      marker: null, trajDots: [],
      locked: false,
      input: { l: 0, r: 0, u: 0, d: 0 },
      mouse: { active: false, nx: 0, ny: 0 }
    };
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9ab7c8);
    scene.fog = new THREE.Fog(0x9ab7c8, 100, 260);
    camera = new THREE.PerspectiveCamera(58, 1.38, 0.1, 400);
    camera.position.set(0, 4.2, 5.2);
    camera.lookAt(0, 1.0, -30);
    makeLights(8, 20, 6);

    // 天空穹顶
    var sky = new THREE.Mesh(
      new THREE.SphereGeometry(240, 24, 16),
      new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, depthWrite: false })
    );
    scene.add(sky);

    // 湖面：法线波纹 + 天空反射
    var wTex = waterNormalTexture();
    wTex.repeat.set(48, 36);
    if (!ENV_TEX) {
      var pmrem = new THREE.PMREMGenerator(renderer);
      var envScene = new THREE.Scene();
      envScene.add(new THREE.Mesh(
        new THREE.SphereGeometry(100, 24, 16),
        new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide })
      ));
      ENV_TEX = pmrem.fromScene(envScene, 0.04).texture;
      pmrem.dispose();
    }
    var waterMat = new THREE.MeshStandardMaterial({
      color: 0x1f5c78, roughness: 0.06, metalness: 0.25,
      envMap: ENV_TEX, envMapIntensity: 1.1,
      normalMap: wTex, normalScale: new THREE.Vector2(0.55, 0.55)
    });
    var water = new THREE.Mesh(new THREE.PlaneGeometry(260, 200, 1, 1), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.15, -55);
    water.receiveShadow = true;
    scene.add(water);
    S.water = water;
    S.waterMat = waterMat;
    S.waterTex = wTex;

    // 公园环境（草地、道路、树、建筑、栈桥）
    addPark(scene);

    // 平台
    var deck = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.4, 3),
      metal(0x3a3f44, 0.6)
    );
    deck.position.set(0, 0.05, 0.6);
    deck.receiveShadow = true; deck.castShadow = true;
    scene.add(deck);

    buildLauncher(S);
    buildTargets(S);

    // 落点标记
    S.marker = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 1.0, 24),
      new THREE.MeshBasicMaterial({ color: 0x43e8cf, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    S.marker.rotation.x = -Math.PI / 2;
    scene.add(S.marker);
    for (var d = 0; d < 12; d++) {
      var dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x43e8cf, transparent: true, opacity: 0.55 })
      );
      scene.add(dot);
      S.trajDots.push(dot);
    }

    // 静态场景反射：把湖周围环境烘焙到 cubemap，作为更清晰的水面反射
    var cubeRT = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter
    });
    var cubeCam = new THREE.CubeCamera(0.5, 600, cubeRT);
    cubeCam.position.set(0, 1.2, -38);
    scene.add(cubeCam);
    S.water.visible = false;
    cubeCam.update(renderer, scene);
    S.water.visible = true;
    S.waterMat.envMap = cubeRT.texture;
    S.waterMat.envMapIntensity = 1.3;
    S.waterMat.metalness = 0.55;
    S.waterMat.roughness = 0.06;
    S.waterMat.needsUpdate = true;
    S.cubeRT = cubeRT;
    return S;
  }

  function buildLauncher(S) {
    // 水平旋转组
    var yawG = new THREE.Group();
    yawG.position.set(0, 0.25, 0.4);
    scene.add(yawG);
    S.yawGroup = yawG;

    // 俯仰组
    var headG = new THREE.Group();
    headG.position.set(0, 1.15, 0);
    yawG.add(headG);
    S.headGroup = headG;

    var rubber = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.0 });
    var motorMat = metal(0x6b727a, 0.35);

    // 中间通道：上下两块板
    var chuteMat = metal(0x4d545b, 0.5);
    var chuteGeo = new THREE.BoxGeometry(0.62, 0.06, 1.4);
    var chuteTop = new THREE.Mesh(chuteGeo, chuteMat);
    chuteTop.position.set(0, 0.3, -0.5);
    var chuteBot = new THREE.Mesh(chuteGeo, chuteMat);
    chuteBot.position.set(0, -0.3, -0.5);
    headG.add(chuteTop); headG.add(chuteBot);
    // 侧板
    var sideGeo = new THREE.BoxGeometry(0.06, 0.6, 1.4);
    var sideL = new THREE.Mesh(sideGeo, chuteMat);
    sideL.position.set(-0.31, 0, -0.5);
    var sideR = new THREE.Mesh(sideGeo, chuteMat);
    sideR.position.set(0.31, 0, -0.5);
    headG.add(sideL); headG.add(sideR);

    // 上下胶轮
    var wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 20);
    var wheelT = new THREE.Mesh(wheelGeo, rubber);
    wheelT.rotation.z = Math.PI / 2;
    wheelT.position.set(0, 0.32, 0.05);
    var wheelB = new THREE.Mesh(wheelGeo, rubber);
    wheelB.rotation.z = Math.PI / 2;
    wheelB.position.set(0, -0.32, 0.05);
    headG.add(wheelT); headG.add(wheelB);
    S.wheels = [wheelT, wheelB];

    // 左右电机
    var motorGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.55, 16);
    var mL = new THREE.Mesh(motorGeo, motorMat);
    mL.rotation.x = Math.PI / 2;
    mL.position.set(-0.42, 0.05, 0.05);
    var mR = new THREE.Mesh(motorGeo, motorMat);
    mR.rotation.x = Math.PI / 2;
    mR.position.set(0.42, 0.05, 0.05);
    headG.add(mL); headG.add(mR);
    // 电机散热片
    for (var i = 0; i < 5; i++) {
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.34, 0.03), metal(0x889099, 0.3));
      fin.position.set(0, 0.05, -0.22 + i * 0.11);
      var finL = fin.clone(); finL.position.x = -0.42;
      var finR = fin.clone(); finR.position.x = 0.42;
      headG.add(finL); headG.add(finR);
    }

    // 弹药：通道内 3 个救生圈
    S.ammoRings = [];
    for (var k = 0; k < 3; k++) {
      var r = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.08, 10, 18),
        new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.5 })
      );
      r.position.set(0, 0, -0.25 + k * 0.38);
      headG.add(r);
      S.ammoRings.push(r);
    }

    // 支架
    var legGeo = new THREE.BoxGeometry(0.1, 1.0, 0.1);
    [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]].forEach(function (p) {
      var leg = new THREE.Mesh(legGeo, metal(0x2f3439, 0.6));
      leg.position.set(p[0], 0.4, p[1]);
      leg.castShadow = true;
      yawG.add(leg);
    });

    headG.traverse(function (m) { if (m.isMesh) m.castShadow = true; });
  }

  function buildTargets(S) {
    var cfg = S.cfg;
    for (var i = 0; i < cfg.targets; i++) {
      var g = new THREE.Group();
      var skin = new THREE.MeshStandardMaterial({ color: 0xe6b48f, roughness: 0.7 });
      var vestMat = new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.55 });
      var hairMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.85 });

      var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.72, 12), vestMat);
      torso.position.y = 0.52;
      var stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.265, 0.265, 0.1, 12),
        new THREE.MeshStandardMaterial({ color: 0xfff2c0, roughness: 0.4 })
      );
      stripe.position.y = 0.62;
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), skin);
      head.position.y = 1.12;
      var cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.21, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        hairMat
      );
      cap.position.y = 1.15;
      var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8), skin);
      neck.position.y = 0.96;

      var armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 8), skin);
      armL.position.set(-0.34, 0.62, 0);
      armL.rotation.z = 0.5;
      var armPivot = new THREE.Group();
      armPivot.position.set(0.3, 0.82, 0);
      armPivot.rotation.z = -2.0;
      var armR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.62, 8), skin);
      armR.position.y = 0.31;
      armPivot.add(armR);

      var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.62, 22),
        new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;

      g.add(torso); g.add(stripe); g.add(head); g.add(cap); g.add(neck); g.add(armL); g.add(armPivot); g.add(ring);
      var dist = cfg.rangeMin + Math.random() * (cfg.rangeMax - cfg.rangeMin);
      var x = (Math.random() - 0.5) * 2 * cfg.spread;
      g.position.set(x, 0, -dist);
      g.scale.setScalar(1.25);
      g.userData = {
        saved: false, bob: Math.random() * 6.28, arm: armPivot, armBase: -2.0,
        home: new THREE.Vector3(x, 0, -dist)
      };
      g.traverse(function (m) { if (m.isMesh) m.castShadow = true; });
      scene.add(g);
      S.targets.push(g);
    }
  }

  // 弹道积分（返回落点 + 轨迹点）
  function simulateShot(yaw, pitch) {
    var start = new THREE.Vector3(0, 1.4, -0.7);
    // 变换到 yaw 坐标系
    var fwd = new THREE.Vector3(0, Math.sin(pitch), -Math.cos(pitch)).applyEuler(new THREE.Euler(0, yaw, 0));
    var vel = fwd.multiplyScalar(PHYS.v0);
    var pos = start.clone();
    var dt = 0.012;
    var pts = [];
    for (var i = 0; i < 600; i++) {
      var speed = vel.length();
      if (speed > 0) {
        var drag = PHYS.k * speed * speed;
        vel.addScaledVector(vel.clone().normalize(), -drag * dt);
      }
      vel.y -= G * dt;
      pos.addScaledVector(vel, dt);
      if (i % 6 === 0) { pts.push(pos.clone()); }
      if (pos.y <= 0 && i > 2) {
        // 线性插值到水面
        pts.push(pos.clone());
        return { land: pos.clone(), pts: pts };
      }
    }
    return { land: pos.clone(), pts: pts };
  }

  function fireAqua(S) {
    if (S.over || S.cooldown > 0) { return; }
    var sim = simulateShot(S.yaw, S.pitch);
    var dir = new THREE.Vector3(0, Math.sin(S.pitch), -Math.cos(S.pitch))
      .applyEuler(new THREE.Euler(0, S.yaw, 0));
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.09, 10, 18),
      new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.45 })
    );
    ring.castShadow = true;
    var start = new THREE.Vector3(0, 1.4, -0.7);
    ring.position.copy(start);
    scene.add(ring);
    S.rings.push({
      mesh: ring, pos: start.clone(),
      vel: dir.multiplyScalar(PHYS.v0),
      dead: false
    });
    S.shots++;
    S.cooldown = S.cooldownMax;
    // 轮子转动
    S.wheels.forEach(function (w) { w.userData.spin = 6; });
  }

  function stepAqua(S, dt) {
    if (S.over) { return; }
    S.timeLeft -= dt;
    S.cooldown -= dt;
    if (S.waterTex) { S.waterTex.offset.x += dt * 0.02; S.waterTex.offset.y += dt * 0.012; }
    if (S.timeLeft <= 0) {
      S.timeLeft = 0; S.over = true;
      showFail(S);
      return;
    }
    // 键盘调角度
    var turn = 0.7 * dt, lift = 0.55 * dt;
    if (S.input.l) S.yaw += turn;
    if (S.input.r) S.yaw -= turn;
    if (S.input.u) S.pitch += lift;
    if (S.input.d) S.pitch -= lift;
    S.yaw = Math.max(-0.7, Math.min(0.7, S.yaw));
    S.pitch = Math.max(0.17, Math.min(58 * Math.PI / 180, S.pitch));
    S.yawGroup.rotation.y = S.yaw;
    S.headGroup.rotation.x = S.pitch;
    // 轮子动画
    S.wheels.forEach(function (w) {
      if (w.userData.spin > 0) { w.userData.spin -= dt; w.rotation.y += 0.5; }
    });

    // 落点预测
    var sim = simulateShot(S.yaw, S.pitch);
    S.marker.position.set(sim.land.x, 0.05, sim.land.z);
    // 落点是否在某个目标的命中范围内（锁定提示）
    var locked = false;
    S.targets.forEach(function (tg) {
      if (!tg.userData.saved && sim.land.distanceTo(tg.position) < 2.2) { locked = true; }
    });
    S.marker.material.color.set(locked ? 0x76ff50 : 0x43e8cf);
    S.marker.scale.setScalar(locked ? 1.4 : 1.0);
    S.locked = locked;
    // 弹道预测虚线不显示（按要求隐藏）
    S.trajDots.forEach(function (dot) { dot.visible = false; });

    // 落水者浮动
    S.targets.forEach(function (tg) {
      if (tg.userData.saved) {
        tg.position.y += dt * 0.8; // 被救上浮
        tg.rotation.z += dt * 2;
        return;
      }
      tg.userData.bob += dt * 4;
      tg.position.x = tg.userData.home.x + Math.sin(tg.userData.bob * 0.8) * 0.5;
      tg.position.y = Math.sin(tg.userData.bob) * 0.08;
      tg.userData.arm.rotation.z = tg.userData.armBase + Math.sin(tg.userData.bob * 2) * 0.6;
    });

    // 救生圈飞行
    for (var i = 0; i < S.rings.length; i++) {
      var r = S.rings[i];
      if (r.dead) { continue; }
      var speed = r.vel.length();
      if (speed > 0) {
        var drag = PHYS.k * speed * speed;
        r.vel.addScaledVector(r.vel.clone().normalize(), -drag * dt);
      }
      r.vel.y -= G * dt;
      r.pos.addScaledVector(r.vel, dt);
      r.mesh.position.copy(r.pos);
      r.mesh.rotation.x += dt * 6;
      r.mesh.rotation.y += dt * 3;
      if (r.pos.y <= 0.25) {
        // 命中判定
        var hit = false;
        S.targets.forEach(function (tg) {
          if (tg.userData.saved) { return; }
          if (r.pos.distanceTo(tg.position) < 2.2) {
            tg.userData.saved = true;
            tg.traverse(function (c) {
              if (c.material && c.material.color) {
                if (c === tg.userData.arm) return;
                c.material.color.set(0x43e8cf);
              }
            });
            S.hits++; S.saved++;
            hit = true;
          }
        });
        r.dead = true;
        // 水花
        splash(r.pos.x, r.pos.z);
      }
    }
    S.rings = S.rings.filter(function (r) {
      if (r.dead) { scene.remove(r.mesh); return false; }
      return true;
    });

    if (S.saved >= S.cfg.targets) {
      S.over = true;
      showAquaWin(S);
    }
  }

  var splashes = [];
  function splash(x, z) {
    for (var i = 0; i < 10; i++) {
      var p = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 5, 5),
        new THREE.MeshBasicMaterial({ color: 0x9fd8ff })
      );
      p.position.set(x, 0.1, z);
      p.userData.v = new THREE.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 2, (Math.random() - 0.5) * 3);
      p.userData.life = 0.7;
      scene.add(p);
      splashes.push(p);
    }
  }
  function stepSplashes(dt) {
    splashes.forEach(function (p) {
      p.userData.life -= dt;
      p.userData.v.y -= G * dt;
      p.position.addScaledVector(p.userData.v, dt);
      if (p.position.y < 0.02) { p.position.y = 0.02; }
    });
    splashes = splashes.filter(function (p) {
      if (p.userData.life <= 0) { scene.remove(p); return false; }
      return true;
    });
  }

  function showAquaWin(S) {
    var used = S.cfg.time - S.timeLeft;
    var acc = S.shots > 0 ? Math.round(S.hits / S.shots * 100) : 0;
    var last = S.level >= 7;
    var p = showPanel(
      '<div class="gp-icon">✓</div>' +
      '<div class="gp-title">' + L.levelClear + ' ' + S.level + '</div>' +
      '<div class="gp-rows">' +
        '<div><span>' + L.timeUsed + '</span><b>' + used.toFixed(1) + 's</b></div>' +
        '<div><span>' + L.accuracy + '</span><b>' + acc + '% (' + S.hits + '/' + S.shots + ')</b></div>' +
      '</div>' +
      '<button class="gp-btn" data-gp="next">' + (last ? L.keepChallenge : L.nextLevel) + '</button>'
    );
    p.querySelector('[data-gp=next]').addEventListener('click', function () {
      hidePanel();
      var next = S.level >= 7 ? 7 : S.level + 1;
      state = initAqua(next);
    });
  }

  function showFail(S) {
    var p = showPanel(
      '<div class="gp-icon" style="color:#ff5a5a">✕</div>' +
      '<div class="gp-title">' + L.failed + '</div>' +
      '<div class="gp-rows"><div><span>' + L.progress + '</span><b>' + S.saved + '/' + S.cfg.targets + '</b></div></div>' +
      '<button class="gp-btn" data-gp="retry">' + L.retry + '</button>'
    );
    p.querySelector('[data-gp=retry]').addEventListener('click', function () {
      hidePanel();
      state = initAqua(S.level);
    });
  }

  /* ================================================================
   * PyroGuard v3 — 网格解谜
   * ================================================================ */
  function pyroConfig(level) {
    return {
      n: 4 + level,              // 网格边长 L1=5 … L7=11
      piles: Math.min(level + 1, 8),
      obstacle: 0.13 + level * 0.018,
      time: Math.max(18, 34 - (level - 1) * 2)   // L1=34s … L7=22s
    };
  }
  var CELL = 2; // 每格 2 米

  function initPyro(level) {
    var cfg = pyroConfig(level);
    var S = {
      type: 'pyro', level: level, cfg: cfg,
      n: cfg.n, cell: CELL,
      grid: [], start: null, piles: [],
      tank: null, moving: null,
      userSteps: 0, visited: [],
      cleared: 0,
      timeLeft: cfg.time,
      over: false,
      bestPath: null, bestLen: null,
      userPathCells: [],
      routeLines: null
    };
    generateGrid(S);
    return S;
  }

  function buildPyroScene(S) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1a12);
    scene.fog = new THREE.Fog(0x0c1a12, 30, 70);
    camera = new THREE.PerspectiveCamera(50, 1.38, 0.1, 200);
    var n = S.n, c = S.cell;
    var span = n * c;
    camera.position.set(span * 0.55, span * 0.85, span * 0.62 + 4);
    camera.lookAt(0, 0, 0);
    makeLights(12, 25, 10);

    // 地面（程序化草地纹理）
    var gTex = grassTexture();
    gTex.repeat.set(6, 6);
    var ground = new THREE.Mesh(
      new THREE.BoxGeometry(span + 2, 0.4, span + 2),
      new THREE.MeshStandardMaterial({ color: 0x24502c, roughness: 0.95, map: gTex })
    );
    ground.position.y = -0.25;
    ground.receiveShadow = true;
    scene.add(ground);
    // 草簇点缀
    for (var gi = 0; gi < 60; gi++) {
      var tuft = new THREE.Mesh(
        new THREE.ConeGeometry(0.07 + Math.random() * 0.06, 0.22 + Math.random() * 0.2, 5),
        new THREE.MeshStandardMaterial({ color: 0x3d7a48, roughness: 0.95, flatShading: true })
      );
      tuft.position.set((Math.random() - 0.5) * (span + 1), 0.03, (Math.random() - 0.5) * (span + 1));
      scene.add(tuft);
    }

    // 网格线
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var o = -span / 2 + i * c;
      pts.push(new THREE.Vector3(o, 0.02, -span / 2), new THREE.Vector3(o, 0.02, span / 2));
      pts.push(new THREE.Vector3(-span / 2, 0.02, o), new THREE.Vector3(span / 2, 0.02, o));
    }
    var lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    var gridLines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x3a6b48, transparent: true, opacity: 0.5 }));
    scene.add(gridLines);

    // 物体
    var cellToWorld = S.cellToWorld = function (r, cc) {
      return new THREE.Vector3(
        (cc - (n - 1) / 2) * c, 0,
        (r - (n - 1) / 2) * c
      );
    };
    for (var r = 0; r < n; r++) {
      for (var cc = 0; cc < n; cc++) {
        var v = S.grid[r][cc];
        var wp = cellToWorld(r, cc);
        if (v === 1) addStone(wp);
        else if (v === 2) addTree(wp);
        else if (v === 3) addPit(wp, c);
      }
    }
    S.piles.forEach(function (p) {
      p.mesh = addLeafPile(cellToWorld(p.r, p.c));
    });

    // 起点标记
    var sp = cellToWorld(S.start.r, S.start.c);
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.75, 24),
      new THREE.MeshBasicMaterial({ color: 0x43e8cf, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(sp.x, 0.05, sp.z);
    scene.add(ring);

    // 坦克
    S.tank = buildTank();
    S.tank.position.copy(sp);
    S.tank.position.y = 0;
    scene.add(S.tank);
  }

  function addStone(wp) {
    var s = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.3, 0),
      new THREE.MeshStandardMaterial({ color: 0x7a7d82, roughness: 0.9, flatShading: true })
    );
    s.position.set(wp.x, 0.35, wp.z);
    s.rotation.set(Math.random(), Math.random(), Math.random());
    s.castShadow = true; s.receiveShadow = true;
    scene.add(s);
  }
  function addTree(wp) {
    var g = new THREE.Group();
    var trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.9 })
    );
    trunk.position.y = 0.45;
    var crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 1.5, 9),
      new THREE.MeshStandardMaterial({ color: 0x2e6b33, roughness: 0.85, flatShading: true })
    );
    crown.position.y = 1.5;
    var crown2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 1.1, 9),
      new THREE.MeshStandardMaterial({ color: 0x3a7d40, roughness: 0.85, flatShading: true })
    );
    crown2.position.y = 2.2;
    g.add(trunk); g.add(crown); g.add(crown2);
    g.position.set(wp.x, 0, wp.z);
    g.traverse(function (m) { if (m.isMesh) m.castShadow = true; });
    scene.add(g);
  }
  function addPit(wp, c) {
    var pit = new THREE.Mesh(
      new THREE.PlaneGeometry(c * 0.92, c * 0.92),
      new THREE.MeshStandardMaterial({ color: 0x05101a, roughness: 1 })
    );
    pit.rotation.x = -Math.PI / 2;
    pit.position.set(wp.x, 0.03, wp.z);
    scene.add(pit);
    var edge = new THREE.Mesh(
      new THREE.RingGeometry(c * 0.42, c * 0.48, 4),
      new THREE.MeshBasicMaterial({ color: 0x37526a, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    edge.rotation.x = -Math.PI / 2;
    edge.rotation.z = Math.PI / 4;
    edge.position.set(wp.x, 0.04, wp.z);
    scene.add(edge);
  }
  function addLeafPile(wp) {
    var g = new THREE.Group();
    var colors = [0xffb020, 0xff8c1a, 0xffd24a];
    for (var i = 0; i < 7; i++) {
      var leaf = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.16 + Math.random() * 0.1, 0),
        new THREE.MeshStandardMaterial({ color: colors[i % 3], emissive: 0x331500, roughness: 0.7, flatShading: true })
      );
      leaf.position.set((Math.random() - 0.5) * 0.7, 0.15 + Math.random() * 0.25, (Math.random() - 0.5) * 0.7);
      g.add(leaf);
    }
    // 高亮：脉动光环 + 头顶旋转标记
    var halo = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.78, 28),
      new THREE.MeshBasicMaterial({
        color: 0xffc24d, transparent: true, opacity: 0.75,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    g.add(halo);
    var marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    marker.position.y = 1.3;
    g.add(marker);
    g.userData = { halo: halo, marker: marker };
    g.position.set(wp.x, 0, wp.z);
    g.traverse(function (m) { if (m.isMesh) m.castShadow = true; });
    scene.add(g);
    return g;
  }
  function buildTank() {
    var g = new THREE.Group();
    var white = new THREE.MeshStandardMaterial({ color: 0xe9e9e6, roughness: 0.55, metalness: 0.2 });
    var dark = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.9, metalness: 0.1 });
    var purple = new THREE.MeshStandardMaterial({ color: 0x6a3fb5, roughness: 0.45, metalness: 0.25 });
    var gray = new THREE.MeshStandardMaterial({ color: 0x9a9a98, roughness: 0.6, metalness: 0.3 });

    // 两侧履带 + 路轮 + 履带齿
    [-0.62, 0.62].forEach(function (x) {
      var track = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 1.75), dark);
      track.position.set(x, 0.3, 0);
      g.add(track);
      for (var i = 0; i < 4; i++) {
        var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.48, 14), gray);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.3, -0.65 + i * 0.43);
        g.add(wheel);
      }
      for (var t = 0; t < 9; t++) {
        var tread = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.12), gray);
        tread.position.set(x, 0.56, -0.8 + t * 0.2);
        g.add(tread);
      }
    });

    // 白色车体 + 紫色饰带
    var hull = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.44, 1.55), white);
    hull.position.y = 0.62;
    g.add(hull);
    var band = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.1, 1.57), purple);
    band.position.y = 0.55;
    g.add(band);

    // 顶部平台
    var top = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 1.0), white);
    top.position.y = 0.92;
    g.add(top);

    // 桅杆 + 传感器云台
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.5, 8), gray);
    mast.position.set(0, 1.2, -0.32);
    g.add(mast);
    var sensor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.24), dark);
    sensor.position.set(0, 1.48, -0.32);
    g.add(sensor);
    var lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 12), purple);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.48, -0.2);
    g.add(lens);

    // 前灯
    [-0.34, 0.34].forEach(function (x) {
      var lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.1, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xfff2c0 })
      );
      lamp.position.set(x, 0.66, 0.8);
      g.add(lamp);
    });

    g.traverse(function (m) { if (m.isMesh) m.castShadow = true; });
    return g;
  }

  function generateGrid(S) {
    var n = S.n;
    var grid, start, piles, tries = 0;
    while (tries++ < 200) {
      grid = [];
      for (var r = 0; r < n; r++) {
        grid[r] = [];
        for (var c = 0; c < n; c++) {
          // 出生点（左下角）周围 3×3 区域清空，保证不会被障碍物包围
          var safe = r >= n - 3 && c <= 2;
          grid[r][c] = (!safe && Math.random() < S.cfg.obstacle)
            ? [1, 2, 3][Math.floor(Math.random() * 3)]
            : 0;
        }
      }
      start = { r: n - 1, c: 0 };
      grid[start.r][start.c] = 0;
      // 目标格
      var chosen = {};
      chosen[start.r + ',' + start.c] = true;
      piles = [];
      var ok = true;
      for (var k2 = 0; k2 < S.cfg.piles; k2++) {
        var attempts = 0, placed = false;
        while (attempts++ < 60) {
          var rr = Math.floor(Math.random() * n), cc2 = Math.floor(Math.random() * n);
          var key = rr + ',' + cc2;
          // 出生点 3×3 安全区不放树叶堆
          if (rr >= n - 3 && cc2 <= 2) { continue; }
          if (grid[rr][cc2] === 0 && !chosen[key]) {
            chosen[key] = true;
            piles.push({ r: rr, c: cc2 });
            placed = true;
            break;
          }
        }
        if (!placed) { ok = false; break; }
      }
      if (!ok) { continue; }
      // 连通性 + 两两可达
      var reachable = bfs(grid, start, n);
      var allReach = piles.every(function (p) { return reachable[p.r][p.c] !== Infinity; });
      if (allReach) {
        S.grid = grid; S.start = start; S.piles = piles;
        S.userPathCells = [start];
        computeBestPath(S);
        buildPyroScene(S);
        return;
      }
    }
  }

  function bfs(grid, st, n) {
    var dist = [];
    for (var r = 0; r < n; r++) { dist[r] = []; for (var c = 0; c < n; c++) dist[r][c] = Infinity; }
    dist[st.r][st.c] = 0;
    var q = [st];
    var head = 0;
    while (head < q.length) {
      var cur = q[head++];
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < 4; i++) {
        var nr = cur.r + dirs[i][0], nc = cur.c + dirs[i][1];
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) { continue; }
        if (grid[nr][nc] !== 0) { continue; }
        if (dist[nr][nc] > dist[cur.r][cur.c] + 1) {
          dist[nr][nc] = dist[cur.r][cur.c] + 1;
          q.push({ r: nr, c: nc });
        }
      }
    }
    return dist;
  }

  // 全排列枚举最短访问顺序（TSP，起点固定）
  function computeBestPath(S) {
    var pts = [S.start].concat(S.piles);
    var m = pts.length;
    var dist = [];
    for (var i = 0; i < m; i++) {
      var d = bfs(S.grid, pts[i], S.n);
      dist[i] = [];
      for (var j = 0; j < m; j++) {
        dist[i][j] = d[pts[j].r][pts[j].c];
      }
    }
    var order = [];
    for (var k = 1; k < m; k++) order.push(k);
    var best = { len: Infinity, order: null };
    var perms = permute(order);
    perms.forEach(function (p) {
      var seq = [0].concat(p);
      var total = 0;
      for (var q = 0; q < seq.length - 1; q++) {
        var v = dist[seq[q]][seq[q + 1]];
        if (v === Infinity) { total = Infinity; break; }
        total += v;
      }
      if (total < best.len) { best.len = total; best.order = seq; }
    });
    // 重建最优路径格子（需要 BFS 父节点）
    var pathCells = [];
    for (var a = 0; a < best.order.length - 1; a++) {
      var seg = bfsPath(S.grid, pts[best.order[a]], pts[best.order[a + 1]], S.n);
      if (a > 0) { seg = seg.slice(1); }
      pathCells = pathCells.concat(seg);
    }
    S.bestPath = pathCells;
    S.bestLen = best.len;
  }

  function bfsPath(grid, st, goal, n) {
    var prev = {};
    var seen = {};
    var q = [st];
    seen[st.r + ',' + st.c] = true;
    var head = 0;
    while (head < q.length) {
      var cur = q[head++];
      if (cur.r === goal.r && cur.c === goal.c) {
        var path = [], node = cur;
        while (node) {
          path.push(node);
          node = prev[node.r + ',' + node.c];
        }
        return path.reverse();
      }
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < 4; i++) {
        var nr = cur.r + dirs[i][0], nc = cur.c + dirs[i][1];
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) { continue; }
        if (grid[nr][nc] !== 0) { continue; }
        var key = nr + ',' + nc;
        if (!seen[key]) {
          seen[key] = true;
          prev[key] = cur;
          q.push({ r: nr, c: nc });
        }
      }
    }
    return [];
  }

  function permute(arr) {
    if (arr.length <= 1) { return [arr]; }
    var res = [];
    for (var i = 0; i < arr.length; i++) {
      var rest = arr.slice(0, i).concat(arr.slice(i + 1));
      permute(rest).forEach(function (p) { res.push([arr[i]].concat(p)); });
    }
    return res;
  }

  function tryMovePyro(S, dr, dc) {
    if (S.over || S.moving) { return; }
    var last = S.userPathCells[S.userPathCells.length - 1];
    var nr = last.r + dr, nc = last.c + dc;
    if (nr < 0 || nc < 0 || nr >= S.n || nc >= S.n) { return; }
    if (S.grid[nr][nc] !== 0) { return; }
    var from = S.cellToWorld(last.r, last.c);
    var to = S.cellToWorld(nr, nc);
    S.moving = { from: from, to: to, cell: { r: nr, c: nc }, t: 0, dur: 0.42 };
    S.tank.rotation.y = Math.atan2(-dc, -dr);
  }

  function stepPyro(S, dt) {
    if (S.over) { return; }
    S.timeLeft -= dt;
    S.t = (S.t || 0) + dt;
    S.piles.forEach(function (p2) {
      if (!p2.mesh || p2.got) { return; }
      var ud = p2.mesh.userData;
      if (ud.halo) {
        var k = 0.9 + Math.sin(S.t * 4 + p2.r) * 0.22;
        ud.halo.scale.setScalar(k);
        ud.halo.material.opacity = 0.5 + Math.sin(S.t * 4 + p2.r) * 0.25;
      }
      if (ud.marker) {
        ud.marker.rotation.y += dt * 2;
        ud.marker.position.y = 1.3 + Math.sin(S.t * 3 + p2.c) * 0.12;
      }
    });
    if (S.timeLeft <= 0) {
      S.over = true;
      showFail(S);
      return;
    }
    if (S.moving) {
      var m = S.moving;
      m.t += dt;
      var p = Math.min(1, m.t / m.dur);
      var ease = p * (2 - p);
      S.tank.position.x = m.from.x + (m.to.x - m.from.x) * ease;
      S.tank.position.z = m.from.z + (m.to.z - m.from.z) * ease;
      S.tank.position.y = Math.sin(p * Math.PI) * 0.06;
      if (p >= 1) {
        S.moving = null;
        S.userSteps++;
        S.userPathCells.push(m.cell);
        paintUserStep(S, m.cell);
        // 收集树叶
        S.piles.forEach(function (pl) {
          if (!pl.got && pl.r === m.cell.r && pl.c === m.cell.c) {
            pl.got = true;
            S.cleared++;
            if (pl.mesh) {
              pl.mesh.traverse(function (x) { if (x.material && x.material.color) x.material.color.set(0x43e8cf); });
              pl.mesh.scale.setScalar(0.2);
              if (pl.mesh.userData.halo) { pl.mesh.userData.halo.visible = false; }
              if (pl.mesh.userData.marker) { pl.mesh.userData.marker.visible = false; }
            }
          }
        });
        if (S.cleared >= S.piles.length) {
          S.over = true;
          showPyroWin(S);
        }
      }
    }
  }

  function paintUserStep(S, cell) {
    var wp = S.cellToWorld(cell.r, cell.c);
    var tile = new THREE.Mesh(
      new THREE.PlaneGeometry(S.cell * 0.9, S.cell * 0.9),
      new THREE.MeshBasicMaterial({ color: 0x43e8cf, transparent: true, opacity: 0.35 })
    );
    tile.rotation.x = -Math.PI / 2;
    tile.position.set(wp.x, 0.04, wp.z);
    scene.add(tile);
  }

  function paintBestPath(S) {
    var pts = [];
    S.bestPath.forEach(function (cell) {
      var wp = S.cellToWorld(cell.r, cell.c);
      pts.push(new THREE.Vector3(wp.x, 0.12, wp.z));
      var tile = new THREE.Mesh(
        new THREE.PlaneGeometry(S.cell * 0.6, S.cell * 0.6),
        new THREE.MeshBasicMaterial({ color: 0x76b900, transparent: true, opacity: 0.4 })
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(wp.x, 0.06, wp.z);
      scene.add(tile);
    });
    var line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x76b900, linewidth: 2 })
    );
    scene.add(line);
  }

  function showPyroWin(S) {
    var userM = S.userSteps * S.cell;
    var bestM = S.bestLen * S.cell;
    var extra = userM - bestM;
    paintBestPath(S);
    var last = S.level >= 7;
    var rows =
      '<div><span>' + L.yourPath + '</span><b>' + userM + 'm</b></div>' +
      '<div><span>' + L.bestPath + '</span><b style="color:#76b900">' + bestM + 'm</b></div>' +
      (extra === 0
        ? '<div class="gp-perfect">' + L.perfect + '</div>'
        : '<div><span>' + L.vsBest + '</span><b style="color:#ffc24d">+' + extra + 'm</b></div>');
    var p = showPanel(
      '<div class="gp-icon">✓</div>' +
      '<div class="gp-title">' + L.levelClear + ' ' + S.level + '</div>' +
      '<div class="gp-rows">' + rows + '</div>' +
      '<button class="gp-btn" data-gp="next">' + (last ? L.keepChallenge : L.nextLevel) + '</button>'
    );
    p.querySelector('[data-gp=next]').addEventListener('click', function () {
      hidePanel();
      var next = S.level >= 7 ? 7 : S.level + 1;
      state = initPyro(next);
    });
  }

  /* ---------------- 输入 ---------------- */
  function onKey(e, down) {
    if (!running || !state) { return; }
    var k = e.key;
    if (state.type === 'aqua') {
      if (e.key === 'a' || e.key === 'A' || k === 'ArrowLeft') { state.input.l = down; e.preventDefault(); }
      if (e.key === 'd' || e.key === 'D' || k === 'ArrowRight') { state.input.r = down; e.preventDefault(); }
      if (e.key === 'w' || e.key === 'W' || k === 'ArrowUp') { state.input.u = down; e.preventDefault(); }
      if (e.key === 's' || e.key === 'S' || k === 'ArrowDown') { state.input.d = down; e.preventDefault(); }
      if (down && k === ' ') { fireAqua(state); e.preventDefault(); }
    } else if (state.type === 'pyro') {
      if (!down) { return; }
      if (k === 'ArrowUp' || k === 'w' || k === 'W') { tryMovePyro(state, -1, 0); e.preventDefault(); }
      if (k === 'ArrowDown' || k === 's' || k === 'S') { tryMovePyro(state, 1, 0); e.preventDefault(); }
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { tryMovePyro(state, 0, -1); e.preventDefault(); }
      if (k === 'ArrowRight' || k === 'd' || k === 'D') { tryMovePyro(state, 0, 1); e.preventDefault(); }
    }
  }
  function onKeyDn(e) { onKey(e, true); }
  function onKeyUp(e) { onKey(e, false); }
  function onPointer(e) {
    if (!running || !state || state.type !== 'aqua' || state.over) { return; }
    if (!container) { return; }
    // 点击落在结算面板/按钮上时不触发发射（避免点"下一关"误射）
    if (e.target && e.target.closest && e.target.closest('.game-panel, .game-help-panel, .game-help-btn')) { return; }
    var r = container.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { return; }
    var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    var ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    state.yaw = -nx * 0.7;
    // 纵向映射到 10°–58°，保证所有可用角度都低于 60°
    state.pitch = (10 + (ny + 1) / 2 * 48) * Math.PI / 180;
    state.pitch = Math.max(0.17, Math.min(58 * Math.PI / 180, state.pitch));
    if (e.type === 'click') { fireAqua(state); }
  }

  /* ---------------- HUD ---------------- */
  function updateHUD() {
    var el = document.getElementById('gameHUD');
    if (!el || !state) { return; }
    if (state.type === 'aqua') {
      var yawDeg = Math.round(-state.yaw * 180 / Math.PI);
      var pitDeg = Math.round(state.pitch * 180 / Math.PI);
      el.innerHTML =
        '<span>' + L.level + ' <b>' + state.level + '</b>/7</span>' +
        '<span>' + L.target + ' <b>' + state.saved + '/' + state.cfg.targets + '</b></span>' +
        '<span>⏱ <b>' + Math.ceil(state.timeLeft) + '</b>s</span>' +
        '<span>' + L.angle + ' <b>' + (yawDeg >= 0 ? '+' : '') + yawDeg + '°/' + pitDeg + '°</b></span>' +
        '<span>' + (state.cooldown > 0 ? '● ' + state.cooldown.toFixed(1) + 's' : (state.locked ? '◉ ' + (L.lock || 'LOCK') : '● ' + L.ready));
    } else {
      el.innerHTML =
        '<span>' + L.level + ' <b>' + state.level + '</b>/7</span>' +
        '<span>🍂 <b>' + state.cleared + '/' + state.piles.length + '</b></span>' +
        '<span>' + L.steps + ' <b>' + state.userSteps + '</b></span>' +
        '<span>⏱ <b>' + Math.ceil(state.timeLeft) + '</b>s</span>';
    }
  }

  function loop() {
    if (!running) { return; }
    var dt = Math.min(0.05, clock.getDelta());
    if (state.type === 'aqua') {
      stepAqua(state, dt);
      stepSplashes(dt);
    } else {
      stepPyro(state, dt);
    }
    renderer.render(scene, camera);
    updateHUD();
    rafId = requestAnimationFrame(loop);
  }

  window.NDGames = {
    start: function (canvas, type, labels) {
      this.stop();
      ENV_TEX = null;
      L = labels || {};
      clock = new THREE.Clock();
      setupRenderer(canvas);
      state = type === 'aqua' ? initAqua(1) : initPyro(1);
      running = true;
      window.addEventListener('keydown', onKeyDn);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('mousemove', onPointer);
      window.addEventListener('click', onPointer);
      rafId = requestAnimationFrame(loop);
    },
    stop: function () {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      window.removeEventListener('keydown', onKeyDn);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onPointer);
      window.removeEventListener('click', onPointer);
      hidePanel();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      if (state && state.cubeRT) { state.cubeRT.dispose(); }
      if (ENV_TEX) { ENV_TEX.dispose(); ENV_TEX = null; }
      if (cv) { cv.style.display = ''; }
      container = null; renderer = null; scene = null; state = null; cv = null; frameEl = null;
      splashes.length = 0;
    }
  };
})();
