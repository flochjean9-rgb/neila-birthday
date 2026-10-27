
const toggle = document.getElementById('musicToggle');
const label = document.getElementById('musicLabel');

let ctx = null;
let gain = null;
let timer = null;
let index = 0;
let on = false;

// Нежная мелодия создаётся прямо в браузере — отдельный MP3 не нужен.
const melody = [
  [523.25, 0.34], [659.25, 0.34], [783.99, 0.5],
  [659.25, 0.34], [587.33, 0.34], [659.25, 0.34],
  [523.25, 0.55], [392, 0.45], [440, 0.34],
  [523.25, 0.34], [659.25, 0.55], [587.33, 0.34],
  [523.25, 0.34], [440, 0.55], [392, 0.65], [0, 0.4]
];

function note(frequency, duration) {
  if (!ctx || !gain || !on || !frequency) return;

  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  const now = ctx.currentTime;

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.11, now + 0.035);
  volume.gain.exponentialRampToValueAtTime(
    0.0001, now + duration * 0.92
  );

  oscillator.connect(volume);
  volume.connect(gain);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

function play() {
  if (!on) return;

  const [frequency, duration] = melody[index % melody.length];
  index++;

  note(frequency, duration);
  timer = setTimeout(play, duration * 1000);
}

toggle.addEventListener('click', async () => {
  if (!on) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      label.textContent = 'Музыка недоступна';
      return;
    }

    ctx = ctx || new AudioContextClass();

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    gain = gain || ctx.createGain();
    gain.gain.value = 0.22;
    gain.connect(ctx.destination);

    on = true;
    toggle.setAttribute('aria-pressed', 'true');
    label.textContent = 'Выключить музыку';

    play();
  } else {
    on = false;
    clearTimeout(timer);

    if (gain && ctx) {
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04);
    }

    toggle.setAttribute('aria-pressed', 'false');
    label.textContent = 'Включить музыку';

    setTimeout(() => {
      if (!on && gain && ctx) {
        gain.gain.setTargetAtTime(0.22, ctx.currentTime, 0.01);
      }
    }, 180);
  }
});

// Форма ответа гостя
document.getElementById('rsvpForm').addEventListener('submit', event => {
  event.preventDefault();

  const name = document.getElementById('guestName').value.trim();
  const attendance = document.getElementById('attendance').value;

  const messages = {
    yes: `Ура, ${name}! Neila будет очень рада тебя видеть ♡`,
    no: `Спасибо, что ответил(а), ${name}. Neila всё равно посылает тебе любовь ♡`,
    maybe: `Хорошо, ${name}! Надеемся, получится присоединиться ♡`
  };

  document.getElementById('formMessage').textContent =
    messages[attendance] || 'Спасибо за ответ ♡';

  document.getElementById('formMessage').scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
});

// Кнопка наверх
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
