/**
 * 花木兰 — The Legend of Hua Mulan
 * Application Logic — mirrors jade-rabbit UX pattern exactly
 * (single-page, chapter scroll, fixed moondial, moon-phase tray)
 */
(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────
  const state = {
    lang: 'zh',
    started: false,
    heroDismissed: false,
    currentChapter: 0,
    totalChapters: STORY.chapters.length,
    isPlaying: false,
    autoPlay: false,
    currentAudioChapter: -1
  };

  // ── DOM refs ─────────────────────────────────────────────────────────
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const hero         = $('#hero');
  const beginBtn     = $('#begin-btn');
  const header       = $('#header');
  const moonTray     = $('#moonTray');
  const moonProgress = $('#moonProgress');
  const moonBar      = $('#moonBar');
  const storyEl      = $('#story');
  const audioPlayer  = $('#audioPlayer');
  const prevBtn      = $('#prevBtn');
  const nextBtn      = $('#nextBtn');
  const langEn       = $('#langEn');
  const langZh       = $('#langZh');
  const autoplayBtn  = $('#autoplayBtn');
  const moondialLabelZh  = $('#moondialLabelZh');
  const moondialLabelEn  = $('#moondialLabelEn');
  const moondialPlay     = $('#moondialPlay');
  const moondialBand     = $('#moondialBand');
  const moondialFill     = $('#moondialFill');
  const moondialCursor   = $('#moondialCursor');
  const moondialTime     = $('#moondialTime');
  const inkMotesLayer    = $('#inkMotesLayer');

  // ── Helpers ──────────────────────────────────────────────────────────
  const CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  // Map chapter id → audio filename (page1..page5, not chapter-1..8)
  function audioSrc(chapterId, lang) {
    return `audio/${lang}-page${chapterId}.mp3`;
  }

  // ── Ink-mote particles (paper-glow atmosphere) ────────────────────────
  function spawnInkMote() {
    if (!inkMotesLayer) return;
    const el = document.createElement('div');
    const x = Math.random() * 100;
    const dur = 5 + Math.random() * 6;
    const size = 1 + Math.random() * 2;
    const drift = (Math.random() - 0.5) * 30;
    el.style.cssText = `
      position: absolute; left: ${x}%; bottom: -10px;
      width: ${size}px; height: ${size}px;
      background: var(--ink-mist); border-radius: 50%; opacity: 0;
      animation: moteRise ${dur}s ease-in forwards;
      transform: translateX(${drift}px);
    `;
    inkMotesLayer.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000);
  }

  // Inject keyframes once
  (function injectKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes moteRise {
        0%   { opacity: 0; transform: translateY(0) scale(0); }
        15%  { opacity: 0.12; }
        50%  { opacity: 0.06; }
        85%  { opacity: 0.02; }
        100% { opacity: 0; transform: translateY(-100vh) scale(0.3); }
      }
    `;
    document.head.appendChild(style);
  })();

  let moteInterval;
  function startInkMotes() {
    spawnInkMote();
    moteInterval = setInterval(spawnInkMote, 2000);
  }

  // ── Chapter rendering ────────────────────────────────────────────────
  function renderChapters() {
    storyEl.innerHTML = '';
    STORY.chapters.forEach((ch, idx) => {
      const article = document.createElement('article');
      article.className = `story-chapter${idx === 0 ? ' active' : ''}`;
      article.dataset.chapter = ch.id;

      const numCN = CN_NUM[ch.id] || String(ch.id);

      article.innerHTML = `
        <div class="chapter-badge">
          <span class="chapter-num">Chapter ${ch.id} · 第${numCN}章</span>
        </div>
        <div class="illustration-frame">
          <img src="images/${ch.image}" alt="${ch.title.en} — ${ch.title.zh}" loading="${idx === 0 ? 'eager' : 'lazy'}" width="1024" height="576">
          <div class="illustration-vignette"></div>
          <div class="illustration-moonglow" data-moonglow></div>
        </div>
        <div class="chapter-titles">
          <h2 class="chapter-title-en">${ch.title.en}</h2>
          <h2 class="chapter-title-zh">${ch.title.zh}</h2>
          <p class="chapter-title-pinyin">${ch.title.pinyin}</p>
        </div>
        <div class="chapter-audio">
          <button class="audio-play-btn" data-chapter="${ch.id}" aria-label="Play chapter ${ch.id}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="audio-progress" data-chapter="${ch.id}">
            <div class="audio-progress-fill" data-chapter="${ch.id}"></div>
          </div>
          <span class="audio-time" data-chapter="${ch.id}">0:00</span>
        </div>
        <div class="chapter-divider"><div class="chapter-divider__line"></div><div class="chapter-divider__sprig" data-sprig>🌸</div><div class="chapter-divider__line"></div></div>
        <div class="chapter-content">
          <div class="content-en">${ch.content.en.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
          <div class="content-zh-grid">
            <p class="zh-text">${ch.content.zh}</p>
            <p class="pinyin-line">${ch.content.pinyin}</p>
          </div>
        </div>
      `;
      storyEl.appendChild(article);
    });
  }

  // ── Moon-phase chapter tray ──────────────────────────────────────────
  function renderMoonTray() {
    moonTray.innerHTML = '';
    STORY.chapters.forEach((ch, idx) => {
      const chip = document.createElement('button');
      chip.className = `moon-chip${idx === 0 ? ' active' : ''}`;
      chip.dataset.ch = ch.id;
      chip.setAttribute('aria-label', `Chapter ${ch.id}: ${ch.title.en}`);
      chip.addEventListener('click', () => goToChapter(idx));
      moonTray.appendChild(chip);
    });
  }

  // ── Navigation ───────────────────────────────────────────────────────
  function goToChapter(idx) {
    if (idx < 0 || idx >= state.totalChapters) return;
    if (idx === state.currentChapter && state.heroDismissed) return;

    state.currentChapter = idx;

    // Stop audio
    if (state.isPlaying) {
      audioPlayer.pause();
      state.isPlaying = false;
    }

    // Show/hide chapters
    $$('.story-chapter').forEach((el, i) => {
      const active = i === idx;
      el.classList.toggle('active', active);
      el.style.display = active ? 'block' : 'none';
    });

    // Moon tray
    $$('.moon-chip').forEach((chip, i) => {
      chip.classList.toggle('active', i === idx);
      chip.classList.toggle('visited', i < idx);
    });

    // Prev/next buttons
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === state.totalChapters - 1;

    // Moondial labels
    const ch = STORY.chapters[idx];
    moondialLabelZh.textContent = `第${CN_NUM[ch.id]}章`;
    moondialLabelEn.textContent = `Ch ${ch.id}`;

    // Reset progress displays
    $$('.audio-progress-fill').forEach(el => el.style.width = '0%');
    $$('.audio-time').forEach(el => el.textContent = '0:00');
    updateMoondial(0);
    moondialTime.textContent = '0:00';

    // Scroll to story
    storyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Trigger chapter animations
    setTimeout(() => triggerChapterAnimations(idx), 200);

    // Update moon progress bar
    updateMoonProgress();

    // Auto-play
    if (state.autoPlay) {
      setTimeout(() => playChapter(idx), 600);
    }
  }

  function triggerChapterAnimations(idx) {
    const chapter = $$('.story-chapter')[idx];
    if (!chapter) return;
    const moonglow = chapter.querySelector('[data-moonglow]');
    if (moonglow) {
      moonglow.classList.remove('bloom');
      void moonglow.offsetWidth;
      moonglow.classList.add('bloom');
    }
    const sprig = chapter.querySelector('[data-sprig]');
    if (sprig) {
      sprig.classList.remove('visible');
      void sprig.offsetWidth;
      sprig.classList.add('visible');
    }
  }

  function updateMoonProgress() {
    const pct = ((state.currentChapter + 1) / state.totalChapters) * 100;
    moonBar.style.setProperty('--pct', pct + '%');
    moonBar.style.width = pct + '%';
  }

  function updateMoondial(pct) {
    const p = Math.min(Math.max(pct, 0), 100);
    moondialFill.style.setProperty('--pct', p + '%');
    moondialCursor.style.setProperty('--pct', p + '%');
  }

  // ── Audio ────────────────────────────────────────────────────────────
  function playChapter(idx) {
    const ch = STORY.chapters[idx];
    if (!ch) return;
    state.currentAudioChapter = idx;
    audioPlayer.src = audioSrc(ch.id, state.lang);
    audioPlayer.currentTime = 0;
    audioPlayer.play().then(() => {
      state.isPlaying = true;
      updateAllPlayButtons();
    }).catch(err => console.warn('Audio play failed:', err));
  }

  function togglePlay(idx) {
    const ch = STORY.chapters[idx];
    if (!ch) return;
    if (state.isPlaying && state.currentAudioChapter === idx) {
      audioPlayer.pause();
      state.isPlaying = false;
    } else if (state.currentAudioChapter === idx) {
      audioPlayer.play().then(() => { state.isPlaying = true; }).catch(() => { state.isPlaying = false; });
    } else {
      playChapter(idx);
    }
    updateAllPlayButtons();
  }

  function updateAllPlayButtons() {
    // Chapter-level play buttons
    $$('.audio-play-btn').forEach(btn => {
      const cid = parseInt(btn.dataset.chapter);
      const isOn = cid === state.currentAudioChapter && state.isPlaying;
      btn.classList.toggle('playing', isOn);
      btn.innerHTML = isOn
        ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      btn.setAttribute('aria-label', isOn ? 'Pause' : 'Play');
    });

    // Moondial play/pause icons
    const playSvg  = moondialPlay.querySelector('.icon-play');
    const pauseSvg = moondialPlay.querySelector('.icon-pause');
    if (state.isPlaying) {
      playSvg.style.display = 'none';
      pauseSvg.style.display = '';
      moondialPlay.classList.add('playing');
    } else {
      playSvg.style.display = '';
      pauseSvg.style.display = 'none';
      moondialPlay.classList.remove('playing');
    }
  }

  // ── Audio events ─────────────────────────────────────────────────────
  audioPlayer.addEventListener('timeupdate', () => {
    if (state.currentAudioChapter < 0 || !audioPlayer.duration) return;
    const ch = STORY.chapters[state.currentAudioChapter];
    if (!ch) return;
    const pct = audioPlayer.currentTime / audioPlayer.duration;

    // Chapter-level progress
    const fill   = $(`.audio-progress-fill[data-chapter="${ch.id}"]`);
    if (fill) fill.style.width = `${Math.min(pct * 100, 100)}%`;
    const timeEl = $(`.audio-time[data-chapter="${ch.id}"]`);
    if (timeEl) {
      const m = Math.floor(audioPlayer.currentTime / 60);
      const s = Math.floor(audioPlayer.currentTime % 60);
      timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Moondial
    updateMoondial(pct * 100);
    const cm = Math.floor(audioPlayer.currentTime / 60);
    const cs = Math.floor(audioPlayer.currentTime % 60);
    moondialTime.textContent = `${cm}:${cs.toString().padStart(2, '0')}`;
  });

  audioPlayer.addEventListener('ended', () => {
    const chIdx = state.currentAudioChapter;
    state.isPlaying = false;
    updateAllPlayButtons();

    const ch = STORY.chapters[chIdx];
    if (ch) {
      const fill = $(`.audio-progress-fill[data-chapter="${ch.id}"]`);
      if (fill) fill.style.width = '0%';
    }
    updateMoondial(0);
    moondialTime.textContent = '0:00';

    // Auto-advance
    if (state.autoPlay && chIdx < state.totalChapters - 1) {
      setTimeout(() => goToChapter(chIdx + 1), 1200);
    }
  });

  audioPlayer.addEventListener('error', () => {
    state.isPlaying = false;
    updateAllPlayButtons();
  });

  // ── Click-to-seek (chapter progress bar) ─────────────────────────────
  document.addEventListener('click', (e) => {
    const bar = e.target.closest('.audio-progress');
    if (!bar) return;
    const cid = parseInt(bar.dataset.chapter);
    if (cid !== state.currentAudioChapter) return;
    if (!audioPlayer.duration) return;
    const rect = bar.getBoundingClientRect();
    audioPlayer.currentTime = ((e.clientX - rect.left) / rect.width) * audioPlayer.duration;
  });

  // ── Click-to-seek (moondial band) ────────────────────────────────────
  moondialBand.addEventListener('click', (e) => {
    if (!audioPlayer.duration) return;
    const rect = moondialBand.getBoundingClientRect();
    audioPlayer.currentTime = ((e.clientX - rect.left) / rect.width) * audioPlayer.duration;
  });

  // ── Chapter play button clicks ───────────────────────────────────────
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.audio-play-btn');
    if (!btn) return;
    const cid = parseInt(btn.dataset.chapter);
    togglePlay(STORY.chapters.findIndex(c => c.id === cid));
  });

  // ── Moondial play button ─────────────────────────────────────────────
  moondialPlay.addEventListener('click', () => {
    if (state.isPlaying) {
      togglePlay(state.currentAudioChapter);
    } else if (state.currentAudioChapter >= 0) {
      togglePlay(state.currentAudioChapter);
    } else {
      playChapter(state.currentChapter);
    }
  });

  // ── Nav buttons ──────────────────────────────────────────────────────
  prevBtn.addEventListener('click', () => {
    if (state.currentChapter > 0) goToChapter(state.currentChapter - 1);
  });
  nextBtn.addEventListener('click', () => {
    if (state.currentChapter < state.totalChapters - 1) goToChapter(state.currentChapter + 1);
  });

  // ── Language toggle ──────────────────────────────────────────────────
  function setLang(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hans';
    langEn.classList.toggle('active', lang === 'en');
    langEn.setAttribute('aria-pressed', lang === 'en');
    langZh.classList.toggle('active', lang === 'zh');
    langZh.setAttribute('aria-pressed', lang === 'zh');

    // Swap audio if currently playing
    if (state.isPlaying && state.currentAudioChapter >= 0) {
      const ch = STORY.chapters[state.currentAudioChapter];
      if (ch) {
        const ct = audioPlayer.currentTime;
        audioPlayer.src = audioSrc(ch.id, state.lang);
        audioPlayer.currentTime = ct;
        audioPlayer.play().catch(() => {});
      }
    }
  }
  langEn.addEventListener('click', () => setLang('en'));
  langZh.addEventListener('click', () => setLang('zh'));

  // ── Auto-play ────────────────────────────────────────────────────────
  autoplayBtn.addEventListener('click', () => {
    state.autoPlay = !state.autoPlay;
    autoplayBtn.classList.toggle('active', state.autoPlay);
    if (state.autoPlay && !state.isPlaying) {
      playChapter(state.currentChapter);
    }
  });

  // ── Keyboard shortcuts ───────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!state.started) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (state.currentChapter > 0) goToChapter(state.currentChapter - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (state.currentChapter < state.totalChapters - 1) goToChapter(state.currentChapter + 1);
        break;
      case ' ':
        e.preventDefault();
        if (state.isPlaying) togglePlay(state.currentAudioChapter);
        else if (state.currentAudioChapter >= 0) togglePlay(state.currentAudioChapter);
        else playChapter(state.currentChapter);
        break;
      case 'a': case 'A':
        if (!e.ctrlKey && !e.metaKey) autoplayBtn.click();
        break;
    }
  });

  // ── Hero → Story transition ──────────────────────────────────────────
  beginBtn.addEventListener('click', () => {
    state.started = true;
    hero.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      hero.style.display = 'none';
      state.heroDismissed = true;
      header.style.display = '';
      moonProgress.style.display = '';
      goToChapter(0);
      startInkMotes();
    }, 600);
  });

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    renderChapters();
    renderMoonTray();
    header.style.display = 'none';
    moonProgress.style.display = 'none';
    prevBtn.disabled = true;
    nextBtn.disabled = false;
    setLang('zh');
  }

  init();
})();
