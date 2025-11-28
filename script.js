(() => {
  const doc = document;

  // Tool icon background
  const toolField = doc.querySelector('.tool-field');
  if (toolField) {
    const TOOL_SVGS = {
      wrench: '<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M43 10l11 11-7 7-7-4L28 36l6 6-9 9-12-12 9-9-4-7 7-7 11 11z"></path><circle cx="18" cy="46" r="4"></circle></svg>',
      gear: '<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><circle cx="32" cy="32" r="10"></circle><path d="M32 12v8M32 44v8M12 32h8M44 32h8M20 20l6 6M38 38l6 6M20 44l6-6M38 26l6-6"></path></svg>',
      driver: '<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M18 12l10 10-6 6 14 14 6-6 10 10-10 10-24-24-10 10-6-6 16-16z"></path><path d="M34 6l8 8-6 6-8-8z"></path></svg>',
      bolt: '<svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M24 6h16l6 12H18zM18 18h28v12H18zM18 30h28l-6 28H24z"></path></svg>'
    };
    const TOOL_TYPES = Object.keys(TOOL_SVGS);
    const tools = [];
    let fieldWidth = window.innerWidth;
    let fieldHeight = window.innerHeight;

    const createToolEl = (type) => {
      const span = doc.createElement('span');
      span.className = 'tool-icon';
      span.innerHTML = TOOL_SVGS[type];
      return span;
    };

    const toolCount = () => (window.innerWidth < 720 ? 12 : 22);

    const initTools = () => {
      const rect = toolField.getBoundingClientRect();
      fieldWidth = rect.width;
      fieldHeight = rect.height;
      toolField.innerHTML = '';
      tools.length = 0;
      const count = toolCount();
      for (let i = 0; i < count; i++) {
        const type = TOOL_TYPES[Math.floor(Math.random() * TOOL_TYPES.length)];
        const el = createToolEl(type);
        toolField.appendChild(el);
        const scale = 0.5 + Math.random() * 0.8;
        tools.push({
          el,
          x: Math.random() * fieldWidth,
          y: Math.random() * fieldHeight,
          vx: (Math.random() * 0.15 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
          vy: (Math.random() - 0.5) * 0.08,
          rot: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 0.12,
          scale
        });
      }
    };

    const animateTools = () => {
      tools.forEach(tool => {
        tool.x += tool.vx;
        tool.y += tool.vy;
        tool.rot += tool.vrot;
        if (tool.x < -80) tool.x = fieldWidth + 60;
        if (tool.x > fieldWidth + 80) tool.x = -60;
        if (tool.y < -80) tool.y = fieldHeight + 60;
        if (tool.y > fieldHeight + 80) tool.y = -60;
        const opacity = 0.25 + tool.scale * 0.4;
        tool.el.style.opacity = opacity.toFixed(2);
        tool.el.style.transform = `translate3d(${tool.x}px, ${tool.y}px, 0) rotate(${tool.rot}deg) scale(${tool.scale})`;
      });
      requestAnimationFrame(animateTools);
    };

    initTools();
    animateTools();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initTools, 200);
    });
  }

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

  // Blueprint hover info
  const blueprint = doc.querySelector('[data-blueprint]');
  if (blueprint) {
    const tooltip = blueprint.closest('.blueprint-wrap').querySelector('.bp-tooltip');
    const titleEl = tooltip.querySelector('.bp-tooltip-title');
    const descEl = tooltip.querySelector('p');
    const defaultTitle = titleEl.textContent;
    const defaultDesc = descEl.textContent;
    const shapes = blueprint.querySelectorAll('.bp-shape');
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    let activeShape = null;

    function showInfo(shape) {
      const title = shape.getAttribute('data-title') || defaultTitle;
      const desc = shape.getAttribute('data-desc') || defaultDesc;
      if (activeShape && activeShape !== shape) {
        activeShape.classList.remove('is-active');
      }
      activeShape = shape;
      shape.classList.add('is-active');
      titleEl.textContent = title;
      descEl.textContent = desc;
    }

    function resetInfo(evt) {
      if (evt && blueprint.contains(evt.relatedTarget)) return;
      if (activeShape) {
        activeShape.classList.remove('is-active');
        activeShape = null;
      }
      titleEl.textContent = defaultTitle;
      descEl.textContent = defaultDesc;
    }

    shapes.forEach(shape => {
      shape.setAttribute('tabindex', '0');
      if (supportsHover) {
        shape.addEventListener('mouseenter', () => showInfo(shape));
        shape.addEventListener('mouseleave', resetInfo);
      } else {
        shape.addEventListener('click', (evt) => {
          evt.preventDefault();
          if (activeShape === shape) {
            resetInfo();
          } else {
            showInfo(shape);
          }
        });
      }
      shape.addEventListener('focus', () => showInfo(shape));
      shape.addEventListener('blur', (evt) => {
        if (supportsHover) resetInfo(evt);
      });
    });

    if (supportsHover) {
      blueprint.addEventListener('mouseleave', resetInfo);
    } else {
      doc.addEventListener('click', (evt) => {
        if (!blueprint.contains(evt.target)) resetInfo();
      });
    }
  }

  // Top bar progress robot
  const topbar = doc.querySelector('.topbar');
  if (topbar) {
    const progressTrack = topbar.querySelector('.nav-progress-track');
    const updateNavProgress = () => {
      const docEl = doc.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop;
      const docHeight = docEl.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      topbar.style.setProperty('--nav-progress', progress);
      if (progressTrack) progressTrack.style.setProperty('--nav-progress', progress);
    };
    updateNavProgress();
    window.addEventListener('scroll', () => requestAnimationFrame(updateNavProgress));
    window.addEventListener('resize', () => requestAnimationFrame(updateNavProgress));
  }

  // Desktop cursor trail
  if (window.matchMedia('(pointer: fine)').matches) {
    const trailLayer = doc.createElement('div');
    trailLayer.className = 'cursor-trail';
    doc.body.appendChild(trailLayer);

    const DOT_COUNT = 12;
    const dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      const dotEl = doc.createElement('span');
      dotEl.className = 'cursor-trail-dot';
      trailLayer.appendChild(dotEl);
      dots.push({
        el: dotEl,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    }

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    function animate() {
      dots.forEach((dot, index) => {
        const lerp = 0.18 - index * 0.008;
        dot.x += (pointer.x - dot.x) * Math.max(lerp, 0.05);
        dot.y += (pointer.y - dot.y) * Math.max(lerp, 0.05);
        const scale = 0.3 + (1 - index / DOT_COUNT) * 0.6;
        const opacity = 0.15 + (1 - index / DOT_COUNT) * 0.5;
        dot.el.style.opacity = opacity.toFixed(2);
        dot.el.style.transform = `translate(${dot.x - 8}px, ${dot.y - 8}px) scale(${scale.toFixed(2)})`;
      });
      requestAnimationFrame(animate);
    }

    const activateTrail = () => trailLayer.classList.add('is-active');
    const deactivateTrail = () => trailLayer.classList.remove('is-active');

    doc.addEventListener('pointermove', (evt) => {
      activateTrail();
      pointer.x = evt.clientX;
      pointer.y = evt.clientY;
    });
    doc.addEventListener('pointerenter', activateTrail);
    doc.addEventListener('pointerleave', deactivateTrail);

    animate();
  }

})(); 

