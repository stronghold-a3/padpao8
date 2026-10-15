/*
 * PADPAO EV — authentication layer
 * Uses Supabase Auth when configured (assets/js/config.js), otherwise a local demo store.
 * Exposes window.PadpaoAuth.
 */
(function () {
  const CFG = window.PADPAO_CONFIG || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const SB_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  const listeners = new Set();
  let client = null, readyP = null, current = null, recovery = false;

  const pageUrl = (p) => new URL(p, location.href).href.split("#")[0].split("?")[0];
  const emit = () => listeners.forEach((fn) => { try { fn(current); } catch (e) { console.error(e); } });

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.onload = res; s.onerror = () => rej(new Error("Could not load sign-in service. Check your connection."));
      document.head.appendChild(s);
    });
  }

  /* ---------- normalize user ---------- */
  function fromSupabase(u, profile) {
    if (!u) return null;
    const md = u.user_metadata || {};
    return {
      id: u.id, email: u.email,
      name: (profile && profile.full_name) || md.full_name || md.name || (u.email || "").split("@")[0],
      agency: (profile && profile.agency_name) || md.agency_name || "",
      position: (profile && profile.position) || md.position || "",
      province: (profile && profile.province) || md.province || "",
      phone: (profile && profile.phone) || md.phone || "",
      lto_number: (profile && profile.lto_number) || md.lto_number || "",
      provider: (u.app_metadata && u.app_metadata.provider) || "email",
      status: (profile && profile.status) || "pending",
      role: (profile && profile.role) || "member",
      emailConfirmed: !!u.email_confirmed_at
    };
  }

  async function loadProfile(u) {
    if (!u) return null;
    const { data } = await client.from("profiles").select("*").eq("id", u.id).maybeSingle();
    return data;
  }

  /* ---------- DEMO store (browser only) ---------- */
  const DK = "padpao_demo_users", SK = "padpao_demo_session";
  const demo = {
    users() { try { return JSON.parse(localStorage.getItem(DK)) || {}; } catch { return {}; } },
    save(u) { try { localStorage.setItem(DK, JSON.stringify(u)); } catch {} },
    session() { try { return JSON.parse(localStorage.getItem(SK)); } catch { return null; } },
    setSession(s) { try { s ? localStorage.setItem(SK, JSON.stringify(s)) : localStorage.removeItem(SK); } catch {} },
    async hash(pw, salt) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 120000, hash: "SHA-256" }, key, 256);
      return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
    },
    toUser(email, rec) {
      return { id: "demo-" + email, email, name: rec.full_name, agency: rec.agency_name || "", position: rec.position || "",
        province: rec.province || "", phone: rec.phone || "", lto_number: rec.lto_number || "", provider: rec.provider || "email", status: rec.status, role: rec.role || "member", emailConfirmed: true };
    }
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- init ---------- */
  function init() {
    if (readyP) return readyP;
    readyP = (async () => {
      if (!LIVE) {
        const s = demo.session(); const u = s && demo.users()[s.email];
        current = u ? demo.toUser(s.email, u) : null;
        return current;
      }
      if (!window.supabase) await loadScript(SB_CDN);
      client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" }
      });
      client.auth.onAuthStateChange(async (event, session) => {
        if (event === "PASSWORD_RECOVERY") recovery = true;
        const u = session && session.user;
        current = u ? fromSupabase(u, await loadProfile(u)) : null;
        emit();
      });
      const { data } = await client.auth.getSession();
      const u = data.session && data.session.user;
      current = u ? fromSupabase(u, await loadProfile(u)) : null;
      return current;
    })();
    return readyP;
  }

  function friendly(err) {
    const m = (err && (err.message || err.error_description)) || String(err);
    if (/invalid login/i.test(m)) return "Incorrect email or password.";
    if (/email not confirmed/i.test(m)) return "Please confirm your email first. Check your inbox for the verification link.";
    if (/already registered|already exists/i.test(m)) return "An account with this email already exists. Try logging in instead.";
    if (/rate limit|too many/i.test(m)) return "Too many attempts. Please wait a minute and try again.";
    if (/network|fetch/i.test(m)) return "Network problem. Check your connection and try again.";
    return m;
  }

  const api = {
    mode: LIVE ? "live" : "demo",
    init,
    get user() { return current; },
    get client() { return client; },
    get isRecovery() { return recovery || /type=recovery/.test(location.hash); },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    isApproved(u) { u = u || current; return !!u && (u.status === "approved" || u.role === "officer" || u.role === "admin"); },
    friendly,

    async signIn(email, password, remember = true) {
      await init();
      email = email.trim().toLowerCase();
      if (LIVE) {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new Error(friendly(error));
        await refresh(); return current;
      }
      await wait(500);
      const rec = demo.users()[email];
      if (!rec || rec.hash !== (await demo.hash(password, rec.salt))) throw new Error("Incorrect email or password.");
      demo.setSession({ email, remember }); current = demo.toUser(email, rec); emit(); return current;
    },

    async signUp(form) {
      await init();
      const email = form.email.trim().toLowerCase();
      const meta = { full_name: form.full_name, agency_name: form.agency_name, position: form.position, province: form.province,
        phone: form.phone || "", lto_number: form.lto_number || "" };
      if (LIVE) {
        const { data, error } = await client.auth.signUp({ email, password: form.password,
          options: { data: meta, emailRedirectTo: pageUrl("members.html") } });
        if (error) throw new Error(friendly(error));
        // Supabase returns a user with no identities when the email is already registered.
        if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error(friendly("already registered"));
        if (!data.session) return { needsConfirmation: true };
        await refresh(); return { user: current };
      }
      await wait(600);
      const users = demo.users();
      if (users[email]) throw new Error(friendly("already registered"));
      const salt = crypto.getRandomValues(new Uint32Array(4)).join("-");
      users[email] = { ...meta, salt, hash: await demo.hash(form.password, salt), status: CFG.demoAutoApprove ? "approved" : "pending", created: Date.now() };
      demo.save(users); demo.setSession({ email }); current = demo.toUser(email, users[email]); emit();
      return { user: current };
    },

    async signInWithProvider(provider, next) {
      await init();
      if (LIVE) {
        const { error } = await client.auth.signInWithOAuth({ provider,
          options: { redirectTo: pageUrl(next || "members.html"), scopes: provider === "facebook" ? "email" : undefined } });
        if (error) throw new Error(friendly(error));
        return { redirecting: true };
      }
      await wait(700);
      const label = provider === "google" ? "Google" : "Facebook";
      const email = `demo.${provider}@example.com`; const users = demo.users();
      if (!users[email]) users[email] = { full_name: `Demo ${label} Member`, agency_name: "Sample Security Agency", provider, status: CFG.demoAutoApprove ? "approved" : "pending", salt: "", hash: "" };
      demo.save(users); demo.setSession({ email }); current = demo.toUser(email, users[email]); emit();
      return { user: current, simulated: true };
    },

    async sendReset(email) {
      await init();
      email = email.trim().toLowerCase();
      if (LIVE) {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: pageUrl("auth.html") + "#reset" });
        if (error) throw new Error(friendly(error));
        return { sent: true };
      }
      await wait(600);
      return { sent: true, demoLink: demo.users()[email] ? pageUrl("auth.html") + "?demo_reset=" + encodeURIComponent(email) + "#reset" : null };
    },

    async updatePassword(password, demoEmail) {
      await init();
      if (LIVE) {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw new Error(friendly(error));
        recovery = false; return true;
      }
      await wait(500);
      const email = demoEmail || (current && current.email); const users = demo.users();
      if (!email || !users[email]) throw new Error("This reset link is invalid or has expired.");
      users[email].salt = crypto.getRandomValues(new Uint32Array(4)).join("-");
      users[email].hash = await demo.hash(password, users[email].salt); demo.save(users);
      return true;
    },

    async resendConfirmation(email) {
      await init();
      if (!LIVE) return true;
      const { error } = await client.auth.resend({ type: "signup", email, options: { emailRedirectTo: pageUrl("members.html") } });
      if (error) throw new Error(friendly(error));
      return true;
    },

    async signOut() {
      await init();
      if (LIVE) await client.auth.signOut(); else demo.setSession(null);
      current = null; emit();
    },

    async updateProfile(p) {
      await init();
      const clean = { full_name: p.full_name, agency_name: p.agency_name, position: p.position, province: p.province, phone: p.phone || null, lto_number: p.lto_number || null };
      if (LIVE) {
        const { error } = await client.from("profiles").update(clean).eq("id", current.id);
        if (error) throw new Error(friendly(error));
        await refresh(); return current;
      }
      await wait(400);
      const users = demo.users(); const rec = users[current.email]; Object.assign(rec, clean); demo.save(users);
      current = demo.toUser(current.email, rec); emit(); return current;
    },

    /* Members-only data. With Supabase, Row Level Security returns rows only to approved members. */
    async getMeetings() {
      await init();
      if (LIVE) {
        const { data, error } = await client.from("meetings").select("*").order("meeting_date", { ascending: false });
        if (error) throw new Error(friendly(error));
        return data || [];
      }
      if (!api.isApproved()) return [];
      if (!window.PADPAO_DEMO_MEETINGS) await loadScript(new URL("assets/js/demo-meetings.js", document.baseURI).href);
      return window.PADPAO_DEMO_MEETINGS || [];
    }
  };

  async function refresh() {
    if (!LIVE) return;
    const { data } = await client.auth.getUser();
    current = data.user ? fromSupabase(data.user, await loadProfile(data.user)) : null;
    emit();
  }

  window.PadpaoAuth = api;
})();
