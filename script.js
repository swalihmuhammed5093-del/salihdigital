// ===== basic DOM helpers =====
const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();

// Loader hide
window.addEventListener('load', () => {
  const loader = document.getElementById('siteLoader');
  if(loader){ loader.style.opacity='0'; loader.style.pointerEvents='none'; setTimeout(()=>loader.remove(),600); }
});

// ===== theme toggle (persist) =====
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('sd_theme');
if(savedTheme) document.body.className = savedTheme;
else document.body.classList.add('dark');

function updateThemeButton(){ const isLight = document.body.classList.contains('light'); themeToggle.textContent = isLight ? '☀' : '🌙'; themeToggle.setAttribute('aria-pressed', isLight ? 'true':'false'); }
updateThemeButton();

themeToggle.addEventListener('click', ()=>{
  if(document.body.classList.contains('light')){ document.body.classList.remove('light'); document.body.classList.add('dark'); localStorage.setItem('sd_theme','dark'); }
  else { document.body.classList.remove('dark'); document.body.classList.add('light'); localStorage.setItem('sd_theme','light'); }
  updateThemeButton();
});

// ===== mobile menu & swipe support =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle && menuToggle.addEventListener('click', ()=>{
  const shown = navLinks.classList.contains('show');
  navLinks.classList.toggle('show', !shown);
  menuToggle.setAttribute('aria-expanded', (!shown).toString());
});
navLinks && navLinks.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> { if(window.innerWidth < 980) navLinks.classList.remove('show'); }));

// Swipe open/close nav (simple)
let touchStartX = 0, touchEndX = 0;
window.addEventListener('touchstart', e=> touchStartX = e.changedTouches[0].screenX, {passive:true});
window.addEventListener('touchend', e=> { touchEndX = e.changedTouches[0].screenX; const delta = touchEndX - touchStartX; if(Math.abs(delta) < 50) return; if(delta > 0 && window.innerWidth < 980) navLinks.classList.add('show'); else if(delta < 0 && window.innerWidth < 980) navLinks.classList.remove('show'); }, {passive:true});

// ===== smooth header-offset scroll for anchors =====
document.querySelectorAll('a[href^="#"], button[data-target]').forEach(link=>{
  link.addEventListener('click', function(e){
    const targetId = this.getAttribute('href') || this.dataset.target;
    if(!targetId) return;
    const target = document.querySelector(targetId);
    if(target){
      e.preventDefault();
      const headerOffset = document.querySelector('.site-header')?.offsetHeight || 70;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset - 12;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  });
});

// ===== reveal on scroll =====
function revealOnScroll(){ document.querySelectorAll('.reveal').forEach(el=>{ const rect = el.getBoundingClientRect(); if(rect.top < window.innerHeight - 60) el.classList.add('show'); }); }
window.addEventListener('scroll', revealOnScroll); window.addEventListener('resize', revealOnScroll); revealOnScroll();

// ===== typing animation =====
const typeEl = document.getElementById('typeWord');
const words = ['SalihDigital','Digital Marketer'];
let w=0, i=0, isDeleting=false, typeSpeed=90;
function typeLoop(){
  if(!typeEl) return;
  const current = words[w % words.length];
  if(!isDeleting){ typeEl.textContent = current.slice(0,i+1); i++; if(i === current.length){ isDeleting=true; setTimeout(typeLoop,1200); return; } }
  else { typeEl.textContent = current.slice(0,i-1); i--; if(i === 0){ isDeleting=false; w++; } }
  setTimeout(typeLoop, isDeleting ? typeSpeed/2 : typeSpeed);
}
typeLoop();

// ===== ripple effect =====
document.addEventListener('click', function(e){
  const target = e.target.closest('.ripple');
  if(!target) return;
  const rect = target.getBoundingClientRect();
  const ink = document.createElement('span');
  ink.className = 'ink';
  const size = Math.max(rect.width, rect.height);
  ink.style.width = ink.style.height = size + 'px';
  ink.style.left = (e.clientX - rect.left - size/2) + 'px';
  ink.style.top = (e.clientY - rect.top - size/2) + 'px';
  target.appendChild(ink);
  setTimeout(()=> ink.remove(),700);
});

// ===== carousel (buttons + touch swipe) =====
const track = document.querySelector('.carousel-track');
const slides = Array.from(document.querySelectorAll('.project-slide'));
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let index = 0;
function updateCarousel(){ if(!slides.length || !track) return; const gap = 14; const slideWidth = slides[0].getBoundingClientRect().width + gap; track.style.transform = translateX(${-index * slideWidth}px); }
nextBtn && nextBtn.addEventListener('click', ()=>{ index = Math.min(index+1, slides.length-1); updateCarousel(); });
prevBtn && prevBtn.addEventListener('click', ()=>{ index = Math.max(index-1, 0); updateCarousel(); });
window.addEventListener('resize', updateCarousel); updateCarousel();

// touch swipe for carousel
let startX=0, currentX=0, dragging=false;
if(track){
  track.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; dragging=true; }, {passive:true});
  track.addEventListener('touchmove', e=>{ if(!dragging) return; currentX = e.touches[0].clientX; const gap=14; const slideWidth = slides[0].getBoundingClientRect().width + gap; track.style.transform = translateX(${currentX - startX - index * slideWidth}px); }, {passive:true});
  track.addEventListener('touchend', e=>{ if(!dragging) return; dragging=false; const diff = startX - currentX; const threshold = 60; if(diff > threshold) index = Math.min(index+1, slides.length-1); else if(diff < -threshold) index = Math.max(index-1, 0); updateCarousel(); }, {passive:true});
}

