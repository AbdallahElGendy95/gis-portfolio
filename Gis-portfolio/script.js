// ---------- Hero point-cloud canvas ----------
  const canvas = document.getElementById('cloud');
  const ctx = canvas.getContext('2d');
  let w, h, points = [];
  const POINT_COUNT = 110;
  const LINK_DIST = 120;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function initPoints() {
    points = Array.from({length: POINT_COUNT}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }
  let mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of points) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const md = Math.sqrt(dx*dx + dy*dy);
      if (md < 140) { p.x += dx/md * 0.6; p.y += dy/md * 0.6; }
    }
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(92,225,214,${0.14 * (1 - d / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const p of points) {
      ctx.fillStyle = 'rgba(92,225,214,0.75)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', () => { resize(); initPoints(); });
  resize(); initPoints(); tick();

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // language bars
  const langBars = document.querySelectorAll('.lang-bar-fill');
  const langIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + '%';
        langIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  langBars.forEach(b => langIo.observe(b));

  // ---------- Project map + log (linked hover) ----------
  const projects = [
    { id: 1, x: 300, y: 120, name: 'Jeddah Airport', date: 'JAN 2026 — PRESENT', desc: 'Processed and classified large-scale 3D LiDAR and mobile-mapping data for runways, infrastructure, and facilities; extracted 2D as-built drawings and 3D models to support engineering workflows and airport asset management.', tools: 'AutoCAD · MicroStation · Orbit3D · TBC · ArcGIS Pro' },
    { id: 2, x: 260, y: 200, name: 'Saudi National Water Company (NWC)', date: 'JAN — DEC 2025', desc: 'Processed point cloud and mobile-mapping data for technical reporting across national water infrastructure.', tools: 'Mobile Mapping · AutoCAD · ArcGIS Pro · TMX' },
    { id: 3, x: 300, y: 90, name: 'Drone Surveying — Al-Madinah Region', date: '2024', desc: 'Processed drone-collected point cloud data and integrated it into ArcGIS and Civil 3D for technical documentation.', tools: 'Mobile Mapping · TMX · AutoCAD' },
    { id: 4, x: 230, y: 160, name: 'Liwan Compound', date: '2024', desc: 'Performed topographic surveys for a residential compound, preparing accurate maps and site layouts for technical documentation.', tools: 'Mobile Mapping · TMX · AutoCAD' },
    { id: 5, x: 250, y: 140, name: 'King Abdulaziz Road', date: '2023', desc: 'Conducted mobile mapping surveys for road alignment and infrastructure, producing 3D maps and integrating results into ArcGIS and Civil 3D.', tools: 'Mobile Mapping · TMX · AutoCAD' },
  ];

  const pinsG = document.getElementById('pins');
  const logEl = document.getElementById('project-log');

  projects.forEach(p => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'pin cursor-pointer');
    g.setAttribute('data-id', p.id);
    g.innerHTML = `
      <circle cx="${p.x}" cy="${p.y}" r="10" fill="rgba(92,225,214,0.12)"/>
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#5CE1D6" stroke="#0A121F" stroke-width="1.5"/>
    `;
    pinsG.appendChild(g);

    const card = document.createElement('div');
    card.className = 'log-card reveal border border-survey-line rounded-sm p-5 bg-survey-panel/40 cursor-pointer transition-colors hover:border-survey-cyan';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="flex justify-between items-start gap-4 mb-2">
        <h3 class="font-display text-lg">${p.name}</h3>
        <span class="tick text-[10px] text-survey-amber whitespace-nowrap pt-1">${p.date}</span>
      </div>
      <p class="text-survey-mute text-sm leading-relaxed mb-3">${p.desc}</p>
      <p class="tick text-[11px] text-survey-cyan">${p.tools}</p>
    `;
    logEl.appendChild(card);
    io.observe(card);
  });

  function setActive(id) {
    document.querySelectorAll('.pin').forEach(el => el.classList.toggle('active', el.dataset.id == id));
    document.querySelectorAll('.log-card').forEach(el => el.classList.toggle('border-survey-cyan', el.dataset.id == id));
  }
  document.querySelectorAll('.pin, .log-card').forEach(el => {
    el.addEventListener('mouseenter', () => setActive(el.dataset.id));
  });

  // ---------- Active nav link on scroll ----------
  const sections = ['about','experience','projects','skills','contact'].map(id => document.getElementById(id));
  const navLinks = document.querySelectorAll('header nav a');
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('text-survey-cyan', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => s && navIo.observe(s));
