// Original point study: a loose field around a rotating sphere.
// It decorates the first screen; it never controls scrolling or content.
(() => {
    const canvas = document.getElementById('product-field');
    const toggle = document.querySelector('.motion-toggle');
    if (!canvas || !toggle) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hero = canvas.closest('.product-hero');
    let width = 0, height = 0, frame = 0, phase = 0, lastTime = 0;
    let inView = true, paused = false;
    let seed = 42;
    const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const points = Array.from({ length: 1050 }, (_, i) => {
        const y = 1 - (i / 1049) * 2;
        const ring = Math.sqrt(1 - y * y);
        const angle = i * Math.PI * (3 - Math.sqrt(5));
        return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring,
            drift: random(), size: .45 + random() * .95, warm: random() > .42 };
    });
    function draw() {
        context.clearRect(0, 0, width, height);
        const radius = Math.min(width * .235, height * .34);
        const centerX = width < 761 ? width * .84 : width * .77;
        const centerY = height * .49;
        const angle = phase * .07 + .4;
        const cos = Math.cos(angle), sin = Math.sin(angle);
        for (const p of points) {
            const x = p.x * cos - p.z * sin;
            const z = p.x * sin + p.z * cos;
            const scatter = Math.max(0, x * -1.4) * p.drift;
            const px = centerX + x * radius + scatter * radius * -1.2;
            const py = centerY + p.y * radius * (1 + scatter * .6) + Math.sin(phase * .18 + p.drift * 12) * 4;
            const alpha = (.12 + (z + 1) * .27) * (1 - scatter * .3);
            context.fillStyle = p.warm ? `rgba(255,130,0,${alpha})` : `rgba(255,255,255,${alpha * .7})`;
            context.beginPath();
            context.arc(px, py, p.size * (1 + z * .25), 0, Math.PI * 2);
            context.fill();
        }
    }
    function running() { return !paused && !reduced.matches && inView && !document.hidden; }
    function tick(time) {
        frame = 0;
        if (!running()) { lastTime = 0; return; }
        if (lastTime) phase += Math.min((time - lastTime) / 1000, .05);
        lastTime = time;
        draw();
        frame = requestAnimationFrame(tick);
    }
    function sync() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        toggle.hidden = reduced.matches;
        toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
        toggle.setAttribute('aria-pressed', String(paused));
        draw();
        if (running()) frame = requestAnimationFrame(tick);
    }
    function resize() {
        const bounds = hero.getBoundingClientRect();
        width = bounds.width; height = bounds.height;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw();
    }
    toggle.addEventListener('click', () => { paused = !paused; sync(); });
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(hero);
    }
    resize(); sync();
})();
