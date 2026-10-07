/**
 * TusHiz - 10 Parmak Hız Testi Ana Motoru
 * Türkçe karakter içermeyen kelimeler (ASCII Türkçe: başhekim ➔ bashekim)
 */

class TypingSpeedApp {
  constructor() {
    // Durum Değişkenleri
    this.mode = 'time'; // 'time' | 'words' | 'zen'
    this.timeLimit = 30; // 15, 30, 60, 120
    this.wordLimit = 25; // 10, 25, 50, 100
    this.category = 'genel'; // 'genel' | 'kisa' | 'zorlayici' | 'teknoloji' | 'custom'
    this.soundType = 'thock';
    this.keyboardGuideVisible = true;

    this.status = 'ready'; // 'ready' | 'running' | 'finished'
    this.timer = null;
    this.timeRemaining = 30;
    this.timeElapsed = 0;

    // Kelime Havuzu & Yazım Takibi
    this.words = [];
    this.currentWordIdx = 0;
    this.currentTyped = '';
    this.wordStats = []; // her kelime için sonuçlar
    this.chartData = []; // saniyelik WPM kayıtları

    // Metrikler
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.extraChars = 0;

    // DOM Elemanları
    this.elements = {};

    this.initDOM();
    this.initEvents();
    this.loadPreferences();
    this.setupTest();
  }

  initDOM() {
    this.elements = {
      wrapper: document.getElementById('typing-wrapper'),
      input: document.getElementById('typing-input'),
      wordsContainer: document.getElementById('words-container'),
      caret: document.getElementById('caret'),
      focusOverlay: document.getElementById('focus-overlay'),

      // Canlı Göstergeler
      liveWpm: document.getElementById('live-wpm'),
      liveAccuracy: document.getElementById('live-accuracy'),
      liveTimer: document.getElementById('live-timer'),
      liveErrors: document.getElementById('live-errors'),
      timerLabel: document.getElementById('timer-label'),

      // Ayarlar ve Butonlar
      btnRestart: document.getElementById('btn-restart'),
      modeSelector: document.getElementById('mode-selector'),
      timeOptions: document.getElementById('time-options'),
      wordOptions: document.getElementById('word-options'),
      categorySelector: document.getElementById('category-selector'),
      toggleKeyboardGuide: document.getElementById('toggle-keyboard-guide'),
      guideSwitch: document.getElementById('guide-switch'),
      keyboardGuideSection: document.getElementById('keyboard-guide-section'),
      virtualKeyboard: document.getElementById('virtual-keyboard'),

      // Parmak Rehberi
      fingerHintBadge: document.getElementById('finger-hint-badge'),
      fingerIndicatorDot: document.getElementById('finger-indicator-dot'),
      fingerIndicatorText: document.getElementById('finger-indicator-text'),

      // Temalar & Ses
      themeSelect: document.getElementById('theme-select'),
      soundSelect: document.getElementById('sound-select'),

      // Sonuç Modalı
      resultsModal: document.getElementById('results-modal'),
      btnCloseResults: document.getElementById('btn-close-results'),
      btnModalRestart: document.getElementById('btn-modal-restart'),
      btnCopyResult: document.getElementById('btn-copy-result'),
      resWpm: document.getElementById('res-wpm'),
      resAccuracy: document.getElementById('res-accuracy'),
      resAccuracySub: document.getElementById('res-accuracy-sub'),
      resCpm: document.getElementById('res-cpm'),
      resChars: document.getElementById('res-chars'),
      resTime: document.getElementById('res-time'),
      resConsistency: document.getElementById('res-consistency'),
      resBadge: document.getElementById('res-badge'),
      resPbStatus: document.getElementById('res-pb-status'),
      chartSvg: document.getElementById('chart-svg'),

      // Dönüştürücü Modalı
      btnOpenConverter: document.getElementById('btn-open-converter'),
      converterModal: document.getElementById('converter-modal'),
      btnCloseConverter: document.getElementById('btn-close-converter'),
      converterInput: document.getElementById('converter-input'),
      converterPreview: document.getElementById('converter-preview'),
      btnConverterSample: document.getElementById('btn-converter-sample'),
      btnConverterStart: document.getElementById('btn-converter-start'),

      // Toast
      toast: document.getElementById('toast'),
      toastText: document.getElementById('toast-text'),

      // Oyuncu ve Liderlik Tablosu
      nicknameInput: document.getElementById('nickname-input'),
      btnOpenLeaderboard: document.getElementById('btn-open-leaderboard'),
      leaderboardModal: document.getElementById('leaderboard-modal'),
      btnCloseLeaderboard: document.getElementById('btn-close-leaderboard'),
      leaderboardModeFilter: document.getElementById('leaderboard-mode-filter'),
      btnRefreshLeaderboard: document.getElementById('btn-refresh-leaderboard'),
      leaderboardTbody: document.getElementById('leaderboard-tbody'),
      leaderboardLoading: document.getElementById('leaderboard-loading'),
      dbSourceBadge: document.getElementById('db-source-badge'),
      resDbBadge: document.getElementById('res-db-badge'),
      resDbStatusText: document.getElementById('res-db-status-text'),
      btnShowLbFromResult: document.getElementById('btn-show-lb-from-result')
    };
  }

