document.documentElement.classList.add("js-ready");

const phrases = [
  "FastAPI, Spring Boot, and Angular workflows for regulated teams",
  "RAG pipelines with embeddings, citations, and audit trails",
  "OpenAI APIs, LangChain orchestration, and prompt engineering",
  "OWASP-aware security, secrets management, and least-privilege IAM",
  "CI/CD quality gates, Docker, Kubernetes, and accessible UI delivery"
];

const dynamicText = document.querySelector("#dynamic-text");
let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeLoop() {
  const phrase = phrases[phraseIndex];
  if (!dynamicText) return;

  dynamicText.textContent = phrase.slice(0, characterIndex);

  if (!deleting && characterIndex < phrase.length) {
    characterIndex += 1;
    window.setTimeout(typeLoop, 44);
    return;
  }

  if (!deleting && characterIndex === phrase.length) {
    deleting = true;
    window.setTimeout(typeLoop, 1300);
    return;
  }

  if (deleting && characterIndex > 0) {
    characterIndex -= 1;
    window.setTimeout(typeLoop, 22);
    return;
  }

  deleting = false;
  phraseIndex = (phraseIndex + 1) % phrases.length;
  window.setTimeout(typeLoop, 260);
}

typeLoop();

const header = document.querySelector("[data-header]");
window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 14);
});

const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

reveals.forEach((element) => revealObserver.observe(element));

const metricValues = document.querySelectorAll("[data-count]");
const metricObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateNumber(entry.target);
      metricObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

metricValues.forEach((element) => metricObserver.observe(element));

function animateNumber(element) {
  const target = Number.parseFloat(element.dataset.count || "0");
  const decimals = Number.isInteger(target) ? 0 : 2;
  const duration = 1250;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    element.textContent = current.toLocaleString(undefined, {
      minimumFractionDigits: decimals && progress === 1 ? decimals : 0,
      maximumFractionDigits: decimals
    });

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = target.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
  }

  requestAnimationFrame(tick);
}

const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const tags = card.dataset.tags || "";
      card.classList.toggle("is-hidden", filter !== "all" && !tags.includes(filter));
    });
  });
});

const canvas = document.querySelector("#signal-canvas");
const ctx = canvas?.getContext("2d");
let width = 0;
let height = 0;
let nodes = [];
let rafId = 0;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  nodes = createNodes(Math.max(34, Math.floor(width / 42)));
}

function createNodes(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    pulse: Math.random() * Math.PI * 2,
    kind: index % 6
  }));
}

function drawCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    node.pulse += 0.014;

    if (node.x < -24) node.x = width + 24;
    if (node.x > width + 24) node.x = -24;
    if (node.y < -24) node.y = height + 24;
    if (node.y > height + 24) node.y = -24;
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 145) {
        const alpha = (1 - distance / 145) * 0.16;
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  nodes.forEach((node) => {
    const radius = 1.15 + Math.sin(node.pulse) * 0.55;
    const palette = [
      "56, 189, 248",
      "45, 212, 191",
      "34, 197, 94",
      "245, 158, 11",
      "251, 113, 133",
      "125, 211, 252"
    ];
    ctx.fillStyle = `rgba(${palette[node.kind]}, 0.58)`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.max(0.8, radius), 0, Math.PI * 2);
    ctx.fill();
  });

  rafId = requestAnimationFrame(drawCanvas);
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function startCanvas() {
  if (!canvas || !ctx || reducedMotion.matches) return;
  cancelAnimationFrame(rafId);
  resizeCanvas();
  drawCanvas();
}

window.addEventListener("resize", resizeCanvas);
startCanvas();
