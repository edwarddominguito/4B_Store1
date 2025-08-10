// ------- Helpers -------
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Remove no-js class
document.body.classList.remove('no-js');

// ------- Announcement bar (promo) -------
const announce = $('#announce');
const announceClose = $('#announceClose');
const copyPromoBtn = $('#copyPromo');
const promoText = $('#promoCodeText');
const promoInline = $('#promoInline');
const PROMO_CODE = 'PRYCE50';

if (promoText) promoText.textContent = PROMO_CODE;
if (promoInline) promoInline.textContent = PROMO_CODE;

if (announce && announceClose) {
  if (localStorage.getItem('announce-dismissed') === '1') {
    announce.style.display = 'none';
  }
  on(announceClose, 'click', () => {
    announce.style.display = 'none';
    localStorage.setItem('announce-dismissed', '1');
  });
}
on(copyPromoBtn, 'click', async () => {
  try { await navigator.clipboard.writeText(PROMO_CODE); copyPromoBtn.textContent = 'Copied!'; setTimeout(()=>copyPromoBtn.textContent='Copy code',1500); }
  catch { copyPromoBtn.textContent = 'Copied'; }
});

// ------- Mobile menu -------
const burger = $('#hamburger');
const menu = $('#menu');

if (burger && menu) {
  const toggleMenu = (open) => {
    const willOpen = open ?? !menu.classList.contains('show');
    menu.classList.toggle('show', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
  };

  on(burger, 'click', () => toggleMenu());
  on(document, 'click', (e) => {
    if (!menu.classList.contains('show')) return;
    const inside = menu.contains(e.target) || burger.contains(e.target);
    if (!inside) toggleMenu(false);
  });
  on(document, 'keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
}

// ------- Year -------
const yearEl = $('#y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ------- Sticky header shadow + back-to-top -------
const header = $('.header');
const toTop = $('#toTop');
const orderbar = $('#orderbar');

const onScroll = () => {
  const y = window.scrollY || window.pageYOffset;
  if (header) header.style.boxShadow = y > 6 ? '0 6px 20px rgba(0,0,0,.06)' : 'none';
  if (toTop) toTop.classList.toggle('show', y > 600);
  if (orderbar) orderbar.style.display = y > 240 ? 'flex' : 'none';
};
on(window, 'scroll', onScroll, { passive: true });
onScroll();
on(toTop, 'click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

// ------- Smooth anchor scrolling -------
on(document, 'click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;

  e.preventDefault();
  const headerHeight = header ? header.offsetHeight + 8 : 0;
  const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
  window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
  if (menu && menu.classList.contains('show')) { menu.classList.remove('show'); burger?.setAttribute('aria-expanded','false'); }
});

// ------- Scroll reveal -------
const faders = $$('.fade');
if (faders.length && 'IntersectionObserver' in window && !prefersReduced) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('show'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  faders.forEach(el => io.observe(el));
} else { faders.forEach(el => el.classList.add('show')); }

// ------- Dark mode toggle -------
const themeToggle = $('#themeToggle');
const storageKey = '4bs-theme';
const setTheme = (mode) => {
  document.body.classList.toggle('dark', mode === 'dark');
  if (themeToggle) themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(storageKey, mode);
};
(() => {
  const saved = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
})();
on(themeToggle, 'click', () => { const next = document.body.classList.contains('dark') ? 'light' : 'dark'; setTheme(next); });

// ------- Image fallback -------
const heroImg = document.querySelector('.imgbox img');
if (heroImg) {
  const fallbacks = ['4B STORE.jpg', 'img/signage.jpg', 'img/signage.png'];
  let idxTried = 0;
  on(heroImg, 'error', () => {
    idxTried += 1;
    if (idxTried < fallbacks.length) heroImg.src = fallbacks[idxTried];
    else heroImg.closest('.imgbox')?.classList.add('hidden');
  });
}

// ------- Order -> prefill SMS -------
const orderForm = $('#order');
on(orderForm, 'submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const msg = `ORDER – 4B’s Store
Name: ${f.name.value.trim()}
Phone: ${f.phone.value.trim()}
Address: ${f.address.value.trim()}
Item: ${f.item.value}
Notes: ${f.notes.value.trim() || '—'}`;
  const number = '+639101506920';
  const url = `sms:${number}?&body=${encodeURIComponent(msg)}`;
  window.location.href = url;
});

// ------- Live Open/Closed indicator -------
const openText = $('#openText');
const openTextBar = $('#openTextBar');
const openDot = $('#openDot');
const OPEN_HOUR = 7, CLOSE_HOUR = 21; // 7:00–21:00
function isOpenNow(date = new Date()){ const h = date.getHours(); return h >= OPEN_HOUR && h < CLOSE_HOUR; }
function updateOpenStatus(){
  const open = isOpenNow();
  const label = open ? 'Open now' : 'Closed';
  if (openText) openText.textContent = label;
  if (openTextBar) openTextBar.textContent = label;
  if (openDot){ openDot.classList.toggle('open', open); openDot.classList.toggle('closed', !open); }
}
updateOpenStatus(); setInterval(updateOpenStatus, 60*1000);

// ------- Simple testimonials rotator -------
const quotes = [
  '“Super bilis ng delivery, very safe mag-install. Salamat 4B’s!”',
  '“Fair price + mabait ang staff. Will order again!”',
  '“Nag-leak test pa sila. Sobrang peace of mind.”'
];
const reviewText = $('#reviewText');
const dots = $$('.dot');
let idx = 0;
function showReview(i){ idx = i % quotes.length; if (reviewText) reviewText.textContent = quotes[idx]; dots.forEach((d,n)=>d.classList.toggle('active', n===idx)); }
dots.forEach((d,n)=> on(d,'click',()=>showReview(n)));
showReview(0);
let rot; function startRotator(){ rot=setInterval(()=>showReview(idx+1), 4000); } function stopRotator(){ clearInterval(rot); }
startRotator(); on($('#reviews'),'mouseenter',stopRotator); on($('#reviews'),'mouseleave',startRotator);

// ------- Dynamic Pricing (EDIT these) -------
const prices = { p11r: 980, p11x: 1120, p7r: 690 }; // your actual prices
['p11r','p11x','p7r'].forEach(k=>{ const el = document.getElementById(k); if (el) el.textContent = prices[k]; });
// Mirror into compare table
$('#c11r').textContent = prices.p11r;
$('#c11x').textContent = prices.p11x;
$('#c7r').textContent  = prices.p7r;

// ------- Delivery ETA estimator -------
const etaResult = $('#etaResult');
const areaSel = $('#area');
const baseETA = { 'San Isidro': 35, 'San Roque': 25, 'San Vicente': 40, 'Poblacion': 20, 'Bagong Silang': 30 };
function trafficMultiplier(){
  const h = new Date().getHours();
  if (h >= 6 && h < 9) return 1.3;      // morning traffic
  if (h >= 16 && h < 19) return 1.35;   // rush hour
  return 1.0;
}
function formatETA(mins){ if (!mins) return '—'; return `${Math.round(mins)} mins (estimate)`; }
on(areaSel, 'change', () => {
  const area = areaSel.value;
  if (!area || !baseETA[area]) { etaResult.textContent = '—'; return; }
  const eta = baseETA[area] * trafficMultiplier();
  etaResult.textContent = formatETA(eta);
});

// ------- GCash Modal -------
const qrModal = $('#qrModal');
const qrOpeners = ['#openQR','#openQR2','#openQR3'].map(s => $(s)).filter(Boolean);
const qrClose = $('#qrClose');
const qrBackdrop = $('#qrBackdrop');

function openQR(){
  qrModal.classList.add('open');
  qrModal.setAttribute('aria-hidden','false');
}
function closeQR(){
  qrModal.classList.remove('open');
  qrModal.setAttribute('aria-hidden','true');
}
qrOpeners.forEach(btn => on(btn,'click', openQR));
on(qrClose,'click', closeQR);
on(qrBackdrop,'click', closeQR);
on(document,'keydown',(e)=>{ if(e.key==='Escape') closeQR(); });

// Copy chips
$$('.chip').forEach(chip=>{
  on(chip,'click',()=>{
    const target = $(chip.dataset.copy);
    if (!target) return;
    navigator.clipboard.writeText(target.textContent.trim()).then(()=>{
      chip.textContent = 'Copied'; setTimeout(()=>chip.textContent='Copy',1200);
    });
  });
});
