/* script.js
   Handles:
    - canvas particles background
    - theme toggle (dark / light)
    - timeline scroll reveal
    - slider functionality
    - small UI bits (year, nav highlight)
*/

/* -------------------------
   Utility & DOM helpers
   ------------------------- */
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

/* Set current year in footer */
$('#year').textContent = new Date().getFullYear();

/* -------------------------
   Theme toggle
   ------------------------- */
const themeBtn = $('#theme-toggle');
function toggleTheme(){
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  themeBtn.textContent = isLight ? '🌤️' : '🌙';
  localStorage.setItem('theme-light', isLight ? '1' : '0');
}
themeBtn.addEventListener('click', toggleTheme);
if(localStorage.getItem('theme-light') === '1') {
  document.documentElement.classList.add('light');
  themeBtn.textContent = '🌤️';
}

/* -------------------------
   Smooth reveal for timeline (IntersectionObserver)
   ------------------------- */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('in-view');
    }
  });
}, {threshold: .18});

$$('.event').forEach(e => obs.observe(e));

/* -------------------------
   Simple slider
   ------------------------- */
const slidesWrap = $('.slides');
const slides = $$('.slide');
const prev = $('#prev-slide');
const next = $('#next-slide');
const dotsRoot = $('#dots');

let idx = 0;
function setSlide(i){
  idx = (i + slides.length) % slides.length;
  const width = slides[0].offsetWidth + 18; // includes gap
  slidesWrap.style.transform = `translateX(${ - idx * width }px)`;
  // dots
  dotsRoot.innerHTML = '';
  slides.forEach((s, n) => {
    const btn = document.createElement('button');
    if(n === idx) btn.style.background = 'linear-gradient(90deg,#ff66b3,#7dd3fc)';
    dotsRoot.appendChild(btn);
  });
}
prev.addEventListener('click', ()=> setSlide(idx - 1));
next.addEventListener('click', ()=> setSlide(idx + 1));
window.addEventListener('resize', ()=> setSlide(idx));
setSlide(0);

/* auto-play (gentle) */
let autoplay = setInterval(()=> setSlide(idx + 1), 6000);
document.querySelectorAll('.slider').forEach(s=> {
  s.addEventListener('mouseenter', ()=> clearInterval(autoplay));
  s.addEventListener('mouseleave', ()=> autoplay = setInterval(()=> setSlide(idx + 1), 6000));
});

/* -------------------------
   Navigation: highlight active section (simple)
   ------------------------- */
const sections = ['#home','#about','#projects','#contact'].map(s => $(s));
const navLinks = $$('.nav-links a');

function onScrollNav(){
  const y = window.scrollY + innerHeight * 0.35;
  sections.forEach((sec, i) => {
    const top = sec.offsetTop;
    const h = sec.offsetHeight;
    if(y >= top && y < top + h) {
      navLinks.forEach(n => n.classList.remove('active'));
      navLinks[i].classList.add('active');
    }
  });
}
window.addEventListener('scroll', onScrollNav);
onScrollNav();

/* -------------------------
   Canvas particles background
   ------------------------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let DPR = Math.max(1, window.devicePixelRatio || 1);

function resizeCanvas(){
  DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = innerWidth * DPR;
  canvas.height = innerHeight * DPR;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

/* particle system */
let particles = [];
const PARTICLE_COUNT = Math.min(120, Math.floor((innerWidth * innerHeight) / 30000));
function rnd(a,b){ return a + Math.random() * (b - a); }

function initParticles(){
  particles = [];
  for(let i=0;i<PARTICLE_COUNT;i++){
    particles.push({
      x: rnd(0, innerWidth),
      y: rnd(0, innerHeight),
      vx: rnd(-0.3, 0.3),
      vy: rnd(-0.2, 0.2),
      r: rnd(0.6, 2.4),
      hue: rnd(190,320),
      life: rnd(60, 400)
    });
  }
}
initParticles();

let last = performance.now();
function draw(now){
  const dt = Math.min(40, now - last) / 16;
  last = now;

  // background fade (slightly transparent to create trails)
  ctx.clearRect(0,0,innerWidth,innerHeight);

  // gentle background gradient
  const grad = ctx.createLinearGradient(0,0,innerWidth, innerHeight);
  grad.addColorStop(0, 'rgba(4,8,22,0.85)');
  grad.addColorStop(1, 'rgba(2,12,28,0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,innerWidth,innerHeight);

  // draw particles
  particles.forEach((p,i) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;

    // wrap around
    if(p.x < -10) p.x = innerWidth + 10;
    if(p.x > innerWidth + 10) p.x = -10;
    if(p.y < -10) p.y = innerHeight + 10;
    if(p.y > innerHeight + 10) p.y = -10;
    if(p.life <= 0){
      // respawn
      p.x = rnd(0, innerWidth); p.y = rnd(0, innerHeight); p.life = rnd(60,400);
    }

    // glow circle
    ctx.beginPath();
    const alpha = 0.12 + Math.abs(Math.sin((p.life)/50))*0.18;
    ctx.fillStyle = `rgba(125,211,252, ${alpha})`;
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, p.r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // inner tiny dot
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,102,179, ${alpha + 0.05})`;
    ctx.arc(p.x + Math.sin(now / 800 + i) * 0.3, p.y + Math.cos(now / 1200 + i) * 0.2, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // subtle connecting lines for close particles
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if(d2 < 9000){ // proximity threshold
        ctx.beginPath();
        ctx.strokeStyle = `rgba(125,211,252, ${0.008 + (9000 - d2) / 9000 * 0.06})`;
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

/* -------------------------
   Small interactive niceties:
   - clicking nav anchors closes any active UI, focuses smooth
   ------------------------- */
$$('.nav-links a').forEach(a => {
  a.addEventListener('click', (e) => {
    // no-op but preserve smooth scroll & update hash
    document.querySelectorAll('.nav-links a').forEach(n=>n.classList.remove('active'));
    e.target.classList.add('active');
  })
});

/* -------------------------
   Accessibility: prefer-reduced-motion respects
   ------------------------- */
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
if(media.matches){
  // stop particle animation loop by breaking draw into noop
  // (we won't re-run requestAnimationFrame if reduced motion)
  // simple approach: hide canvas and clear particles
  canvas.style.display = 'none';
  // remove transitions
  document.querySelectorAll('*').forEach(el => el.style.transition = 'none');
}