// ===== gallery modal =====
const modal = document.getElementById('galleryModal');
const modalImg = document.getElementById('modalImage');
const slideImgs = Array.from(document.querySelectorAll('.project-slide img'));
let currentModalIndex = 0;
slides.forEach((s, idx) => {
  s.addEventListener('click', ()=> openModal(idx));
  s.addEventListener('keydown', e=>{ if(e.key==='Enter') openModal(idx); });
});
function openModal(idx){
  currentModalIndex = idx;
  const src = slideImgs[idx].currentSrc || slideImgs[idx].src;
  modalImg.src = src;
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeModal(){ modal.setAttribute('aria-hidden','true'); modalImg.src=''; document.body.style.overflow = ''; }
document.querySelector('.modal-close')?.addEventListener('click', closeModal);
document.querySelector('.modal-nav.prev')?.addEventListener('click', ()=>{ currentModalIndex = (currentModalIndex - 1 + slideImgs.length) % slideImgs.length; modalImg.src = slideImgs[currentModalIndex].currentSrc || slideImgs[currentModalIndex].src; });
document.querySelector('.modal-nav.next')?.addEventListener('click', ()=>{ currentModalIndex = (currentModalIndex + 1) % slideImgs.length; modalImg.src = slideImgs[currentModalIndex].currentSrc || slideImgs[currentModalIndex].src; });
modal?.addEventListener('click', e=> { if(e.target === modal) closeModal(); });
window.addEventListener('keydown', e=> { if(e.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') closeModal(); });

// ===== contact form fallback =====
const form = document.getElementById('contactForm');
if(form){
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = form.name.value.trim(), email = form.email.value.trim(), message = form.message.value.trim();
    const status = document.getElementById('formStatus');
    if(!name || !email || !message){ status.textContent = 'Please fill required fields'; return; }
    const body = encodeURIComponent(Name: ${name}\nEmail: ${email}\n\n${message});
    window.location.href = mailto:your.email@example.com?subject=${encodeURIComponent('Contact from SalihDigital')}&body=${body};
    status.textContent = 'Opening mail client...';
    form.reset();
  });
}