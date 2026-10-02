/* ==========================================================================
   MAIN APPLICATION STATE MACHINE & INTERACTIVITY
   ========================================================================== */

import { ParticleEngine } from './butterflies.js';
import { AudioEngine } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {

  // Initialize Canvas Particle Engine & Web Audio Engine
  const particleEngine = new ParticleEngine('effects-canvas');
  const audioEngine = new AudioEngine();

  // Elements
  const waxSealBtn = document.getElementById('wax-seal');
  const envelope = document.getElementById('envelope');
  const sceneEnvelope = document.getElementById('scene-envelope');
  const storyContainer = document.getElementById('story-container');
  const musicControl = document.getElementById('music-control');
  const brideNameText = document.getElementById('bride-name-text');
  const ampersandText = document.getElementById('ampersand-text');
  const groomNameText = document.getElementById('groom-name-text');
  const calDay29 = document.getElementById('cal-day-29');

  // Disable browser scroll restoration so page always opens fresh at the start
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  let isEnvelopeOpened = false;

  // Reset application to pristine opening screen & 1st photo slide on every load/open
  function resetApplicationState() {
    isEnvelopeOpened = false;
    
    if (sceneEnvelope) {
      sceneEnvelope.style.display = 'flex';
      sceneEnvelope.style.opacity = '1';
      sceneEnvelope.style.pointerEvents = 'auto';
    }
    if (envelope) {
      envelope.classList.remove('opening');
    }
    if (storyContainer) {
      storyContainer.classList.add('hidden');
      storyContainer.scrollTop = 0;
    }

    // Reset Calligraphy text animations
    groomNameText?.classList.remove('written');
    ampersandText?.classList.remove('written');
    brideNameText?.classList.remove('written');

    // Scroll viewport to top
    window.scrollTo(0, 0);
  }

  // Execute initial state reset on load
  resetApplicationState();

  // Music Button Click
  musicControl.addEventListener('click', () => {
    const playing = audioEngine.toggleMusic();
    if (playing) {
      musicControl.classList.add('playing');
    } else {
      musicControl.classList.remove('playing');
    }
  });

  // ==========================================
  // UNBOXING INTERACTION: TAP WAX SEAL
  // ==========================================
  waxSealBtn?.addEventListener('click', openEnvelope);
  envelope?.addEventListener('click', openEnvelope);
  envelope?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // 1. Play wax crack sound effect
    audioEngine.playWaxCrackSound();

    // 2. Start soft ambient music on interaction
    audioEngine.startAmbientMusic();
    musicControl.classList.add('playing');

    // 3. Add 3D CSS envelope opening animation state
    envelope.classList.add('opening');

    // 4. Trigger butterfly explosion & gold dust
    particleEngine.burstEnvelopeButterflies();

    // 5. Cinematic zoom & smooth transition into story view
    setTimeout(() => {
      storyContainer.classList.remove('hidden');

      // Fade out envelope backdrop
      sceneEnvelope.style.opacity = '0';
      sceneEnvelope.style.pointerEvents = 'none';

      // Start Calligraphy Handwriting reveal sequence
      triggerCalligraphyReveal();
      
      // Ensure carousel starts cleanly on 1st slide: A promise Begins
      if (typeof updateCarousel === 'function') {
        updateCarousel(0);
      }
    }, 1400);

    setTimeout(() => {
      sceneEnvelope.style.display = 'none';
    }, 2600);
  }

  // ==========================================
  // CALLIGRAPHY HANDWRITING REVEAL SEQUENCE
  // ==========================================
  function triggerCalligraphyReveal() {
    // Reveal Groom Name: Promoth B
    setTimeout(() => {
      groomNameText.classList.add('written');
      particleEngine.spawnAmbientButterfly();
    }, 400);

    // Reveal Ampersand: &
    setTimeout(() => {
      ampersandText.classList.add('written');
    }, 1400);

    // Reveal Bride Name: Sheeba Jones W
    setTimeout(() => {
      brideNameText.classList.add('written');
      particleEngine.spawnAmbientButterfly();
    }, 2200);
  }

  // ==========================================
  // INTERACTIVE SCRATCH CARD FOR DATE REVEAL
  // ==========================================
  const scratchCanvas = document.getElementById('scratch-canvas');
  if (scratchCanvas) {
    const sCtx = scratchCanvas.getContext('2d');
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;

    // Fill gold metallic foil
    const goldGrad = sCtx.createLinearGradient(0, 0, w, h);
    goldGrad.addColorStop(0, '#E8CA85');
    goldGrad.addColorStop(0.5, '#C59B27');
    goldGrad.addColorStop(1, '#9E7D20');

    sCtx.fillStyle = goldGrad;
    sCtx.fillRect(0, 0, w, h);

    // Text on foil
    sCtx.font = '11px Montserrat, sans-serif';
    sCtx.fillStyle = '#FFFFFF';
    sCtx.textAlign = 'center';
    sCtx.letterSpacing = '1px';
    sCtx.fillText('✨ SCRATCH TO REVEAL DATE ✨', w / 2, h / 2 + 4);

    let isScratching = false;
    let scratchCount = 0;
    let isAutoRevealed = false;

    const scratch = (e) => {
      if (!isScratching || isAutoRevealed) return;
      const rect = scratchCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) * (w / rect.width);
      const y = (clientY - rect.top) * (h / rect.height);

      sCtx.globalCompositeOperation = 'destination-out';
      sCtx.beginPath();
      sCtx.arc(x, y, 26, 0, Math.PI * 2);
      sCtx.fill();

      scratchCount++;
      if (scratchCount > 5) {
        isAutoRevealed = true;
        scratchCanvas.style.transition = 'opacity 0.8s ease';
        scratchCanvas.style.opacity = '0';

        setTimeout(() => {
          scratchCanvas.style.pointerEvents = 'none';
        }, 800);
      }
    };

    scratchCanvas.addEventListener('mousedown', (e) => { isScratching = true; scratch(e); });
    scratchCanvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', () => { isScratching = false; });

    scratchCanvas.addEventListener('touchstart', (e) => { isScratching = true; scratch(e); }, { passive: true });
    scratchCanvas.addEventListener('touchmove', scratch, { passive: true });
    window.addEventListener('touchend', () => { isScratching = false; });
  }

  // ==========================================
  // LIVE COUNTDOWN TIMER TO WEDDING
  // ==========================================
  const weddingDate = new Date('October 29, 2026 18:00:00').getTime();
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
      if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
      if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
      if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================
  // CALENDAR DAY 29 TAP INTERACTION
  // ==========================================
  if (calDay29) {
    calDay29.addEventListener('click', () => {
      audioEngine.playWaxCrackSound();
      particleEngine.burstEnvelopeButterflies();

      const receptionScene = document.getElementById('scene-reception');
      if (receptionScene) {
        receptionScene.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==========================================
  // SCROLL-TRIGGERED FADE-IN & BUTTERFLY PASS
  // ==========================================
  const observerOptions = {
    threshold: 0.25
  };

  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scene-visible');
        particleEngine.spawnAmbientButterfly();
      }
    });
  }, observerOptions);

  document.querySelectorAll('.story-scene').forEach((scene) => {
    sceneObserver.observe(scene);
  });

  // ==========================================
  // PHOTO STORY CAROUSEL CONTROLLER
  // ==========================================
  const carouselTrack = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  function updateCarousel(index) {
    if (totalSlides === 0) return;
    currentSlideIndex = (index + totalSlides) % totalSlides;

    if (carouselTrack) {
      carouselTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Ensure carousel always starts cleanly on Slide 0 (1st Photo)
  updateCarousel(0);

  prevBtn?.addEventListener('click', () => updateCarousel(currentSlideIndex - 1));
  nextBtn?.addEventListener('click', () => updateCarousel(currentSlideIndex + 1));

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => updateCarousel(idx));
  });

  // Touch Swipe Support for Mobile Devices
  let touchStartX = 0;
  let touchEndX = 0;

  const carouselContainer = document.getElementById('story-carousel');
  if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    if (Math.abs(diffX) > 35) {
      if (diffX < 0) {
        updateCarousel(currentSlideIndex + 1);
      } else {
        updateCarousel(currentSlideIndex - 1);
      }
    }
  }

  // Auto-play slideshow every 4.5 seconds
  let autoSlideTimer = setInterval(() => {
    updateCarousel(currentSlideIndex + 1);
  }, 4500);

  carouselContainer?.addEventListener('pointerenter', () => clearInterval(autoSlideTimer));

});
