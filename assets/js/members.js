/* PADPAO EV — members-only dashboard. Renders nothing until the visitor is signed in. */
(function () {
  const A = window.PadpaoAuth;
  const app = document.getElementById("app"), gate = document.getElementById("gate");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TABS = ["meetings", "actions", "profile"];
  let meetings = [];

  function toLogin(reason = "members") {
    const next = "members.html" + (TABS.includes(location.hash.slice(1)) ? location.hash : "");
    location.replace(`auth.html?view=login&reason=${reason}&next=${encodeURIComponent(next)}`);
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-PH", { weekday: "short", month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });
  const fmtTime = (d) => new Date(d).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
  const statusTag = (s) => s === "approved" ? `<span class="tag green">${icon("check", "i-sm")}Approved</span>`
    : s === "pending" ? `<span class="tag gold">${icon("hourglass", "i-sm")}Awaiting approval</span>` : `<span class="tag">${esc(s)}</span>`;

  /* ---------- render ---------- */
  function render(u) {
    const approved = A.isApproved(u);
    const incomplete = !u.agency || !u.position || !u.province;
    const m0 = meetings[0];
    app.innerHTML = `
      <section class="mem-hero"><div class="wrap">
        <span class="eyebrow" style="color:var(--gold)">Member portal</span>
        <h1>Welcome, ${esc(u.name.split(" ")[0])}</h1>
        <p>${esc(u.agency || "Complete your profile to finish your application")}</p>
      </div></section>
      <div class="wrap mem-body"><div class="mem-grid">
        <div>
          <div class="card status-card reveal">
            <span class="seal" style="width:52px"><img src="assets/icons/logo-circle-256.png" alt=""></span>
            <div style="flex:1;min-width:0">
              <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><b style="color:var(--navy)">Membership</b>${statusTag(approved ? "approved" : u.status)}</div>
              <p style="font-size:.86rem">${approved ? "You have full access to meeting records and member updates."
                : "Officers will review your application. Meeting records unlock once you're approved."}</p>
            </div>
          </div>
          ${incomplete ? `<div class="alert show info reveal" style="margin-top:12px">${icon("info")}<span>Your profile is missing agency details. <a href="#profile" class="link" data-tab-link="profile">Complete it now</a> so officers can verify you.</span></div>` : ""}
          ${approved ? `<div class="kpis reveal">
              <div class="kpi"><b>${meetings.length}</b><span>Meeting${meetings.length === 1 ? "" : "s"} on record</span></div>
              <div class="kpi"><b>${m0 ? m0.agenda.length : 0}</b><span>Items, latest agenda</span></div>
              <div class="kpi" data-tip="Follow-ups listed on the latest agenda that are still open" tabindex="0"><b>${m0 ? (m0.action_items || []).filter((a) => a.status !== "done").length : 0}</b><span>Open actions</span></div>
            </div>` : ""}

          <div class="seg" role="tablist" aria-label="Member sections">
            <button role="tab" data-tab="meetings" aria-pressed="true">${icon("calendar", "i-sm")} Meetings</button>
            <button role="tab" data-tab="actions" aria-pressed="false">${icon("check", "i-sm")} Action items</button>
            <button role="tab" data-tab="profile" aria-pressed="false">${icon("user", "i-sm")} Profile</button>
          </div>

          <div class="panel" id="panel-meetings" role="tabpanel">${approved ? meetingsHTML() : lockedHTML()}</div>
          <div class="panel" id="panel-actions" role="tabpanel">${approved ? actionsHTML() : lockedHTML()}</div>
          <div class="panel" id="panel-profile" role="tabpanel">${profileHTML(u)}</div>
        </div>

        <aside style="display:grid;gap:14px;margin-top:16px;align-content:start">
          ${m0 && approved ? `<div class="card reveal">
            <div class="card-row"><div class="card-icon gold">${icon("calendar")}</div>
              <div><h3>Latest meeting</h3><p>${esc(fmtDate(m0.meeting_date))}<br>${esc(m0.venue)}</p></div></div>
            <a class="btn btn-outline btn-sm btn-block" style="margin-top:12px" href="#meetings" data-tab-link="meetings" data-open-meeting="${esc(m0.id)}">View agenda</a>
          </div>` : ""}
          <div class="card reveal">
            <div class="card-row"><div class="card-icon">${icon("megaphone")}</div>
              <div><h3>Need help?</h3><p>Questions about your membership or dues? Contact the Public Relations Officer.</p></div></div>
          </div>
          <button class="btn btn-outline btn-block" data-logout>${icon("logout", "i-sm")} Log out</button>
        </aside>
      </div></div>`;
    wireCollapsibles(app); wireReveal(app); wireProfile(); selectTab(currentTab());
  }

  function lockedHTML() {
    return `<div class="card empty">${icon("lock")}<b style="color:var(--navy)">Available once you're approved</b>
      <p style="margin-top:4px">An officer will confirm your agency details. You'll see meeting agendas, minutes and resolutions here.</p></div>`;
  }

  function meetingsHTML() {
    if (!meetings.length) return `<div class="card empty">${icon("calendar")}<p>No meeting records yet.</p></div>`;
    return meetings.map((m, i) => `
      <details class="collapse reveal" id="m-${esc(m.id)}" ${i === 0 ? "open" : ""}>
        <summary>
          <span class="card-icon ${i === 0 ? "gold" : ""}" style="margin:0">${icon("calendar")}</span>
          <span style="min-width:0"><span style="display:block">${esc(m.title)}</span>
            <small class="muted" style="font-weight:500">${esc(fmtDate(m.meeting_date))} · ${esc(m.venue)}</small></span>
          ${icon("chev", "chev")}
        </summary>
        <div class="collapse-body">
          <div class="chips" style="margin-bottom:12px">
            <span class="chip">${icon("clock", "i-sm")}${esc(fmtTime(m.meeting_date))}</span>
            <span class="chip light">${icon("pin", "i-sm")}${esc(m.venue)}</span>
            ${m.minutes_status === "approved" ? `<span class="tag green">${icon("check", "i-sm")}Minutes approved</span>` : `<span class="tag gold" data-tip="Minutes are posted after the body approves them at the next meeting." tabindex="0">${icon("hourglass", "i-sm")}Minutes pending</span>`}
          </div>
          ${m.summary ? `<p>${esc(m.summary)}</p>` : ""}
          <details class="collapse" style="margin-top:14px" data-group="mt-${esc(m.id)}" open>
            <summary>${icon("file")} Agenda (${m.agenda.length} items) ${icon("chev", "chev")}</summary>
            <div class="collapse-body" style="padding:0 10px 10px">
              <div class="agenda-list">
                ${m.agenda.map((a) => `<div class="agenda-item ${a.key ? "key" : ""}">
                  <span class="num">${a.n}</span>
                  <div><h4>${esc(a.title)}${a.key ? ` <span class="info-dot" data-tip="Key action point" tabindex="0" role="img" aria-label="Key action point">${icon("flag", "i-sm")}</span>` : ""}</h4>
                    ${a.lead ? `<span class="who">${icon("user", "i-sm")}${esc(a.lead)}</span>` : ""}
                    ${a.points && a.points.length ? `<ul>${a.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}</div>
                </div>`).join("")}
              </div>
            </div>
          </details>
          <details class="collapse" data-group="mt-${esc(m.id)}">
            <summary>${icon("scale")} Resolutions ${icon("chev", "chev")}</summary>
            <div class="collapse-body">${(m.resolutions || []).length ? `<ul>${m.resolutions.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>`
              : `<p>No resolutions posted yet. They'll appear here once the minutes are approved.</p>`}</div>
          </details>
          ${m.prepared_by ? `<p style="font-size:.8rem;margin-top:12px">Prepared by ${esc(m.prepared_by)}</p>` : ""}
        </div>
      </details>`).join("");
  }

  function actionsHTML() {
    const items = meetings.flatMap((m) => (m.action_items || []).map((a) => ({ ...a, m })));
    if (!items.length) return `<div class="card empty">${icon("check")}<p>No action items yet.</p></div>`;
    return `<p class="muted" style="font-size:.85rem;margin-bottom:10px">Follow-ups listed on meeting agendas.</p>` + items.map((a) => `
      <div class="doc reveal">
        <span class="card-icon ${a.status === "done" ? "" : "gold"}" style="margin:0">${icon(a.status === "done" ? "check" : "hourglass")}</span>
        <div style="flex:1;min-width:0"><b>${esc(a.title)}</b><small>${esc(a.owner || "")} · ${esc(fmtDate(a.m.meeting_date))}</small></div>
        ${a.status === "done" ? `<span class="tag green">Done</span>` : `<span class="tag gold">Open</span>`}
      </div>`).join("");
  }

  const PROVS = ["Leyte", "Southern Leyte", "Biliran", "Samar", "Eastern Samar", "Northern Samar"];
  const POS = ["Owner / Operator", "President / General Manager", "Operations Manager", "Authorized Representative"];
  function profileHTML(u) {
    const opt = (list, v) => `<option value="">Select…</option>` + list.map((o) => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("");
    return `<div class="card">
      <div class="card-row" style="margin-bottom:16px"><div class="avatar" style="margin:0;width:52px;height:52px;font-size:1rem">${esc(u.name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase())}</div>
        <div style="min-width:0"><h3>${esc(u.name)}</h3><p style="word-break:break-all">${esc(u.email)}</p>
        <span class="tag" style="margin-top:4px">${icon(u.provider === "facebook" ? "facebook" : u.provider === "google" ? "mail" : "key", "i-sm")}Signed in with ${u.provider === "email" ? "email" : esc(u.provider[0].toUpperCase() + u.provider.slice(1))}</span></div></div>
      <form id="profile-form" novalidate>
        <div class="field"><label for="pf-name">Full name</label><div class="input-wrap">${icon("user")}<input class="input" id="pf-name" name="full_name" required value="${esc(u.name)}"></div></div>
        <div class="field"><label for="pf-agency">Agency name</label><div class="input-wrap">${icon("building")}<input class="input" id="pf-agency" name="agency_name" required value="${esc(u.agency)}"></div></div>
        <div class="row-2">
          <div class="field"><label for="pf-pos">Position</label><div class="input-wrap">${icon("briefcase")}<select class="input" id="pf-pos" name="position" required>${opt(POS, u.position)}</select></div></div>
          <div class="field"><label for="pf-prov">Province</label><div class="input-wrap">${icon("pin")}<select class="input" id="pf-prov" name="province" required>${opt(PROVS, u.province)}</select></div></div>
        </div>
        <div class="row-2">
          <div class="field"><label for="pf-lto">LTO no. <span class="opt">(optional)</span></label><div class="input-wrap">${icon("file")}<input class="input" id="pf-lto" name="lto_number" value="${esc(u.lto_number || "")}"></div></div>
          <div class="field"><label for="pf-phone">Mobile <span class="opt">(optional)</span></label><div class="input-wrap">${icon("phone")}<input class="input" id="pf-phone" name="phone" type="tel" inputmode="tel" value="${esc(u.phone || "")}"></div></div>
        </div>
        <button class="btn btn-navy btn-block" type="submit"><span class="spinner"></span><span>Save profile</span></button>
      </form>
      ${u.provider === "email" ? `<p class="fineprint">Want to change your password? <a class="link" href="auth.html?view=forgot#forgot">Send a reset link</a></p>` : ""}
    </div>`;
  }

  function wireProfile() {
    const f = document.getElementById("profile-form"); if (!f) return;
    f.addEventListener("submit", async (e) => {
      e.preventDefault(); let ok = true;
      f.querySelectorAll("[required]").forEach((i) => { const bad = !i.value.trim(); i.setAttribute("aria-invalid", bad); if (bad) ok = false; });
      if (!ok) { toast("Please fill in the required fields.", "err"); return; }
      const btn = f.querySelector("[type=submit]"); btn.classList.add("loading");
      try { const u = await A.updateProfile(Object.fromEntries(new FormData(f))); toast("Profile saved.", "ok"); render(u); location.hash = "profile"; }
      catch (err) { toast(err.message, "err"); btn.classList.remove("loading"); }
    });
  }

  /* ---------- tabs (hash-driven so links & back button work) ---------- */
  const currentTab = () => (TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "meetings");
  function selectTab(t) {
    document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tab === t));
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + t));
    document.querySelectorAll(".bottom-nav [data-tab-link]").forEach((a) => a.classList.toggle("active", a.dataset.tabLink === t));
    wireReveal(app);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) { history.replaceState(null, "", "#" + b.dataset.tab); selectTab(b.dataset.tab); }
    const l = e.target.closest("[data-tab-link]");
    if (l) {
      e.preventDefault(); history.replaceState(null, "", "#" + l.dataset.tabLink); selectTab(l.dataset.tabLink);
      const seg = document.querySelector(".seg"); seg && seg.scrollIntoView({ behavior: "smooth", block: "start" });
      const mid = l.dataset.openMeeting; if (mid) { const d = document.getElementById("m-" + mid); if (d && !d.open) d.querySelector("summary").click(); }
    }
  });
  addEventListener("hashchange", () => selectTab(currentTab()));

  /* ---------- guard ---------- */
  A.init().then(async (u) => {
    if (!u) return toLogin();
    try { meetings = A.isApproved(u) ? await A.getMeetings() : []; }
    catch (err) { toast(err.message, "err"); }
    meetings.forEach((m) => { if (typeof m.agenda === "string") m.agenda = JSON.parse(m.agenda); });
    gate.remove(); app.hidden = false; render(u);
  }).catch((err) => { gate.innerHTML = `<div><p>${esc(err.message)}</p><a class="btn btn-navy" style="margin-top:12px" href="members.html">Try again</a></div>`; });

  A.onChange((u) => { if (!u && !document.body.dataset.loggingOut) toLogin("expired"); });
})();
