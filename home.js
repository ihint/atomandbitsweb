// A quiet point field gathers into a network and finds a shortest route.
// Decorative only: native pointer, links and scrolling remain untouched.
(() => {
    const canvas = document.getElementById('product-field');
    const toggle = document.querySelector('.motion-toggle');
    const play = document.querySelector('.swarm-play');
    const trigger = document.querySelector('.swarm-trigger');
    const status = document.getElementById('swarm-status');
    if (!canvas || !toggle || !play || !trigger || !status) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hero = canvas.closest('.product-hero');
    let width = 0, height = 0, frame = 0, phase = 0, lastTime = 0;
    let inView = true, paused = false, active = false, blend = 0, settled = 0;
    let pointerInside = false, pinned = false, announce = false;
    let nodes = [], edges = [], route = [], goal = 27, scene;
    let seed = 42;
    const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const points = Array.from({ length: 720 }, (_, i) => {
        const y = 1 - (i / 719) * 2;
        const ring = Math.sqrt(1 - y * y), angle = i * Math.PI * (3 - Math.sqrt(5));
        return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring,
            drift: random(), size: .55 + random(), warm: random() > .35 };
    });
    const grid = Array.from({ length: 30 }, (_, i) => ({
        x: (Math.floor(i / 5) + (random() - .5) * .34) / 5,
        y: (i % 5 + (random() - .5) * .34) / 4,
    }));
    const links = [];
    for (let col = 0; col < 6; col++) {
        for (let row = 0; row < 5; row++) {
            const i = col * 5 + row;
            if (col < 5) links.push([i, i + 5]);
            if (row < 4) links.push([i, i + 1]);
            if (col < 5 && row < 4 && random() > .4) links.push([i, i + 6]);
        }
    }
    // Dijkstra on the small, connected network. Recomputed only on target changes.
    function solve(target) {
        const distances = nodes.map(() => Infinity), previous = [], visited = new Set();
        distances[2] = 0;
        for (let count = 0; count < nodes.length; count++) {
            let closest = -1;
            for (let i = 0; i < nodes.length; i++) {
                if (!visited.has(i) && (closest < 0 || distances[i] < distances[closest])) closest = i;
            }
            if (closest === target) break;
            visited.add(closest);
            for (const [a, b, cost] of edges) {
                const next = a === closest ? b : b === closest ? a : -1;
                if (next < 0) continue;
                const candidate = distances[closest] + cost;
                if (candidate < distances[next]) { distances[next] = candidate; previous[next] = closest; }
            }
        }
        route = [target];
        while (route[0] !== 2) route.unshift(previous[route[0]]);
    }
    function line(a, b, color, weight = 1) {
        context.strokeStyle = color; context.lineWidth = weight;
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
    }
    function dot(x, y, radius, color) {
        context.fillStyle = color; context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
    }
    function draw(step = 0) {
        context.clearRect(0, 0, width, height);
        const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (settled - .55) / 1.65));
        const spread = 1 - progress;
        const radius = Math.min(scene.w * .67, scene.h * .69);
        const centerX = scene.x + scene.w * .58, centerY = scene.y + scene.h * .5;
        const cos = Math.cos(phase * .07 + .4), sin = Math.sin(phase * .07 + .4);
        if (blend > .01) {
            for (const [a, b] of edges) line(nodes[a], nodes[b], `rgba(183,199,218,${blend * .17})`);
        }
        for (let i = 0; i < points.length; i++) {
            const p = points[i], x = p.x * cos - p.z * sin, z = p.x * sin + p.z * cos;
            const scatter = Math.max(0, x * -1.4) * p.drift;
            const idleX = centerX + x * radius - scatter * radius * .65;
            const idleY = centerY + p.y * radius + Math.sin(phase * .18 + p.drift * 12) * 4;
            const onRoute = i < 210;
            const pathAt = (i / 210 * (route.length - 1) + phase * .12) % (route.length - 1 || 1);
            const a = onRoute ? nodes[route[Math.floor(pathAt)]] : nodes[i % nodes.length];
            const b = onRoute ? nodes[route[Math.min(Math.floor(pathAt) + 1, route.length - 1)]] : a;
            const fraction = onRoute ? pathAt % 1 : 0;
            const orbit = phase * (.5 + p.drift) + i * 2.4;
            const cloud = onRoute ? 3 + spread * 26 : 3 + spread * 17;
            const targetX = a.x + (b.x - a.x) * fraction + Math.cos(orbit) * cloud * p.drift;
            const targetY = a.y + (b.y - a.y) * fraction + Math.sin(orbit) * cloud * p.drift;
            const px = idleX + (targetX - idleX) * blend, py = idleY + (targetY - idleY) * blend;
            const alpha = (.15 + (z + 1) * .24) * (1 - blend * (onRoute ? -.3 : .65));
            if (p.px === undefined || reduced.matches || step < 0) { p.px = px; p.py = py; }
            else if (step > 0) {
                const pull = 1 - Math.exp(-step * (3.2 + p.drift * 3));
                p.px += (px - p.px) * pull; p.py += (py - p.py) * pull;
            }
            dot(p.px, p.py, p.size, p.warm || onRoute ? `rgba(255,130,0,${alpha})` : `rgba(255,255,255,${alpha * .7})`);
        }
        if (blend > .01) {
            for (let i = 0; i < nodes.length; i++) dot(nodes[i].x, nodes[i].y, i === goal ? 4 : 2, `rgba(255,255,255,${blend * .62})`);
            // Resolve the route from left to right after the visitor pauses to explore.
            const segments = progress * (route.length - 1);
            for (let i = 0; i < route.length - 1; i++) {
                const a = nodes[route[i]], b = nodes[route[i + 1]], t = Math.min(1, Math.max(0, segments - i));
                if (t) line(a, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, `rgba(255,130,0,${blend * .9})`, 2);
            }
            for (const i of [2, goal]) {
                const n = nodes[i];
                dot(n.x, n.y, 13, `rgba(255,130,0,${blend * .1})`);
                dot(n.x, n.y, 4, `rgba(255,130,0,${blend})`);
            }
        }
    }
    function running() { return !paused && !reduced.matches && inView && !document.hidden; }
    function tick(time) {
        frame = 0;
        if (!running()) { lastTime = 0; return; }
        const dt = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
        lastTime = time; phase += dt;
        blend += ((active ? 1 : 0) - blend) * (1 - Math.exp(-dt * 2.8));
        settled += dt;
        if (announce && settled > 2.2) { status.textContent = 'A way through. Want to try another?'; announce = false; }
        draw(dt); frame = requestAnimationFrame(tick);
    }
    function choose(target, fromButton = false) {
        if (paused && !reduced.matches) return;
        if (target === 2) target = 27;
        if (target !== goal || !active || fromButton) {
            goal = target; solve(goal); settled = 0;
        }
        active = true; pinned = fromButton;
        if (fromButton) {
            announce = !reduced.matches;
            status.textContent = reduced.matches ? 'A way through. Want to try another?' : 'Finding the connections…';
        }
        if (!fromButton && status.textContent) { announce = false; status.textContent = ''; }
        if (reduced.matches) { blend = 1; draw(); }
    }
    function sync() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; lastTime = 0;
        toggle.hidden = reduced.matches;
        toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
        toggle.setAttribute('aria-pressed', String(paused));
        trigger.disabled = paused && !reduced.matches;
        play.classList.toggle('is-still', reduced.matches);
        if (reduced.matches) { blend = 1; announce = false; }
        draw();
        if (running()) frame = requestAnimationFrame(tick);
    }
    function resize() {
        const bounds = hero.getBoundingClientRect(), panel = play.getBoundingClientRect();
        width = bounds.width; height = bounds.height;
        scene = width <= 1000
            ? { x: width * .1, y: panel.top - bounds.top - 235, w: width * .8, h: 190 }
            : { x: width * .59, y: height * .28, w: width * .34, h: height * .38 };
        nodes = grid.map(p => ({ x: scene.x + p.x * scene.w, y: scene.y + p.y * scene.h }));
        edges = links.map(([a, b]) => [a, b, Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y)]);
        solve(goal);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0); draw(-1);
    }
    hero.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch' || !running()) return;
        const bounds = hero.getBoundingClientRect(), x = event.clientX - bounds.left, y = event.clientY - bounds.top;
        pointerInside = x >= scene.x - 20 && x <= scene.x + scene.w + 20 && y >= scene.y - 30 && y <= scene.y + scene.h + 30;
        if (!pointerInside || event.target.closest('a, button')) { if (!pinned) active = false; return; }
        let nearest = 0, distance = Infinity;
        for (let i = 0; i < nodes.length; i++) {
            const d = Math.hypot(x - nodes[i].x, y - nodes[i].y);
            if (d < distance) { distance = d; nearest = i; }
        }
        choose(nearest);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointerInside = false; if (!pinned) active = false; });
    trigger.addEventListener('click', () => { pointerInside = false; choose(25 + ((goal + 2) % 5), true); });
    toggle.addEventListener('click', () => { paused = !paused; sync(); });
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize, { passive: true });
    play.hidden = false;
    resize(); sync();
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(hero);
    }
})();
