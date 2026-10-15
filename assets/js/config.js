/*
 * PADPAO EV — site configuration
 *
 * Leave supabaseUrl / supabaseAnonKey empty to run in DEMO MODE:
 *   accounts are stored only in this browser and Google/Facebook sign-in is simulated.
 *   Demo mode is for previewing the design. It does NOT protect member content.
 *
 * For real accounts and protected member content, create a Supabase project,
 * run supabase/schema.sql, enable the Google and Facebook providers, and fill in the two values below
 * (Project Settings → API). The anon key is designed to be public; Row Level Security protects the data.
 */
window.PADPAO_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",

  // In demo mode, new sign-ups are approved instantly so you can preview the members area.
  // With Supabase, new accounts start as "pending" until an officer approves them (see README).
  demoAutoApprove: true,

  org: {
    name: "PADPAO Eastern Visayas, Inc.",
    email: "",            // e.g. "padpao.ev@gmail.com"
    phone: "",            // e.g. "+63 9xx xxx xxxx"
    facebook: "",         // e.g. "https://www.facebook.com/padpaoev"
    office: ""            // e.g. "Tacloban City, Leyte"
  }
};
