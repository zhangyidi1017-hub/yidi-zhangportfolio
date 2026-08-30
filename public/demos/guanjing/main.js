(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menu
  const menuBtn = document.getElementById("menuBtn");
  const menuClose = document.getElementById("menuClose");
  const drawer = document.getElementById("navDrawer");

  const openMenu = () => {
    drawer.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    drawer.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);
  drawer?.addEventListener("click", (e) => {
    if (e.target === drawer) closeMenu();
  });
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // Cursor glow
  const glow = document.querySelector(".cursor-glow");
  if (glow && !reduceMotion) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );

    const tickGlow = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tickGlow);
    };
    tickGlow();
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 5, 3) * 0.06}s`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Ensure above-the-fold sections are visible even if IO is delayed
  requestAnimationFrame(() => {
    document.querySelectorAll(".manifesto [data-reveal], .hero ~ * [data-reveal]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) el.classList.add("is-in");
    });
  });

  // Checklist persistence
  const checks = document.querySelectorAll("#checklist input[type='checkbox']");
  checks.forEach((input, i) => {
    const key = `guanjing-check-${i}`;
    input.checked = localStorage.getItem(key) === "1";
    input.addEventListener("change", () => {
      localStorage.setItem(key, input.checked ? "1" : "0");
    });
  });

  // Hero canvas — abstract spatial architecture field
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let t = 0;
  const nodes = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const seedNodes = () => {
    nodes.length = 0;
    const cols = 7;
    const rows = 5;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        nodes.push({
          x: (x + 0.5) / cols,
          y: (y + 0.5) / rows,
          z: Math.random(),
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }
  };

  const project = (nx, ny, nz, time) => {
    const sway = Math.sin(time * 0.4 + nx * 4 + ny * 3) * 0.02;
    const depth = 0.55 + nz * 0.45;
    const cx = w * 0.58;
    const cy = h * 0.52;
    const px = (nx - 0.5 + sway) * w * 1.15 * depth + cx * (1 - depth) * 0.35;
    const py = (ny - 0.42) * h * 1.05 * depth + cy * (1 - depth) * 0.2;
    return { x: px, y: py, s: depth };
  };

  const draw = () => {
    t += 0.008;
    ctx.clearRect(0, 0, w, h);

    // Atmospheric gradient
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0b0c10");
    g.addColorStop(0.45, "#121528");
    g.addColorStop(1, "#0d1528");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft accent bloom — stronger for contrast
    const bloom = ctx.createRadialGradient(w * 0.72, h * 0.28, 0, w * 0.72, h * 0.28, w * 0.5);
    bloom.addColorStop(0, "rgba(31,60,255,0.42)");
    bloom.addColorStop(0.55, "rgba(31,60,255,0.12)");
    bloom.addColorStop(1, "rgba(31,60,255,0)");
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, w, h);

    // Secondary warm rim light
    const rim = ctx.createRadialGradient(w * 0.15, h * 0.85, 0, w * 0.15, h * 0.85, w * 0.4);
    rim.addColorStop(0, "rgba(214,80,60,0.18)");
    rim.addColorStop(1, "rgba(214,80,60,0)");
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, w, h);

    // Axis — central spatial spine
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.08);
    ctx.lineTo(w * 0.5, h * 0.92);
    ctx.stroke();

    // Courtyard frames — nested spatial volumes
    for (let i = 0; i < 4; i++) {
      const inset = 0.12 + i * 0.07;
      const wobble = Math.sin(t * 0.7 + i) * 4;
      ctx.strokeStyle = `rgba(142,160,255,${0.12 + i * 0.08})`;
      ctx.lineWidth = 1.25;
      ctx.strokeRect(
        w * inset + wobble,
        h * (inset + 0.04),
        w * (1 - inset * 2),
        h * (1 - inset * 2 - 0.08)
      );
    }
    ctx.restore();

    // Sightline path
    ctx.save();
    ctx.beginPath();
    const pts = [
      [0.18, 0.78],
      [0.32, 0.62],
      [0.5, 0.5],
      [0.68, 0.38],
      [0.82, 0.26],
    ];
    pts.forEach(([nx, ny], i) => {
      const p = project(nx, ny, 0.7, t);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -t * 40;
    ctx.stroke();
    ctx.restore();

    // Node field
    const projected = nodes.map((n) => {
      const p = project(n.x, n.y, n.z, t);
      const pulse = 0.55 + Math.sin(t * 2 + n.pulse) * 0.45;
      return { ...p, pulse, z: n.z };
    });

    // Connections
    ctx.lineWidth = 1;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const a = projected[i];
        const b = projected[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < Math.min(w, h) * 0.18) {
          ctx.strokeStyle = `rgba(170,185,255,${(1 - dist / (Math.min(w, h) * 0.18)) * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    projected.forEach((p) => {
      const r = (2.2 + p.z * 3.2) * p.pulse;
      ctx.beginPath();
      ctx.fillStyle = `rgba(200,210,255,${0.35 + p.z * 0.45})`;
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Floating plane slabs (architectural volumes)
    for (let i = 0; i < 5; i++) {
      const nx = 0.35 + i * 0.08;
      const ny = 0.3 + Math.sin(t * 0.6 + i) * 0.04 + i * 0.06;
      const p = project(nx, ny, 0.4 + i * 0.1, t);
      const ww = 70 + i * 18;
      const hh = 10 + i * 2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-0.35 + Math.sin(t + i) * 0.04);
      ctx.fillStyle = `rgba(255,255,255,${0.03 + i * 0.015})`;
      ctx.strokeStyle = `rgba(142,160,255,${0.2 + i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(-ww / 2, -hh / 2, ww, hh);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  };

  resize();
  seedNodes();
  draw();
  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw();
  });

  document.body.classList.add("is-ready");
})();
