(() => {
  const doc = document;

  // Particles background
  const canvas = doc.getElementById('bg-particles');
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  function resize() {
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
  }
  function initParticles() {
    const count = Math.min(140, Math.floor(window.innerWidth / 10));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.08 * DPR,
      vy: (Math.random() - 0.5) * 0.08 * DPR,
      r: (Math.random() * 1.4 + 0.6) * DPR,
      alpha: Math.random() * 0.6 + 0.2
    }));
  }
  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00d8ff';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#00d8ff';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < (120 * DPR) * (120 * DPR)) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  function startBG() {
    resize();
    initParticles();
    step();
  }
  window.addEventListener('resize', () => {
    resize(); initParticles();
  });

  // Reveal on scroll
  const reveals = Array.from(doc.querySelectorAll('.reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { root: null, threshold: 0.12 });
  reveals.forEach(el => obs.observe(el));

  // Smooth anchor on nav (prevent overflow scroll jumps on some browsers)
  doc.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = doc.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Poster upload preview
  const posterInput = doc.getElementById('poster-input');
  const posterImg = doc.getElementById('team-poster');
  const posterPh = doc.querySelector('.poster-placeholder');
  if (posterInput && posterImg) {
    posterInput.addEventListener('change', () => {
      const file = posterInput.files && posterInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        posterImg.src = reader.result;
        posterImg.style.display = 'block';
        if (posterPh) posterPh.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });
  }

  // Start
  startBG();
})(); 

