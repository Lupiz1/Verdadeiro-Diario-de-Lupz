/* ============================================
   LUPZ — MINHA HISTÓRIA
   script.js
   ============================================ */

// ── PARTICLES ──────────────────────────────
const canvas  = document.getElementById('particles');
const ctx     = canvas.getContext('2d');
let particles = [];
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.size = Math.random() * 1.5 + 0.3;
    this.spd  = Math.random() * 0.3 + 0.05;
    this.dir  = Math.random() * Math.PI * 2;
    this.life = Math.random();
    this.type = Math.random() > 0.7 ? 'cross' : 'dot';
    this.col  = Math.random() > 0.5
      ? `rgba(0, 229, 255, ${Math.random() * 0.5 + 0.1})`
      : `rgba(26, 107, 255, ${Math.random() * 0.4 + 0.05})`;
  }

  update() {
    this.x   += Math.cos(this.dir) * this.spd;
    this.y   += Math.sin(this.dir) * this.spd;
    this.life += 0.002;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }

  draw() {
    const alpha = Math.sin(this.life * Math.PI) * 0.8;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle   = this.col;
    ctx.strokeStyle = this.col;
    ctx.lineWidth   = 0.8;

    if (this.type === 'cross') {
      const s = this.size * 2;
      ctx.beginPath();
      ctx.moveTo(this.x - s, this.y);
      ctx.lineTo(this.x + s, this.y);
      ctx.moveTo(this.x, this.y - s);
      ctx.lineTo(this.x, this.y + s);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// Create particles
for (let i = 0; i < 120; i++) particles.push(new Particle());

// Draw faint connection lines between close particles
function drawConnections() {
  const maxDist = 100;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.06;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();


// ── SCROLL REVEAL ──────────────────────────
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-up, .reveal-line').forEach(el => {
  revealObserver.observe(el);
});


// ── NAV SCROLL ─────────────────────────────
const nav     = document.getElementById('nav');
const navFill = document.getElementById('navFill');
const navLinks = document.querySelectorAll('.nav-link');
const chapters = document.querySelectorAll('.chapter');

// Update progress bar + active link
window.addEventListener('scroll', () => {
  const scrollY   = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const pct       = (scrollY / maxScroll) * 100;

  navFill.style.width = pct + '%';

  // Scrolled class for compact nav
  nav.classList.toggle('scrolled', scrollY > 80);

  // Active nav link
  let current = '';
  chapters.forEach(ch => {
    const top = ch.offsetTop - 160;
    if (scrollY >= top) current = ch.id;
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === current);
  });
});


// ── TYPING CURSOR (terminal boxes) ─────────
document.querySelectorAll('.terminal-body').forEach(box => {
  box.addEventListener('mouseenter', () => {
    const lines = box.querySelectorAll('p');
    lines.forEach((line, i) => {
      line.style.opacity   = '0';
      line.style.transform = 'translateX(-6px)';
      line.style.transition = `opacity 0.2s ${i * 80}ms, transform 0.2s ${i * 80}ms`;
      requestAnimationFrame(() => {
        line.style.opacity   = '1';
        line.style.transform = 'translateX(0)';
      });
    });
  });
});


// ── GLITCH ON HOVER (name badges) ──────────
document.querySelectorAll('.badge-name').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.classList.add('glitch-fast');
    setTimeout(() => el.classList.remove('glitch-fast'), 400);
  });
});


// ── RANDOM DATA FLICKER in footer ──────────
const monoEls = document.querySelectorAll('.footer-mono');
const chars   = '01アイウエオカキクケコABCDEF';

function flicker() {
  monoEls.forEach(el => {
    if (Math.random() > 0.85) {
      const orig = el.dataset.orig || el.textContent;
      el.dataset.orig = orig;
      const idx = Math.floor(Math.random() * orig.length);
      const arr = orig.split('');
      arr[idx] = chars[Math.floor(Math.random() * chars.length)];
      el.textContent = arr.join('');
      setTimeout(() => { el.textContent = orig; }, 120);
    }
  });
}
setInterval(flicker, 600);


// ── SMOOTH NAV LINKS (prevent jump) ────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// ── CURSOR GLOW ────────────────────────────
const glow = document.createElement('div');
glow.id = 'cursor-glow';
Object.assign(glow.style, {
  position:        'fixed',
  width:           '200px',
  height:          '200px',
  borderRadius:    '50%',
  pointerEvents:   'none',
  zIndex:          '0',
  background:      'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)',
  transform:       'translate(-50%, -50%)',
  transition:      'left 0.12s ease, top 0.12s ease',
  mixBlendMode:    'screen',
});
document.body.appendChild(glow);

window.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});