  initEvents() {
    // Yazma Kutusu & Odaklanma
    this.elements.wrapper.addEventListener('click', () => {
      this.elements.input.focus();
      this.elements.focusOverlay.classList.remove('show');
    });

    this.elements.focusOverlay.addEventListener('click', () => {
      this.elements.input.focus();
      this.elements.focusOverlay.classList.remove('show');
    });

    this.elements.input.addEventListener('focus', () => {
      this.elements.focusOverlay.classList.remove('show');
      this.elements.wrapper.classList.add('focused');
    });

    this.elements.input.addEventListener('blur', () => {
      if (this.status === 'running') {
        this.elements.focusOverlay.classList.add('show');
      }
      this.elements.wrapper.classList.remove('focused');
    });

    // Tuş Dinleyicisi
    window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
    this.elements.input.addEventListener('input', (e) => this.handleInput(e));

    // Yeniden Başlat Butonu
    this.elements.btnRestart.addEventListener('click', () => this.setupTest());
    this.elements.btnModalRestart.addEventListener('click', () => {
      this.closeModal(this.elements.resultsModal);
      this.setupTest();
    });

    // Mod Değişimi
    this.elements.modeSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.elements.modeSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.setMode(btn.dataset.mode);
    });

    // Süre Seçenekleri
    this.elements.timeOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.elements.timeOptions.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.timeLimit = parseInt(btn.dataset.val, 10);
      this.setupTest();
    });

    // Kelime Sayısı Seçenekleri
    this.elements.wordOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.elements.wordOptions.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.wordLimit = parseInt(btn.dataset.val, 10);
      this.setupTest();
    });

    // Kelime Kategorisi
    this.elements.categorySelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.elements.categorySelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.category = btn.dataset.cat;
      this.setupTest();
    });

    // 10 Parmak Klavye Rehberi Toggle
    this.elements.toggleKeyboardGuide.addEventListener('click', () => {
      this.keyboardGuideVisible = !this.keyboardGuideVisible;
      this.elements.guideSwitch.classList.toggle('active', this.keyboardGuideVisible);
      this.elements.keyboardGuideSection.classList.toggle('hidden', !this.keyboardGuideVisible);
      localStorage.setItem('tushiz_guide', this.keyboardGuideVisible);
    });

    // Tema Değişimi
    this.elements.themeSelect.addEventListener('change', (e) => {
      this.setTheme(e.target.value);
    });

    // Ses Değişimi
    this.elements.soundSelect.addEventListener('change', (e) => {
      this.soundType = e.target.value;
      if (window.soundEngine) {
        window.soundEngine.setSoundType(this.soundType);
      }
      localStorage.setItem('tushiz_sound', this.soundType);
    });

    // Sonuç Modalı Kapatma & Kopyalama
    this.elements.btnCloseResults.addEventListener('click', () => {
      this.closeModal(this.elements.resultsModal);
      this.elements.input.focus();
    });

    this.elements.btnCopyResult.addEventListener('click', () => this.copyResultsToClipboard());

    // Dönüştürücü Modalı Olayları
    this.elements.btnOpenConverter.addEventListener('click', () => {
      this.openModal(this.elements.converterModal);
      this.elements.converterInput.focus();
    });

    this.elements.btnCloseConverter.addEventListener('click', () => {
      this.closeModal(this.elements.converterModal);
      this.elements.input.focus();
    });

    this.elements.converterInput.addEventListener('input', () => {
      const text = this.elements.converterInput.value;
      const converted = turkceToAscii(text);
      this.elements.converterPreview.textContent = converted || 'Dönüştürülen ASCII metin burada görünecek...';
    });

    this.elements.btnConverterSample.addEventListener('click', () => {
      const ornek = "Başhekim Mustafa Bey, çocuk sağlığı polikliniğindeki doktor ve hemşire arkadaşlarına özverili çalışmalarından ötürü teşekkür etti. Yağmurlu bir sonbahar akşamı hastanenin ışıkları parıldıyordu.";
      this.elements.converterInput.value = ornek;
      this.elements.converterPreview.textContent = turkceToAscii(ornek);
    });

    this.elements.btnConverterStart.addEventListener('click', () => {
      const raw = this.elements.converterInput.value.trim();
      if (!raw) {
        this.showToast('Lütfen önce bir metin girin!');
        return;
      }
      const convertedWords = turkceToAscii(raw)
        .replace(/[^a-z0-9\s-]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0);

      if (convertedWords.length === 0) {
        this.showToast('Geçerli kelime bulunamadı.');
        return;
      }

      this.customWords = convertedWords;
      this.category = 'custom';
      this.closeModal(this.elements.converterModal);

      // Kategori butonlarını güncelle
      this.elements.categorySelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      
      this.showToast(`Özel metin yüklendi (${convertedWords.length} kelime)`);
      this.setupTest();
    });

    // Liderlik Tablosu Olayları
    if (this.elements.btnOpenLeaderboard) {
      this.elements.btnOpenLeaderboard.addEventListener('click', () => {
        this.openModal(this.elements.leaderboardModal);
        this.fetchLeaderboard('all');
      });
    }

    if (this.elements.btnShowLbFromResult) {
      this.elements.btnShowLbFromResult.addEventListener('click', () => {
        this.closeModal(this.elements.resultsModal);
        this.openModal(this.elements.leaderboardModal);
        this.fetchLeaderboard('all');
      });
    }

    if (this.elements.btnCloseLeaderboard) {
      this.elements.btnCloseLeaderboard.addEventListener('click', () => {
        this.closeModal(this.elements.leaderboardModal);
        this.elements.input.focus();
      });
    }

    if (this.elements.btnRefreshLeaderboard) {
      this.elements.btnRefreshLeaderboard.addEventListener('click', () => {
        const activeFilter = this.elements.leaderboardModeFilter?.querySelector('.pill-btn.active')?.dataset.filter || 'all';
        this.fetchLeaderboard(activeFilter);
      });
    }

    if (this.elements.leaderboardModeFilter) {
      this.elements.leaderboardModeFilter.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        this.elements.leaderboardModeFilter.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.fetchLeaderboard(btn.dataset.filter);
      });
    }

    if (this.elements.nicknameInput) {
      this.elements.nicknameInput.addEventListener('input', (e) => {
        localStorage.setItem('tushiz_nickname', e.target.value.trim());
      });
    }

    // Pencere yeniden boyutlandığında imleç konumunu güncelle
    window.addEventListener('resize', () => this.updateCaret());
  }

  loadPreferences() {
    // Kayıtlı Tema
    const savedTheme = localStorage.getItem('tushiz_theme') || 'dark';
    this.setTheme(savedTheme);
    this.elements.themeSelect.value = savedTheme;

    // Kayıtlı Ses
    const savedSound = localStorage.getItem('tushiz_sound') || 'thock';
    this.soundType = savedSound;
    this.elements.soundSelect.value = savedSound;
    if (window.soundEngine) {
      window.soundEngine.setSoundType(savedSound);
    }

    // Kayıtlı Oyuncu Adı
    const savedNick = localStorage.getItem('tushiz_nickname') || 'Yazici';
    if (this.elements.nicknameInput) {
      this.elements.nicknameInput.value = savedNick;
    }

    // Kayıtlı Rehber
    const savedGuide = localStorage.getItem('tushiz_guide');
    if (savedGuide !== null) {
      this.keyboardGuideVisible = savedGuide === 'true';
      this.elements.guideSwitch.classList.toggle('active', this.keyboardGuideVisible);
      this.elements.keyboardGuideSection.classList.toggle('hidden', !this.keyboardGuideVisible);
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tushiz_theme', theme);
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'time') {
      this.elements.timeOptions.style.display = 'flex';
      this.elements.wordOptions.style.display = 'none';
      this.elements.timerLabel.textContent = 'Kalan Süre';
    } else if (mode === 'words') {
      this.elements.timeOptions.style.display = 'none';
      this.elements.wordOptions.style.display = 'flex';
      this.elements.timerLabel.textContent = 'Kalan Kelime';
    } else { // zen
      this.elements.timeOptions.style.display = 'none';
      this.elements.wordOptions.style.display = 'none';
      this.elements.timerLabel.textContent = 'Geçen Süre';
    }
    this.setupTest();
  }

  setupTest() {
    clearInterval(this.timer);
    this.timer = null;
    this.status = 'ready';

    this.currentWordIdx = 0;
    this.currentTyped = '';
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.extraChars = 0;
    this.timeElapsed = 0;
    this.wordStats = [];
    this.chartData = [];

    // Süre / Sayaç Ayarı
    if (this.mode === 'time') {
      this.timeRemaining = this.timeLimit;
      this.elements.liveTimer.innerHTML = `${this.timeRemaining}<span class="stat-unit">s</span>`;
    } else if (this.mode === 'words') {
      this.elements.liveTimer.innerHTML = `${this.wordLimit}<span class="stat-unit">kelime</span>`;
    } else {
      this.elements.liveTimer.innerHTML = `0<span class="stat-unit">s</span>`;
    }

    this.elements.liveWpm.innerHTML = `0<span class="stat-unit">k/dk</span>`;
    this.elements.liveAccuracy.innerHTML = `100<span class="stat-unit">%</span>`;
    this.elements.liveErrors.textContent = '0';

    this.elements.input.value = '';
    this.elements.focusOverlay.classList.remove('show');

    // Kelimeleri Hazırla
    this.generateWords();
    this.renderWords();

    // İmleç ve Parmak Rehberi
    requestAnimationFrame(() => {
      this.updateCaret();
      this.updateFingerGuide();
    });

    this.elements.input.focus();
  }

  generateWords() {
    let source = [];

    if (this.category === 'custom' && this.customWords && this.customWords.length > 0) {
      source = this.customWords;
    } else {
      source = KELIME_HAVUZU[this.category] || KELIME_HAVUZU.genel;
    }

    // Karıştırma & Havuz Boyutu
    const count = this.mode === 'words' ? this.wordLimit : 150;
    this.words = [];

    if (this.category === 'custom') {
      // Özel metinde sırayı bozmadan döngüyle ekle
      for (let i = 0; i < count; i++) {
        this.words.push(source[i % source.length]);
      }
    } else {
      // Rastgele karıştır
      const pool = [...source];
      for (let i = 0; i < count; i++) {
        const randIndex = Math.floor(Math.random() * pool.length);
        this.words.push(pool[randIndex]);
      }
    }
  }

  renderWords() {
    const container = this.elements.wordsContainer;
    container.innerHTML = '';

    this.words.forEach((wordText, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = `word ${wordIdx === 0 ? 'current' : 'pending'}`;
      wordSpan.id = `word-${wordIdx}`;

      // Harfleri span olarak oluştur
      for (let i = 0; i < wordText.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = wordText[i];
        wordSpan.appendChild(charSpan);
      }

      container.appendChild(wordSpan);
    });
  }

  handleGlobalKeyDown(e) {
    // Tab + Enter ile Yeniden Başlat Kısayolu
    if (e.key === 'Tab') {
      e.preventDefault();
      this.setupTest();
      return;
    }

    // Modal açıksa genel tuşları engelleme
    if (this.elements.resultsModal.classList.contains('show') ||
        this.elements.converterModal.classList.contains('show')) {
      if (e.key === 'Escape') {
        this.closeModal(this.elements.resultsModal);
        this.closeModal(this.elements.converterModal);
      }
      return;
    }

    // Otomatik odaklanma
    if (document.activeElement !== this.elements.input) {
      this.elements.input.focus();
    }

    // Sanal klavye tuş basma efekti
    this.animateVirtualKey(e.key);

    // Boşluk tuşu (Space) kelime tamamlama
    if (e.key === ' ') {
      e.preventDefault();
      if (this.currentTyped.length > 0) {
        this.commitWord();
      }
      return;
    }

    // Ctrl + Backspace ile kelimeyi tamamen silme
    if (e.key === 'Backspace' && e.ctrlKey) {
      e.preventDefault();
      this.currentTyped = '';
      this.elements.input.value = '';
      this.updateWordDisplay();
      this.updateCaret();
      this.updateFingerGuide();
      return;
    }
  }

  handleInput(e) {
    if (this.status === 'finished') return;

    // Testi başlat
    if (this.status === 'ready') {
      this.startTest();
    }

    const val = this.elements.input.value;
    
    // Normal yazma
    const oldLength = this.currentTyped.length;
    this.currentTyped = val;

    // Ses çal
    if (this.currentTyped.length > oldLength) {
      const lastChar = this.currentTyped[this.currentTyped.length - 1];
      const targetChar = this.words[this.currentWordIdx][this.currentTyped.length - 1];

      if (targetChar && lastChar === targetChar) {
        if (window.soundEngine) window.soundEngine.playKey();
      } else {
        if (window.soundEngine) window.soundEngine.playError();
      }
    }

    this.updateWordDisplay();
    this.updateCaret();
    this.updateFingerGuide();
    this.updateLiveStats();
  }

  startTest() {
    this.status = 'running';
    this.startTime = Date.now();
    this.elements.caret.classList.add('typing');

    this.timer = setInterval(() => {
      this.timeElapsed++;

      if (this.mode === 'time') {
        this.timeRemaining--;
        this.elements.liveTimer.innerHTML = `${this.timeRemaining}<span class="stat-unit">s</span>`;
        if (this.timeRemaining <= 0) {
          this.finishTest();
          return;
        }
      } else if (this.mode === 'words') {
        const remainingWords = Math.max(0, this.wordLimit - this.currentWordIdx);
        this.elements.liveTimer.innerHTML = `${remainingWords}<span class="stat-unit">kelime</span>`;
      } else { // zen
        this.elements.liveTimer.innerHTML = `${this.timeElapsed}<span class="stat-unit">s</span>`;
      }

      // Grafik verisi kaydet
      const currentWpm = this.calculateWpm();
      this.chartData.push({
        second: this.timeElapsed,
        wpm: currentWpm,
        errors: this.incorrectChars
      });

      this.updateLiveStats();
    }, 1000);
  }

  commitWord() {
    if (this.status === 'ready') {
      this.startTest();
    }

    const targetWord = this.words[this.currentWordIdx];
    const typedWord = this.currentTyped;
    const isExactMatch = typedWord === targetWord;

    // Karakter istatistiklerini hesapla
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < targetWord.length; i++) {
      if (i < typedWord.length) {
        if (typedWord[i] === targetWord[i]) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        // Eksik kalan harfler hata sayılır
        incorrect++;
      }
    }

    const extra = Math.max(0, typedWord.length - targetWord.length);

    this.totalTypedChars += typedWord.length + 1; // +1 space
    this.correctChars += correct + (isExactMatch ? 1 : 0);
    this.incorrectChars += incorrect + extra + (!isExactMatch ? 1 : 0);

    this.wordStats.push({
      target: targetWord,
      typed: typedWord,
      isCorrect: isExactMatch
    });

    // Mevcut kelimenin stilini güncelle
    const wordEl = document.getElementById(`word-${this.currentWordIdx}`);
    if (wordEl) {
      wordEl.classList.remove('current');
      if (!isExactMatch) {
        wordEl.classList.add('has-error');
      }
    }

    // Sıradaki kelimeye geç
    this.currentWordIdx++;
    this.currentTyped = '';
    this.elements.input.value = '';

    // Kelime limit modunda bitiş kontrolü
    if (this.mode === 'words' && this.currentWordIdx >= this.wordLimit) {
      this.finishTest();
      return;
    }

    // Havuzun sonuna yaklaşıldıysa yeni kelimeler ekle
    if (this.currentWordIdx >= this.words.length - 20) {
      this.appendMoreWords();
    }

    const nextWordEl = document.getElementById(`word-${this.currentWordIdx}`);
    if (nextWordEl) {
      nextWordEl.classList.add('current');
      nextWordEl.classList.remove('pending');
      this.scrollWordsContainer(nextWordEl);
    }

    if (window.soundEngine) window.soundEngine.playKey();

    this.updateCaret();
    this.updateFingerGuide();
    this.updateLiveStats();
  }

  appendMoreWords() {
    const source = KELIME_HAVUZU[this.category] || KELIME_HAVUZU.genel;
    const moreWords = [];
    for (let i = 0; i < 50; i++) {
      moreWords.push(source[Math.floor(Math.random() * source.length)]);
    }

    moreWords.forEach((wordText, idx) => {
      const realIdx = this.words.length;
      this.words.push(wordText);

      const wordSpan = document.createElement('span');
      wordSpan.className = 'word pending';
      wordSpan.id = `word-${realIdx}`;

      for (let c = 0; c < wordText.length; c++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = wordText[c];
        wordSpan.appendChild(charSpan);
      }
      this.elements.wordsContainer.appendChild(wordSpan);
    });
  }

  updateWordDisplay() {
    const wordEl = document.getElementById(`word-${this.currentWordIdx}`);
    if (!wordEl) return;

    const targetWord = this.words[this.currentWordIdx];
    const typed = this.currentTyped;

    // Mevcut ekstra harfleri temizle
    wordEl.querySelectorAll('.char.extra').forEach(el => el.remove());

    const charSpans = wordEl.querySelectorAll('.char:not(.extra)');

    charSpans.forEach((span, i) => {
      if (i < typed.length) {
        if (typed[i] === targetWord[i]) {
          span.className = 'char correct';
        } else {
          span.className = 'char incorrect';
        }
      } else {
        span.className = 'char';
      }
    });

    // Fazladan yazılan harfleri ekle
    if (typed.length > targetWord.length) {
      for (let i = targetWord.length; i < typed.length; i++) {
        const extraSpan = document.createElement('span');
        extraSpan.className = 'char extra';
        extraSpan.textContent = typed[i];
        wordEl.appendChild(extraSpan);
      }
    }
  }

  updateCaret() {
    const caret = this.elements.caret;
    const wordEl = document.getElementById(`word-${this.currentWordIdx}`);
    if (!wordEl) return;

    const charSpans = wordEl.querySelectorAll('.char');
    const typedLen = this.currentTyped.length;

    let targetX = 0;
    let targetY = 0;

    if (typedLen === 0) {
      // Kelimenin en başına
      targetX = wordEl.offsetLeft;
      targetY = wordEl.offsetTop + 4;
    } else if (typedLen <= charSpans.length) {
      const targetChar = charSpans[typedLen - 1];
      targetX = targetChar.offsetLeft + targetChar.offsetWidth;
      targetY = targetChar.offsetTop + 4;
    } else {
      // Ekstra harflerin sonuna
      const lastChar = charSpans[charSpans.length - 1];
      targetX = lastChar.offsetLeft + lastChar.offsetWidth;
      targetY = lastChar.offsetTop + 4;
    }

    caret.style.left = `${targetX}px`;
    caret.style.top = `${targetY}px`;
  }

  scrollWordsContainer(currentWordEl) {
    const container = this.elements.wordsContainer;
    const firstWord = container.querySelector('.word');
    if (!firstWord) return;

    const wordTop = currentWordEl.offsetTop;
    const containerTop = firstWord.offsetTop;
    const diff = wordTop - containerTop;

    // 2. satırdan sonra yukarı doğru kaydır
    if (diff > 55) {
      container.scrollTop = diff - 40;
    }
  }

  updateFingerGuide() {
    // Sıradaki tuşu ve parmağı belirle
    const targetWord = this.words[this.currentWordIdx];
    let nextChar = ' ';

    if (targetWord && this.currentTyped.length < targetWord.length) {
      nextChar = targetWord[this.currentTyped.length];
    } else {
      nextChar = ' '; // Boşluk tuşu (kelime bitimi)
    }

    const info = PARMAK_REHBERI[nextChar.toLowerCase()] || {
      parmak: 4,
      ad: 'Basparmak (Bosluk)',
      renk: '#06b6d4'
    };

    // Alt rozeti güncelle
    this.elements.fingerIndicatorDot.style.background = info.renk;
    this.elements.fingerIndicatorDot.style.boxShadow = `0 0 10px ${info.renk}`;
    const displayChar = nextChar === ' ' ? 'Boşluk (Space)' : nextChar.toUpperCase();
    this.elements.fingerIndicatorText.innerHTML = `Sıradaki Tuş: <strong>${displayChar}</strong> | Parmak: <strong>${info.ad}</strong>`;

    // Sanal klavyede sıradaki tuşu parlat
    this.highlightVirtualNextKey(nextChar);
  }

  highlightVirtualNextKey(char) {
    const keys = this.elements.virtualKeyboard.querySelectorAll('.key');
    keys.forEach(k => k.classList.remove('next-key'));

    const searchKey = char === ' ' ? ' ' : char.toLowerCase();
    const targetKeyEl = this.elements.virtualKeyboard.querySelector(`.key[data-key="${searchKey}"]`);

    if (targetKeyEl) {
      targetKeyEl.classList.add('next-key');
    }
  }

  animateVirtualKey(key) {
    const searchKey = key === ' ' ? ' ' : key.toLowerCase();
    const keyEl = this.elements.virtualKeyboard.querySelector(`.key[data-key="${searchKey}"]`);
    if (keyEl) {
      keyEl.classList.add('pressed');
      setTimeout(() => keyEl.classList.remove('pressed'), 120);
    }
  }

  calculateWpm() {
    const elapsedMinutes = Math.max(this.timeElapsed / 60, 0.016); // en az 1 sn
    // Her 5 doğru karakter 1 standart kelime sayılır
    const wordsCount = this.correctChars / 5;
    return Math.round(wordsCount / elapsedMinutes);
  }

  calculateAccuracy() {
    const total = this.correctChars + this.incorrectChars;
    if (total === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((this.correctChars / total) * 100)));
  }

  updateLiveStats() {
    const wpm = this.calculateWpm();
    const acc = this.calculateAccuracy();

    this.elements.liveWpm.innerHTML = `${wpm}<span class="stat-unit">k/dk</span>`;
    this.elements.liveAccuracy.innerHTML = `${acc}<span class="stat-unit">%</span>`;
    this.elements.liveErrors.textContent = this.incorrectChars;
  }

  finishTest() {
    clearInterval(this.timer);
    this.timer = null;
    this.status = 'finished';

    this.elements.caret.classList.remove('typing');
    this.elements.input.blur();

    if (window.soundEngine) {
      window.soundEngine.playFinish();
    }

    this.showResults();
  }

  showResults() {
    const wpm = this.calculateWpm();
    const acc = this.calculateAccuracy();
    const elapsedMin = Math.max(this.timeElapsed / 60, 0.016);
    const cpm = Math.round(this.correctChars / elapsedMin);

    this.elements.resWpm.textContent = wpm;
    this.elements.resAccuracy.textContent = acc;
    this.elements.resCpm.textContent = cpm;
    this.elements.resChars.textContent = `${this.correctChars} / ${this.incorrectChars}`;
    this.elements.resTime.textContent = `${this.timeElapsed}s`;

    // Tutarlılık Hesapla
    let consistency = 95;
    if (this.chartData.length > 2) {
      const wpms = this.chartData.map(d => d.wpm);
      const avg = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(60, Math.min(100, Math.round(100 - (stdDev / (avg || 1)) * 30)));
    }
    this.elements.resConsistency.textContent = `${consistency}%`;

    // Rozet & Motivasyon
    if (wpm >= 90) {
      this.elements.resBadge.textContent = '🚀 Efsanevi Hız';
      this.elements.resAccuracySub.textContent = 'Klavye virtüözü seviyesi!';
    } else if (wpm >= 65) {
      this.elements.resBadge.textContent = '⚡ Çok Hızlı';
      this.elements.resAccuracySub.textContent = '10 parmak refleksleriniz mükemmel!';
    } else if (wpm >= 40) {
      this.elements.resBadge.textContent = '👍 İyi Tempo';
      this.elements.resAccuracySub.textContent = 'Günlük kullanım ve kodlama için ideal hız.';
    } else {
      this.elements.resBadge.textContent = '🌱 Gelişiyor';
      this.elements.resAccuracySub.textContent = 'Pratik yaptıkça hızınız katlanacak!';
    }

    // Kişisel Rekor (Personal Best)
    const pbKey = `tushiz_pb_${this.mode}_${this.mode === 'time' ? this.timeLimit : this.wordLimit}`;
    const oldPb = parseInt(localStorage.getItem(pbKey) || '0', 10);

    if (wpm > oldPb && wpm > 0) {
      localStorage.setItem(pbKey, wpm);
      this.elements.resPbStatus.innerHTML = `🏆 <strong>Yeni Rekor!</strong> Önceki: ${oldPb} WPM`;
    } else {
      this.elements.resPbStatus.textContent = `Kişisel Rekorunuz: ${oldPb} WPM`;
    }

    // Hız Grafiğini Çiz
    this.drawChart();

    // Veritabanına Skoru Kaydet (Vercel / Supabase)
    this.saveScoreToDatabase(wpm, acc, cpm);

    // Modalı Aç
    this.openModal(this.elements.resultsModal);
  }

  drawChart() {
    const svg = this.elements.chartSvg;
    svg.innerHTML = '';

    if (this.chartData.length < 2) {
      // Yeterli veri yoksa temsili basit çizgi
      svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="14">Veri noktaları için en az 3 saniye yazın</text>`;
      return;
    }

    const data = this.chartData;
    const width = 600;
    const height = 120;
    const padding = 20;

    const maxWpm = Math.max(...data.map(d => d.wpm), 20);
    const minWpm = 0;

    const getX = (i) => padding + (i / (data.length - 1)) * (width - 2 * padding);
    const getY = (val) => height - padding - ((val - minWpm) / (maxWpm - minWpm)) * (height - 2 * padding);

    // Çizgi noktaları
    let pathD = `M ${getX(0)} ${getY(data[0].wpm)}`;
    let areaD = `M ${getX(0)} ${height - padding} L ${getX(0)} ${getY(data[0].wpm)}`;

    for (let i = 1; i < data.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1].wpm);
      const currX = getX(i);
      const currY = getY(data[i].wpm);

      // Yumuşak eğri (Bezier kontrol noktaları)
      const cpX = (prevX + currX) / 2;
      pathD += ` C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`;
      areaD += ` C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`;
    }

    areaD += ` L ${getX(data.length - 1)} ${height - padding} Z`;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.0"/>
      </linearGradient>
    `;
    svg.appendChild(defs);

    // Alan Dolgusu
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('d', areaD);
    areaPath.setAttribute('fill', 'url(#chartGrad)');
    svg.appendChild(areaPath);

    // Ana Çizgi
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    linePath.setAttribute('d', pathD);
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke', 'var(--accent)');
    linePath.setAttribute('stroke-width', '3');
    linePath.setAttribute('stroke-linecap', 'round');
    svg.appendChild(linePath);

    // Noktalar
    data.forEach((pt, idx) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', getX(idx));
      circle.setAttribute('cy', getY(pt.wpm));
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'var(--accent)');
      svg.appendChild(circle);
    });
  }

  copyResultsToClipboard() {
    const wpm = this.calculateWpm();
    const acc = this.calculateAccuracy();
    const text = `⌨️ TusHiz 10 Parmak Testi Sonucum:\n🚀 Hız: ${wpm} WPM (${this.elements.resCpm.textContent} CPM)\n🎯 Doğruluk: %${acc}\n⏱️ Süre: ${this.timeElapsed}s (ASCII Türkçe modu: başhekim ➔ bashekim)`;

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Sonuç panoya kopyalandı! 📋');
    }).catch(() => {
      this.showToast('Kopyalama başarısız oldu.');
    });
  }

  async saveScoreToDatabase(wpm, accuracy, cpm) {
    const nickname = (this.elements.nicknameInput?.value || 'Anonim').trim() || 'Anonim';
    const payload = {
      nickname,
      wpm,
      accuracy,
      cpm,
      mode: this.mode,
      mode_value: this.mode === 'time' ? this.timeLimit : this.wordLimit,
      category: this.category
    };

    if (this.elements.resDbStatusText) {
      this.elements.resDbStatusText.textContent = 'Veritabanına kaydediliyor...';
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const sourceText = data.source === 'supabase' ? 'Supabase' : 'Veritabanı';
        if (this.elements.resDbStatusText) {
          this.elements.resDbStatusText.textContent = `Kaydedildi (${sourceText}) ✓`;
        }
      } else {
        if (this.elements.resDbStatusText) {
          this.elements.resDbStatusText.textContent = 'Yerel Hafızaya Eklendi';
        }
      }
    } catch (err) {
      if (this.elements.resDbStatusText) {
        this.elements.resDbStatusText.textContent = 'Yerel Kaydedildi';
      }
    }
  }

  async fetchLeaderboard(filter = 'all') {
    if (!this.elements.leaderboardTbody) return;
    this.elements.leaderboardLoading.style.display = 'block';
    this.elements.leaderboardTbody.innerHTML = '';

    let query = '/api/scores?limit=30';
    if (filter === 'time-30') query += '&mode=time&mode_value=30';
    else if (filter === 'time-60') query += '&mode=time&mode_value=60';
    else if (filter === 'words-25') query += '&mode=words&mode_value=25';

    try {
      const res = await fetch(query);
      const data = await res.json();
      this.elements.leaderboardLoading.style.display = 'none';

      if (data.source === 'supabase') {
        this.elements.dbSourceBadge.textContent = '🟢 Supabase Aktif';
        this.elements.dbSourceBadge.style.color = '#10b981';
      } else {
        this.elements.dbSourceBadge.textContent = '⚡ Vercel / Yerel DB';
        this.elements.dbSourceBadge.style.color = '#38bdf8';
      }

      const scores = data.scores || [];
      if (scores.length === 0) {
        this.elements.leaderboardTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-dim)">Henüz skor kaydedilmemiş. İlk testi siz tamamlayın!</td></tr>`;
        return;
      }

      const escapeHtml = (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
      };

      let html = '';
      scores.forEach((s, idx) => {
        let rankDisplay = idx + 1;
        if (idx === 0) rankDisplay = '<span class="rank-badge-1">🥇 1</span>';
        else if (idx === 1) rankDisplay = '<span class="rank-badge-2">🥈 2</span>';
        else if (idx === 2) rankDisplay = '<span class="rank-badge-3">🥉 3</span>';

        const date = new Date(s.created_at);
        const dateStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        const modeStr = s.mode === 'time' ? `${s.mode_value}s` : `${s.mode_value} kelime`;

        html += `
          <tr>
            <td class="rank-cell">${rankDisplay}</td>
            <td><strong>${escapeHtml(s.nickname)}</strong></td>
            <td class="wpm-cell">${s.wpm} <span style="font-size:0.75rem; color:var(--text-dim)">WPM</span></td>
            <td>%${s.accuracy}</td>
            <td>${s.cpm}</td>
            <td><span class="badge-ascii" style="padding:1px 8px; font-size:0.7rem">${modeStr}</span></td>
            <td style="font-size:0.75rem; color:var(--text-dim)">${dateStr}</td>
          </tr>
        `;
      });
      this.elements.leaderboardTbody.innerHTML = html;
    } catch (err) {
      this.elements.leaderboardLoading.style.display = 'none';
      this.elements.leaderboardTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--char-incorrect)">Veritabanı bağlantısı sağlanamadı.</td></tr>`;
    }
  }

  openModal(modalEl) {
    modalEl.classList.add('show');
  }

  closeModal(modalEl) {
    modalEl.classList.remove('show');
  }

  showToast(msg) {
    this.elements.toastText.textContent = msg;
    this.elements.toast.classList.add('show');
    setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, 2800);
  }
}

// Uygulamayı Başlat
document.addEventListener('DOMContentLoaded', () => {
  window.typingApp = new TypingSpeedApp();
});

