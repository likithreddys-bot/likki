/* Interactive hero.
 *
 * The hero is split into three zones: left, center and right. The cursor only
 * picks a zone; the character never follows it. Left and right trigger a short
 * look that returns to the working pose after a hold. Center plays the greeting.
 *
 * Two renderers share one director:
 *   - Photo renderer (default): animates the cut-out photo and laptop lid.
 *   - Frame renderer: plays frames exported from a character video, used when
 *     frames/manifest.json exists (see frames/README.md).
 */
(() => {
  "use strict";

  const hero = document.querySelector(".hero");
  if (!hero) return;

  const $ = (sel) => hero.querySelector(sel);
  const stage = $(".stage");
  const glow = $(".hero__glow");
  const talk = $(".talk");
  const cue = $(".cue");
  const hint = $("[data-hint]");
  const zoneDots = hero.querySelectorAll("[data-zone-dot]");

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 760px)");

  const LOOK_HOLD = 2600;
  const MESSAGES = {
    left: "Anyone here on the left?",
    right: "Anyone here on the right?",
    greet: ["Hey, it’s you!", "Hiiii!", "Check out the portfolio"],
  };

  /* ---------- Shared glow ---------- */

  const GLOW = { idle: 0.6, left: 0.66, right: 0.66, greet: 1, point: 0.92 };
  const GLOW_X = { idle: 0, left: -4, right: 4, greet: 0, point: 0 };
  const glowNow = { o: GLOW.idle, x: 0 };
  const glowTo = { o: GLOW.idle, x: 0 };

  /* ---------- Photo renderer ---------- */

  function createPhotoRenderer() {
    const figure = $(".figure");
    const lid = $(".laptop");
    const rimL = $(".figure__rim--left");
    const rimR = $(".figure__rim--right");

    // x/y in % of the figure, angles in degrees. rx tips the head toward the laptop.
    const POSES = {
      idle:  { x: 0,    y: 0,    rx: 3,   ry: 0,  r: 0,    s: 1,     lid: 0, rimL: 0, rimR: 0 },
      left:  { x: -1.8, y: -0.6, rx: 0.5, ry: 8,  r: -1.4, s: 1.012, lid: 0, rimL: 1, rimR: 0 },
      right: { x: 1.8,  y: -0.6, rx: 0.5, ry: -8, r: 1.4,  s: 1.012, lid: 0, rimL: 0, rimR: 1 },
      greet: { x: 0,    y: -2.4, rx: 0,   ry: 0,  r: 0,    s: 1.035, lid: 1, rimL: 0.35, rimR: 0.35 },
      point: { x: 0,    y: -1.4, rx: 4,   ry: 0,  r: 0,    s: 1.03,  lid: 1, rimL: 0.2, rimR: 0.2 },
    };

    const now = { ...POSES.idle };
    let to = POSES.idle;
    let wave = 0;
    let waveTo = 0;

    return {
      durations: { lookIn: 0, greetHi: 1100, greetPoint: 2600, greetDone: 6400 },
      pose(name) { to = POSES[name] || POSES.idle; },
      wave(on) { waveTo = on ? 1 : 0; },
      update(dt, t) {
        const k = 1 - Math.exp(-dt * 6);
        for (const key in now) now[key] += (to[key] - now[key]) * k;
        wave += (waveTo - wave) * (1 - Math.exp(-dt * 5));

        const still = reduceMotion.matches;
        const breathe = still ? 0 : Math.sin(t * 1.7) * 0.004 * (1 - now.lid);
        const sway = still ? 0 : Math.sin(t * 8.5) * 1.8 * wave;
        const hop = still ? 0 : Math.abs(Math.sin(t * 8.5)) * -0.5 * wave;

        figure.style.transform =
          `translate3d(${now.x.toFixed(3)}%, ${(now.y + hop).toFixed(3)}%, 0) ` +
          `rotateX(${now.rx.toFixed(3)}deg) rotateY(${now.ry.toFixed(3)}deg) ` +
          `rotate(${(now.r + sway).toFixed(3)}deg) scale(${(now.s + breathe).toFixed(4)})`;
        lid.style.transform =
          `translate3d(0, ${(now.lid * 70).toFixed(2)}%, 0) rotateX(${(now.lid * -14).toFixed(2)}deg) scale(${(1 - now.lid * 0.04).toFixed(4)})`;
        rimL.style.opacity = now.rimL.toFixed(3);
        rimR.style.opacity = now.rimR.toFixed(3);
      },
    };
  }

  /* ---------- Frame renderer ---------- */

  async function loadFrameRenderer() {
    let manifest;
    try {
      const res = await fetch("frames/manifest.json", { cache: "no-cache" });
      if (!res.ok) return null;
      manifest = await res.json();
    } catch {
      return null;
    }

    const { pattern, start = 1, count, fps = 24, pad = 4, segments } = manifest;
    if (!pattern || !count || !segments || !segments.work || !segments.greet) return null;

    const urls = Array.from({ length: count }, (_, i) =>
      pattern.replace("{i}", String(start + i).padStart(pad, "0"))
    );
    const images = await Promise.all(urls.map((src) => new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    })));
    if (images.some((img) => !img)) return null;

    const canvas = document.createElement("canvas");
    canvas.className = "frames";
    canvas.width = images[0].naturalWidth;
    canvas.height = images[0].naturalHeight;
    const ctx = canvas.getContext("2d");
    stage.style.aspectRatio = `${canvas.width} / ${canvas.height}`;
    stage.prepend(canvas);
    hero.classList.add("has-frames");

    const seg = (key) => (segments[key] || segments.work).map((n) => n - start);
    const segSeconds = (key) => { const [a, b] = seg(key); return (b - a) / fps; };

    let head = seg("work")[0];
    let dir = 1;
    let mode = { type: "loop" };
    let fadeFrom = null;
    let fade = 1;
    let drawn = -1;

    const jump = (frame) => {
      fadeFrom = images[Math.round(head)];
      fade = 0;
      head = frame;
    };
    const playTo = (frame, then) => { mode = { type: "play", to: frame, then }; };
    const loopWork = () => { mode = { type: "loop" }; dir = 1; };

    let current = "idle";

    return {
      durations: {
        lookIn: segSeconds("left") * 1000,
        greetHi: segSeconds("greet") * 350,
        greetPoint: segSeconds("greet") * 700,
        greetDone: segSeconds("greet") * 1000 + 2200,
      },
      pose(name) {
        if (name === current || name === "point") return;
        const prev = current;
        current = name;
        if (name === "left" || name === "right") {
          const [a, b] = seg(name);
          jump(a);
          playTo(b);
        } else if (name === "greet") {
          const [a, b] = seg("greet");
          jump(a);
          playTo(b);
        } else if (prev === "left" || prev === "right") {
          // Play the look backwards so she turns back, then resume working.
          const [a] = seg(prev);
          playTo(a, () => { jump(seg("work")[1]); loopWork(); });
        } else {
          jump(seg("work")[0]);
          loopWork();
        }
      },
      wave() {},
      update(dt) {
        const step = fps * dt;
        if (mode.type === "loop") {
          const [a, b] = seg("work");
          head += dir * step;
          if (head >= b) { head = b; dir = -1; }
          if (head <= a) { head = a; dir = 1; }
        } else if (mode.type === "play") {
          const d = mode.to - head;
          if (Math.abs(d) <= step) {
            head = mode.to;
            const then = mode.then;
            mode = { type: "hold" };
            if (then) then();
          } else {
            head += Math.sign(d) * step;
          }
        }

        fade = Math.min(1, fade + dt / 0.22);
        const frame = Math.round(head);
        if (frame === drawn && fade === 1) return;
        drawn = frame;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (fadeFrom && fade < 1) {
          ctx.globalAlpha = 1;
          ctx.drawImage(fadeFrom, 0, 0);
          ctx.globalAlpha = fade;
        }
        ctx.drawImage(images[frame], 0, 0);
        ctx.globalAlpha = 1;
      },
    };
  }

  /* ---------- Director ---------- */

  let renderer = createPhotoRenderer();
  let zone = null;
  let dwell = 0;
  let timers = [];

  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  function setPose(name) {
    renderer.pose(name);
    glowTo.o = GLOW[name];
    glowTo.x = GLOW_X[name];
    hero.dataset.pose = name;
  }

  function say(lines, { append = false } = {}) {
    talk.classList.remove("is-leaving");
    if (!append) talk.replaceChildren();
    for (const text of [].concat(lines)) {
      const p = document.createElement("p");
      p.className = "talk__line";
      p.textContent = text;
      talk.append(p);
    }
  }

  function hush() {
    if (!talk.childElementCount) return;
    talk.classList.add("is-leaving");
    later(360, () => { talk.replaceChildren(); talk.classList.remove("is-leaving"); });
  }

  function look(side) {
    clearTimers();
    renderer.wave(false);
    cue.classList.remove("is-called");
    setPose(side);
    say(MESSAGES[side]);
    later(Math.max(LOOK_HOLD, renderer.durations.lookIn + 1800), () => {
      setPose("idle");
      hush();
    });
  }

  function greet() {
    clearTimers();
    const d = renderer.durations;
    setPose("greet");
    say(MESSAGES.greet[0]);
    later(d.greetHi, () => {
      renderer.wave(true);
      say(MESSAGES.greet[1], { append: true });
    });
    later(d.greetPoint, () => {
      renderer.wave(false);
      setPose("point");
      say(MESSAGES.greet[2], { append: true });
      talk.lastElementChild.classList.add("talk__line--small");
      cue.classList.add("is-called");
    });
    later(d.greetDone, () => {
      setPose("idle");
      hush();
      cue.classList.remove("is-called");
    });
  }

  function showZone(name) {
    hero.dataset.zone = name || "none";
    zoneDots.forEach((el) => el.classList.toggle("is-on", el.dataset.zoneDot === name));
  }

  function enterZone(next) {
    if (next === zone) return;
    zone = next;
    showZone(next);
    clearTimeout(dwell);
    // A short dwell keeps a quick sweep across the hero from firing every zone.
    dwell = setTimeout(() => {
      if (next === "center") greet();
      else if (next) look(next);
    }, 120);
  }

  function zoneAt(clientX) {
    const box = hero.getBoundingClientRect();
    const x = (clientX - box.left) / box.width;
    return x < 1 / 3 ? "left" : x > 2 / 3 ? "right" : "center";
  }

  hero.addEventListener("pointermove", (e) => {
    if (compact.matches || e.pointerType === "touch") return;
    enterZone(zoneAt(e.clientX));
  });
  hero.addEventListener("pointerleave", () => {
    if (compact.matches) return;
    clearTimeout(dwell);
    zone = null;
    showZone(null);
  });

  // Touch and small screens: tap anywhere on the hero. Phones get the greeting only.
  hero.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch" && !compact.matches) return;
    if (e.target.closest("a")) return;
    if (compact.matches) { zone = null; enterZone("center"); return; }
    zone = null;
    enterZone(zoneAt(e.clientX));
  });

  function syncHint() {
    const touch = compact.matches || matchMedia("(hover: none)").matches;
    hint.textContent = touch ? "Tap to call me!" : "Move cursor to call me!";
  }
  syncHint();
  compact.addEventListener("change", syncHint);

  /* ---------- Loop ---------- */

  let visible = true;
  let raf = 0;
  let last = performance.now();

  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    renderer.update(dt, ts / 1000);

    const k = 1 - Math.exp(-dt * 4);
    glowNow.o += (glowTo.o - glowNow.o) * k;
    glowNow.x += (glowTo.x - glowNow.x) * k;
    glow.style.opacity = glowNow.o.toFixed(3);
    glow.style.transform = `translate3d(${glowNow.x.toFixed(2)}%, 0, 0) scale(${(0.92 + glowNow.o * 0.12).toFixed(4)})`;

    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    // On phones there is no cursor, so greet once when the hero is in view.
    if (entry.intersectionRatio > 0.5 && compact.matches && !hero.dataset.greeted) {
      hero.dataset.greeted = "1";
      setTimeout(() => { zone = null; enterZone("center"); }, 900);
    }
  }, { threshold: [0, 0.5] }).observe(hero);

  setPose("idle");
  raf = requestAnimationFrame(frame);

  loadFrameRenderer().then((frames) => {
    if (frames) {
      renderer = frames;
      setPose(hero.dataset.pose || "idle");
    }
  });
})();
