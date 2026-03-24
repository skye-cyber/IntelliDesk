(function() {
  // Namespace on window to avoid polluting global scope
  const NS = 'sphereAnimation';

  // Cancel previous animation frame if any
  if (window[NS] && window[NS].animFrameId) {
    cancelAnimationFrame(window[NS].animFrameId);
  }

  // Initialize namespace for this run
  window[NS] = window[NS] || {};
  const state = window[NS];

  // Setup or reuse canvas element
  state.canvas = document.getElementById('body-canvas');
  if (!state.canvas) {
    // Create canvas if not present and append it to body
    state.canvas = document.createElement('canvas');
    state.canvas.id = 'body-canvas';
    document.body.appendChild(state.canvas);
  }
  const ctx = state.canvas.getContext('2d');

  // Resize handling
  function resize() {
    state.width = state.canvas.width = window.innerWidth;
    state.height = state.canvas.height = window.innerHeight;
    state.cx = state.width / 2;
    state.cy = state.height / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // Sphere settings
  const numPoints = 800;
  const sphereRadius = 500;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const points = [];

  // Generate points evenly distributed on the sphere (Fibonacci sphere)
  function getRandomColor() {
    const hue = Math.floor(Math.random() * 720);
    return `hsl(${hue}, 80%, 60%)`;
  }
  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push({
      x: Math.cos(theta) * radiusAtY,
                y: y,
                z: Math.sin(theta) * radiusAtY,
                color: getRandomColor(),
                changeTimer: Math.random() * 2000
    });
  }

  // Initialize animation state
  state.lastTime = performance.now();
  state.angleX = 0;
  state.angleY = 0;

  // Animation loop
  function animate(now) {
    const deltaTime = now - state.lastTime;
    state.lastTime = now;

    state.angleX += deltaTime * 0.0003;
    state.angleY += deltaTime * 0.0002;

    ctx.clearRect(0, 0, state.width, state.height);

    points.forEach(p => {
      p.changeTimer -= deltaTime;
      if (p.changeTimer <= 0) {
        p.color = getRandomColor();
        p.changeTimer = 2000 + Math.random() * 2000;
      }

      // Rotate around X axis
      const y1 = p.y * Math.cos(state.angleX) - p.z * Math.sin(state.angleX);
      const z1 = p.y * Math.sin(state.angleX) + p.z * Math.cos(state.angleX);

      // Rotate around Y axis
      const x1 = p.x * Math.cos(state.angleY) + z1 * Math.sin(state.angleY);
      const z2 = -p.x * Math.sin(state.angleY) + z1 * Math.cos(state.angleY);

      // Depth culling
      if (z2 >= 0.99) return;

      // Perspective projection
      const perspective = 510;
      const z3D = z2 * sphereRadius;
      const scale = perspective / (perspective - z3D);
      const x2d = state.cx + x1 * sphereRadius * scale;
      const y2d = state.cy + y1 * sphereRadius * scale;

      const dotSize = 3 * scale;

      ctx.beginPath();
      ctx.arc(x2d, y2d, dotSize, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    state.animFrameId = requestAnimationFrame(animate);
  }

  // Start animation
  state.animFrameId = requestAnimationFrame(animate);
})();

