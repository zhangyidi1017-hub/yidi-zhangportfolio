import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ===== Lenis Smooth Scroll =====
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);

// ===== DOM =====
const menuOpen = document.getElementById('menuOpen');
const menuClose = document.getElementById('menuClose');
const mobileMenu = document.getElementById('mobileMenu');

// ===== Mobile Menu =====
function openMenu() {
  mobileMenu.classList.add('mobile-menu--open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  lenis.stop();
}

function closeMenu() {
  mobileMenu.classList.remove('mobile-menu--open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  lenis.start();
}

menuOpen?.addEventListener('click', openMenu);
menuClose?.addEventListener('click', closeMenu);
mobileMenu?.querySelectorAll('.mobile-menu__link').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// ===== Smooth Anchor Scroll =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const header = document.getElementById('header');
      const offset = -(header?.offsetHeight || 72);
      lenis.scrollTo(target, { offset });
    }
  });
});

// ===== Card Flip =====
function syncFlipCardVideos() {
  document.querySelectorAll('.flip-card').forEach((card) => {
    const video = card.querySelector('.work-video');
    if (!video) return;

    if (!card.classList.contains('flip-card--flipped')) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  document.querySelectorAll('.work-site__video').forEach((video) => {
    video.play().catch(() => {});
  });
}

document.querySelectorAll('[data-flip]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.flip;
    const card = document.getElementById(`flip-${id}`);
    if (!card) return;
    const isFlipped = card.classList.contains('flip-card--flipped');

    document.querySelectorAll('.flip-card').forEach((c) => {
      c.classList.remove('flip-card--flipped');
    });
    document.querySelectorAll('[data-flip]').forEach((b) => {
      b.textContent = '查看项目 →';
    });

    if (!isFlipped) {
      card.classList.add('flip-card--flipped');
      btn.textContent = '关闭 ↑';
    }

    syncFlipCardVideos();
  });
});

// Also flip on folder hover (desktop)
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.flip-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('flip-card--flipped');
      syncFlipCardVideos();
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('flip-card--flipped');
      syncFlipCardVideos();
    });
  });
}

syncFlipCardVideos();

// ===== Scroll Reveal — Works =====
document.querySelectorAll('.work').forEach((work, i) => {
  ScrollTrigger.create({
    trigger: work,
    start: 'top 85%',
    onEnter: () => work.classList.add('work--visible'),
    once: true,
  });

  gsap.from(work.querySelector('.work__info'), {
    scrollTrigger: { trigger: work, start: 'top 80%', once: true },
    y: 40,
    opacity: 0,
    duration: 0.9,
    delay: i * 0.05,
    ease: 'power3.out',
  });
});

// ===== Scroll Reveal — About =====
gsap.from('.about__content > *', {
  scrollTrigger: { trigger: '.about', start: 'top 75%', once: true },
  y: 50,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,
  ease: 'power3.out',
});

// ===== Active Nav =====
const sections = document.querySelectorAll('section[id], #contact, #work, #education, #skills');
const navLinks = document.querySelectorAll('[data-nav]');

// ===== Contact Copy =====
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy || '';
    const status = button.closest('.about__profile')?.querySelector('.about__copy-status');
    const originalLabel = button.dataset.copyLabel || '复制';

    button.dataset.copyLabel = '已复制';
    if (status) status.textContent = `已复制：${value}`;
    window.setTimeout(() => {
      button.dataset.copyLabel = originalLabel;
      if (status) status.textContent = '';
    }, 1800);

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement('textarea');
      input.value = value;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

  });
});

ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const scrollPos = self.scroll();
    let current = 'about';
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop - 150) {
        current = section.id;
      }
    });
    if (current === 'about-detail') current = 'about';
    navLinks.forEach((link) => {
      link.style.opacity = link.dataset.nav === current ? '1' : '0.45';
    });
  },
});
