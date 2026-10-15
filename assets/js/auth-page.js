/* PADPAO EV — sign up / log in / forgot / reset page */
(function () {
  const A = window.PadpaoAuth;
  const qs = new URLSearchParams(location.search);
  const rawNext = qs.get("next") || "members.html";
  const NEXT = /^[a-z0-9_-]+\.html(#[\w-]+)?$/i.test(rawNext) ? rawNext : "members.html"; // only local pages
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (A.mode === "demo") document.body.classList.add("demo");

  /* ---------- views ---------- */
  const tabbed = $("#tabbed"), tabs = $(".tabs");
  const titles = { login: ["Welcome back", "Log in to the PADPAO EV member portal."], signup: ["Become a member", "Create your account. It takes about two minutes."] };
  function show(view, push = true) {
    const isTab = view === "login" || view === "signup";
    tabbed.style.display = isTab ? "" : "none";
    $$(".auth-card > .view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
    if (isTab) {
      tabs.dataset.active = view;
      $$(".tabs [role=tab]").forEach((t) => { const on = t.dataset.view === view; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      $$("#tabbed > .view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
      $("#auth-title").textContent = titles[view][0]; $("#auth-sub").textContent = titles[view][1];
      document.title = (view === "login" ? "Log in" : "Become a member") + " · PADPAO Eastern Visayas";
    }
    clearAlert();
    if (push) { const u = new URL(location.href); u.searchParams.set("view", view); u.hash = ""; history.replaceState(null, "", u); }
    const first = document.querySelector(`#view-${view} input:not([type=checkbox])`);
    if (first && matchMedia("(hover:hover)").matches) setTimeout(() => first.focus(), 60);
  }
  $$(".tabs [role=tab]").forEach((t) => {
    t.addEventListener("click", () => show(t.dataset.view));
    t.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const o = t.dataset.view === "login" ? "signup" : "login"; show(o); $("#tab-" + o).focus(); } });
  });
  document.addEventListener("click", (e) => {
    const l = e.target.closest("[data-view-link],[data-goto]"); if (!l) return;
    e.preventDefault(); show(l.dataset.viewLink || l.dataset.goto);
  });

  /* ---------- alerts ---------- */
  function alertBox() { const v = $(".auth-card > .view.active"); return (v && v.querySelector(".alert")) || $("#alert"); }
  function setAlert(msg, type = "err") { const a = alertBox(); a.className = `alert show ${type}`; a.innerHTML = icon(type === "ok" ? "check" : type === "info" ? "info" : "alert") + `<span>${msg}</span>`; }
  function clearAlert() { $$(".alert").forEach((a) => (a.className = "alert")); }

  /* ---------- validation ---------- */
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  function rules(pw) { return { len: pw.length >= 8, case: /[a-z]/.test(pw) && /[A-Z]/.test(pw), num: /\d/.test(pw), sym: /[^A-Za-z0-9]/.test(pw) }; }
  const strongEnough = (pw) => { const r = rules(pw); return r.len && r.num && (r.case || r.sym); };
  function setInvalid(input, bad) {
    const f = input.closest(".field"); f && f.classList.toggle("invalid", bad); input.setAttribute("aria-invalid", bad);
    return !bad;
  }
  function validateField(input) {
    const v = input.type === "checkbox" ? input.checked : input.value;
    switch (input.name) {
      case "email": return setInvalid(input, !emailOk(v));
      case "password": return setInvalid(input, input.form.id === "login-form" ? !v : !strongEnough(v));
      case "password2": return setInvalid(input, !v || v !== input.form.password.value);
      case "phone": return setInvalid(input, !!v && !new RegExp(input.pattern).test(v.trim()));
      case "agree": return setInvalid(input, !v);
      default: return input.required ? setInvalid(input, !String(v).trim()) : true;
    }
  }
  $$("form input, form select").forEach((i) => {
    i.addEventListener("blur", () => i.value && validateField(i));
    i.addEventListener("input", () => i.closest(".field.invalid") && validateField(i));
    i.addEventListener("change", () => i.closest(".field.invalid") && validateField(i));
  });
  function validateAll(scope) { let ok = true, first = null; $$("input[name], select[name]", scope).forEach((i) => { if (!validateField(i)) { ok = false; first = first || i; } }); first && first.focus(); return ok; }

  // password meter
  $$('input[name=password][autocomplete="new-password"]').forEach((inp) => {
    const field = inp.closest(".field"), bar = field.querySelector(".meter i");
    inp.addEventListener("input", () => {
      const r = rules(inp.value), score = Object.values(r).filter(Boolean).length + (inp.value.length >= 12 ? 1 : 0);
      field.querySelectorAll(".rules li").forEach((li) => li.classList.toggle("ok", r[li.dataset.rule]));
      bar.style.width = Math.min(100, score * 20) + "%";
      bar.style.background = score <= 2 ? "var(--red)" : score <= 3 ? "var(--gold)" : "var(--green)";
    });
  });

  function busy(btn, on) { btn.classList.toggle("loading", on); btn.disabled = on; }
  const go = (u) => { location.href = u; };

  /* ---------- login ---------- */
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault(); clearAlert(); const f = e.target;
    if (!validateAll(f)) return;
    const btn = f.querySelector("[type=submit]"); busy(btn, true);
    try {
      const u = await A.signIn(f.email.value, f.password.value, f.remember.checked);
      toast(`Welcome back, ${u.name.split(" ")[0]}!`, "ok"); setTimeout(() => go(NEXT), 400);
    } catch (err) {
      setAlert(err.message);
      if (/confirm your email/i.test(err.message)) { const r = $("#resend"); r.hidden = false; r.dataset.email = f.email.value; }
      busy(btn, false);
    }
  });

  /* ---------- signup stepper ---------- */
  const sf = $("#signup-form"); let step = 1;
  const labels = { 1: "Your account", 2: "Your agency", 3: "Review & confirm" };
  function toStep(n) {
    step = n;
    $$(".form-step", sf).forEach((s) => s.classList.toggle("active", +s.dataset.step === n));
    $$(".stepper span").forEach((s, i) => s.classList.toggle("on", i < n));
    $("#step-label").textContent = `Step ${n} of 3 · ${labels[n]}`;
    if (n === 3) {
      const d = Object.fromEntries(new FormData(sf));
      const row = (k, v) => v ? `<div style="display:flex;justify-content:space-between;gap:12px;font-size:.88rem;padding:4px 0"><span class="muted">${k}</span><b style="color:var(--navy);text-align:right">${esc(v)}</b></div>` : "";
      $("#su-review").innerHTML = row("Name", d.full_name) + row("Email", d.email) + row("Agency", d.agency_name) + row("Position", d.position) + row("Province", d.province) + row("LTO no.", d.lto_number) + row("Mobile", d.phone);
    }
    const first = sf.querySelector(".form-step.active input, .form-step.active select"); first && setTimeout(() => first.focus(), 60);
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  sf.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) { if (validateAll(sf.querySelector(".form-step.active"))) toStep(step + 1); }
    if (e.target.closest("[data-prev]")) toStep(step - 1);
  });
  sf.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && step < 3 && e.target.tagName === "INPUT") { e.preventDefault(); sf.querySelector(".form-step.active [data-next]").click(); }
  });
  sf.addEventListener("submit", async (e) => {
    e.preventDefault(); clearAlert();
    if (step < 3) return;
    if (!validateAll(sf)) { const bad = sf.querySelector(".field.invalid"); const s = bad && +bad.closest(".form-step").dataset.step; if (s && s !== 3) toStep(s); return; }
    const btn = sf.querySelector("[type=submit]"); busy(btn, true);
    try {
      const res = await A.signUp(Object.fromEntries(new FormData(sf)));
      if (res.needsConfirmation) {
        showCheck("Confirm your email", `We sent a confirmation link to <b>${esc(sf.email.value)}</b>. Open it to activate your account.`, sf.email.value);
      } else {
        toast("Account created. Welcome to PADPAO EV!", "ok"); setTimeout(() => go(NEXT), 500);
      }
    } catch (err) {
      setAlert(err.message);
      if (/already exists/i.test(err.message)) toStep(1);
    } finally { busy(btn, false); }
  });

  /* ---------- social ---------- */
  $$("[data-provider]").forEach((b) => b.addEventListener("click", async () => {
    const label = b.dataset.provider === "google" ? "Google" : "Facebook";
    b.disabled = true; const old = b.innerHTML; b.innerHTML = `<span class="spinner"></span> Connecting to ${label}…`;
    try {
      const r = await A.signInWithProvider(b.dataset.provider, NEXT);
      if (r.simulated) { toast(`Preview: simulated ${label} sign-in.`, "info"); setTimeout(() => go(NEXT), 600); }
    } catch (err) { setAlert(err.message); b.disabled = false; b.innerHTML = old; }
  }));

  /* ---------- forgot ---------- */
  $("#forgot-form").addEventListener("submit", async (e) => {
    e.preventDefault(); clearAlert(); const f = e.target;
    if (!validateAll(f)) return;
    const btn = f.querySelector("[type=submit]"); busy(btn, true);
    try {
      const r = await A.sendReset(f.email.value);
      // Same message whether or not the account exists, so the form can't be used to discover members.
      showCheck("Check your email", `If an account exists for <b>${esc(f.email.value)}</b>, you'll receive a reset link shortly. It expires in 1 hour.`);
      if (r.demoLink) $("#check-extra").innerHTML = `<div class="alert show info" style="text-align:left">${icon("info")}<span>Preview mode has no email. <a class="link" href="${r.demoLink}">Open the reset link</a>.</span></div>`;
    } catch (err) { setAlert(err.message); } finally { busy(btn, false); }
  });

  /* ---------- reset ---------- */
  const demoResetEmail = qs.get("demo_reset");
  $("#reset-form").addEventListener("submit", async (e) => {
    e.preventDefault(); clearAlert(); const f = e.target;
    if (!validateAll(f)) return;
    const btn = f.querySelector("[type=submit]"); busy(btn, true);
    try {
      await A.updatePassword(f.password.value, demoResetEmail);
      toast("Password updated. You can now log in.", "ok");
      if (A.mode === "live" && A.user) setTimeout(() => go(NEXT), 600); else { show("login"); setAlert("Password updated. Log in with your new password.", "ok"); }
    } catch (err) { setAlert(err.message); } finally { busy(btn, false); }
  });

  /* ---------- check email ---------- */
  function showCheck(title, html, resendEmail) {
    $("#check-title").textContent = title; $("#check-sub").innerHTML = html; $("#check-extra").innerHTML = "";
    const r = $("#resend"); r.hidden = !resendEmail; if (resendEmail) r.dataset.email = resendEmail;
    show("check", false);
  }
  $("#resend").addEventListener("click", async (e) => {
    const b = e.currentTarget; b.disabled = true;
    try { await A.resendConfirmation(b.dataset.email); toast("Confirmation email sent again.", "ok"); }
    catch (err) { toast(err.message, "err"); }
    setTimeout(() => (b.disabled = false), 30000);
  });

  /* ---------- initial view ---------- */
  const reason = qs.get("reason");
  const initial = location.hash === "#reset" || /type=recovery/.test(location.hash) ? "reset"
    : location.hash === "#forgot" ? "forgot" : (qs.get("view") || "login");
  show(["login", "signup", "forgot", "reset"].includes(initial) ? initial : "login", false);
  if (reason === "members") setAlert("Please log in to view members-only content.", "info");
  if (reason === "expired") setAlert("Your session has ended. Please log in again.", "info");

  A.init().then((u) => {
    if (initial === "reset") { if (A.mode === "live" && !u && !A.isRecovery) setAlert("This reset link is invalid or has expired. Request a new one.", "err"); return; }
    if (u) { toast(`You're already logged in as ${u.name.split(" ")[0]}.`, "info"); setTimeout(() => go(NEXT), 700); }
  }).catch((err) => setAlert(err.message));
  A.onChange(() => { if (A.isRecovery) show("reset", false); });
})();
