/* Preview-mode sample data. In live mode this content lives in the Supabase `meetings` table,
   which only returns rows to approved members. Do not put confidential minutes in this file. */
window.PADPAO_DEMO_MEETINGS = [
  {
    id: "2026-10-12",
    title: "General Membership Meeting",
    meeting_date: "2026-10-12T10:00:00+08:00",
    venue: "Dagami, Leyte",
    prepared_by: "Antonie M. Silva, PRO",
    summary: "Coordination for the upcoming PNP SOSIA visit, the local-first policy with Board Members and District Representatives, and joint action with RCSU 8 and DOLE 8 against non-compliant operators.",
    minutes_status: "pending",
    resolutions: [],
    agenda: [
      { n: 1, title: "Opening & Prayer", lead: "President Ochea" },
      { n: 2, title: "Roll Call & Confirmation of Quorum", lead: "Secretary" },
      { n: 3, title: "Reading and Approval of Previous Minutes", lead: "Secretary" },
      { n: 4, title: "President's Report", lead: "Benedicto T. Ochea" },
      { n: 5, title: "Coming of PNP SOSIA", key: true, points: ["Visit and coordination with PADPAO EV", "Matters to be discussed with SOSIA"] },
      { n: 6, title: "Consultative Meeting with Board Members & District Representatives", key: true, points: ["Drafting of a policy prioritizing local businesses first", "Especially security agencies locally available"] },
      { n: 7, title: "Compliance & Licensing Concerns", points: ["Licensing requirements under RA 11917 (which replaced RA 5487)", "SRA requirements"] },
      { n: 8, title: "Membership Matters", points: ["Applications, renewals, dues"] },
      { n: 9, title: "Industry Issues & Concerns", lead: "Open Forum" },
      { n: 10, title: "Collaboration with RCSU 8 and DOLE 8", lead: "Antonie Silva (PRO)", key: true, points: ["Formal letters to be sent to PNP RCSU 8 and DOLE Region 8", "Joint effort to eliminate non-compliant players in the security industry", "Effect on local economy: non-remittance of taxes to local revenue districts", "Loss of livelihood for locally qualified individuals"] },
      { n: 11, title: "Communications & Publicity", lead: "Antonie Silva (PRO)", points: ["PADPAO EV Facebook page updates"] },
      { n: 12, title: "Future Activities / Schedules" },
      { n: 13, title: "Other Matters" },
      { n: 14, title: "Adjournment" }
    ],
    action_items: [
      { title: "Send formal letters to PNP RCSU 8 and DOLE Region 8", owner: "PRO", status: "open" },
      { title: "Prepare matters for discussion during the PNP SOSIA visit", owner: "Officers", status: "open" },
      { title: "Draft local-first policy for consultation with Board Members and District Representatives", owner: "Officers", status: "open" },
      { title: "Post meeting updates on the PADPAO EV Facebook page", owner: "PRO", status: "open" }
    ]
  }
];
