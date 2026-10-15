/* PADPAO EV — shared UI: icons, drawer, tooltips, collapsibles, reveal, toasts, PWA, auth-aware header */
(function () {
  document.documentElement.classList.remove("no-js");

  /* ---------- icon sprite ---------- */
  const P = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    flag: '<path d="M4 22V4"/><path d="M4 4s1.5-1 5-1 5 2 8 2 3-1 3-1v11s-1 1-3 1-5-2-8-2-5 1-5 1"/>',
    users: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1M16 3.1a4 4 0 0 1 0 7.8M22 21v-1a6 6 0 0 0-4-5.7"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.7 3.6M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
    scale: '<path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    megaphone: '<path d="M3 11v3a1 1 0 0 0 1 1h3l7 4V6L7 10H4a1 1 0 0 0-1 1zM18 9a4 4 0 0 1 0 6"/>',
    landmark: '<path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-7 10 7z"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2M17 6l3 3M15 8l2 2"/>',
    phoneapp: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    facebook: '<path fill="currentColor" stroke="none" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/>'
  };
  const sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    Object.entries(P).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("") + "</svg>";
  document.body.insertAdjacentHTML("afterbegin", sprite);
  window.icon = (n, cls = "") => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  /* ---------- toasts ---------- */
  let tray = document.querySelector(".toasts");
  if (!tray) { tray = document.createElement("div"); tray.className = "toasts"; tray.setAttribute("role", "status"); tray.setAttribute("aria-live", "polite"); document.body.appendChild(tray); }
  window.toast = (msg, type = "info", ms = 3800) => {
    const t = document.createElement("div"); t.className = `toast ${type}`;
    t.innerHTML = icon(type === "ok" ? "check" : type === "err" ? "alert" : "info") + `<span>${msg}</span>`;
    tray.appendChild(t); setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 260); }, ms);
  };

  /* ---------- header shadow ---------- */
  const header = document.querySelector(".site-header");
  if (header) { const f = () => header.classList.toggle("scrolled", scrollY > 8); addEventListener("scroll", f, { passive: true }); f(); }

  /* ---------- drawer ---------- */
  const drawer = document.querySelector(".drawer");
  if (drawer) {
    const scrim = document.querySelector(".scrim");
    const openers = document.querySelectorAll("[data-drawer-open]");
    let last = null;
    const focusables = () => drawer.querySelectorAll('a[href],button:not([disabled])');
    const open = () => {
      last = document.activeElement; document.body.classList.add("drawer-open"); drawer.removeAttribute("inert");
      drawer.setAttribute("aria-hidden", "false"); openers.forEach((b) => b.setAttribute("aria-expanded", "true"));
      setTimeout(() => focusables()[0] && focusables()[0].focus(), 50);
    };
    const close = () => {
      document.body.classList.remove("drawer-open"); drawer.setAttribute("inert", ""); drawer.setAttribute("aria-hidden", "true");
      openers.forEach((b) => b.setAttribute("aria-expanded", "false")); last && last.focus && last.focus();
    };
    drawer.setAttribute("inert", "");
    openers.forEach((b) => b.addEventListener("click", open));
    document.querySelectorAll("[data-drawer-close]").forEach((b) => b.addEventListener("click", close));
    scrim && scrim.addEventListener("click", close);
    drawer.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (!document.body.classList.contains("drawer-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const f = [...focusables()]; if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // swipe right to close
    let x0 = null;
    drawer.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    drawer.addEventListener("touchend", (e) => { if (x0 !== null && e.changedTouches[0].clientX - x0 > 70) close(); x0 = null; });
  }

  /* ---------- tooltips (hover, focus, tap) ---------- */
  const bubble = document.createElement("div"); bubble.className = "tip-bubble"; bubble.setAttribute("role", "tooltip"); bubble.id = "tip-bubble";
  document.body.appendChild(bubble);
  let tipFor = null;
  function showTip(el) {
    tipFor = el; bubble.textContent = el.getAttribute("data-tip"); el.setAttribute("aria-describedby", "tip-bubble");
    const r = el.getBoundingClientRect(); bubble.classList.remove("below"); bubble.style.left = "0px"; bubble.style.top = "0px";
    const b = bubble.getBoundingClientRect();
    let left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), innerWidth - b.width - 8);
    let top = r.top - b.height - 10;
    if (top < 8) { top = r.bottom + 10; bubble.classList.add("below"); }
    bubble.style.left = left + "px"; bubble.style.top = top + "px";
    bubble.style.setProperty("--ax", (r.left + r.width / 2 - left) + "px");
    requestAnimationFrame(() => bubble.classList.add("show"));
  }
  function hideTip() { if (tipFor) tipFor.removeAttribute("aria-describedby"); tipFor = null; bubble.classList.remove("show"); }
  document.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-tip]"); if (t && t !== tipFor && matchMedia("(hover:hover)").matches) showTip(t); });
  document.addEventListener("mouseout", (e) => { const t = e.target.closest("[data-tip]"); if (t && !t.contains(e.relatedTarget)) hideTip(); });
  document.addEventListener("focusin", (e) => { const t = e.target.closest("[data-tip]"); if (t) showTip(t); });
  document.addEventListener("focusout", (e) => { if (e.target.closest("[data-tip]")) hideTip(); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tip]");
    if (t && t.matches(".info-dot")) { e.preventDefault(); tipFor === t ? hideTip() : showTip(t); return; }
    if (!t) hideTip();
  });
  addEventListener("scroll", hideTip, { passive: true });
  document.addEventListener("keydown", (e) => e.key === "Escape" && hideTip());

  /* ---------- animated collapsibles (<details class="collapse">) ---------- */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function wireCollapse(d) {
    if (d.dataset.wired) return; d.dataset.wired = 1;
    const s = d.querySelector("summary"), body = d.querySelector(".collapse-body");
    if (!s || !body || reduce) return;
    s.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.classList.contains("animating")) return;
      // one-open-at-a-time groups
      if (!d.open && d.dataset.group) document.querySelectorAll(`details[data-group="${d.dataset.group}"][open]`).forEach((o) => o !== d && o.querySelector("summary").click());
      const start = d.offsetHeight; d.classList.add("animating");
      if (d.open) {
        const end = s.offsetHeight;
        d.animate({ height: [start + "px", end + "px"] }, { duration: 260, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = () => { d.open = false; d.classList.remove("animating"); };
      } else {
        d.open = true; const end = d.offsetHeight;
        d.animate({ height: [start + "px", end + "px"] }, { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = () => d.classList.remove("animating");
      }
    });
  }
  window.wireCollapsibles = (root = document) => root.querySelectorAll("details.collapse").forEach(wireCollapse);
  wireCollapsibles();

  /* ---------- reveal on scroll ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
  window.wireReveal = (root = document) => root.querySelectorAll(".reveal:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
  wireReveal();

  /* ---------- active bottom-nav item by section ---------- */
  const bn = document.querySelectorAll(".bottom-nav a[data-section]");
  if (bn.length && io) {
    const map = {}; bn.forEach((a) => (map[a.dataset.section] = a));
    const so = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && map[e.target.id]) { bn.forEach((a) => a.classList.remove("active")); map[e.target.id].classList.add("active"); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach((id) => { const s = document.getElementById(id); s && so.observe(s); });
  }

  /* ---------- password show/hide ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".toggle-pw"); if (!b) return;
    const inp = b.parentElement.querySelector("input"); const show = inp.type === "password";
    inp.type = show ? "text" : "password"; b.innerHTML = icon(show ? "eyeoff" : "eye");
    b.setAttribute("aria-label", show ? "Hide password" : "Show password"); b.setAttribute("aria-pressed", show);
  });

  /* ---------- PWA: service worker + install ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  let deferred = null;
  const installBox = document.querySelector(".install");
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; installBox && installBox.classList.add("show"); });
  document.querySelectorAll("[data-install]").forEach((b) => b.addEventListener("click", async () => {
    if (deferred) { deferred.prompt(); const r = await deferred.userChoice; deferred = null; installBox && installBox.classList.remove("show"); if (r.outcome === "accepted") toast("Installed. Find PADPAO EV on your home screen.", "ok"); }
    else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) toast("On iPhone: tap Share, then “Add to Home Screen”.", "info", 6000);
    else toast("Use your browser menu and choose “Install app” or “Add to Home screen”.", "info", 6000);
  }));
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone && installBox) installBox.classList.add("show");
  document.querySelectorAll("[data-install-dismiss]").forEach((b) => b.addEventListener("click", () => installBox && installBox.classList.remove("show")));

  /* ---------- auth-aware chrome ---------- */
  function initials(n) { return (n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join(""); }
  function paint(u) {
    document.body.classList.toggle("authed", !!u);
    document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = u ? u.name.split(" ")[0] : ""));
    document.querySelectorAll("[data-user-initials]").forEach((el) => (el.textContent = u ? initials(u.name) : ""));
  }
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-logout]"); if (!b) return;
    e.preventDefault(); document.body.dataset.loggingOut = "1"; await PadpaoAuth.signOut(); toast("You have been logged out.", "ok");
    if (document.body.dataset.page === "members") setTimeout(() => location.replace("index.html"), 500);
  });
  if (window.PadpaoAuth) {
    PadpaoAuth.onChange(paint);
    PadpaoAuth.init().then(paint).catch(() => paint(null));
  }

  /* config-driven contact info */
  const org = (window.PADPAO_CONFIG && PADPAO_CONFIG.org) || {};
  document.querySelectorAll("[data-org]").forEach((el) => {
    const k = el.dataset.org, v = org[k];
    if (!v) return;
    const label = el.querySelector("[data-org-value]");
    if (label) label.textContent = v;
    if (el.tagName === "A") el.href = k === "email" ? "mailto:" + v : k === "phone" ? "tel:" + v.replace(/\s/g, "") : v;
  });
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
