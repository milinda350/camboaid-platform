import { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

// ── Dummy Data ─────────────────────────────────────────────────────────────────

const NGO_SYSTEM = `You are an AI assistant for CamboAid Foundation, an NGO operating in Cambodia.

Organization: CamboAid Foundation
Mission: Empowering Cambodian communities through education, health, clean water, and women's empowerment.

Programs:
• Education for All — 4,523 children in Siem Reap, Battambang, Kampong Cham. Budget: $650K. Attendance: 91%.
• Clean Water Access — 2,800 households, 78 of 120 planned wells completed in 2026. Budget: $480K.
• Women Empowerment — 1,200 women in vocational skills and financial literacy training. Budget: $310K.
• Healthcare Outreach — 3,100 patients via mobile clinics across 6 provinces. Budget: $420K.
• Microfinance — 800 families, avg loan $500, 87% repayment rate. Budget: $280K.

Coverage: 6 provinces (Phnom Penh, Siem Reap, Battambang, Kampong Cham, Kandal, Kampot), 156 villages.
Staff: 85 total (30 international, 55 local Cambodian staff).
Annual budget: $2.5M | Main donors: USAID, European Union, Asian Development Bank.
Key metrics: 88% beneficiary satisfaction, 12,600 total beneficiaries in 2026.
Upcoming: Monsoon flood response Q3 2026, WFP partnership, digital literacy program in Phnom Penh.

Answer helpfully and professionally. Connect answers to Cambodia's development context when relevant.`;

const MEETING_TRANSCRIPT = `CamboAid Foundation — Q2 2026 Program Review Meeting
Date: June 15, 2026 | Phnom Penh HQ + Zoom
Attendees: Sarah Chen (Country Director), Dara Sok (Program Manager), Maly Pich (Finance Director), Tom Nguyen (Field Coordinator – North), Sreymom Heng (M&E Officer), James Wilson (Communications)

Sarah: Good morning everyone. Let's begin with Q2 program updates. Dara, please go ahead.

Dara: Education for All reached 4,523 children this quarter, up from 4,200 in Q1. Three new schools joined in Battambang. Attendance holds at 91%. Concern: teacher shortage in Kampong Cham — two schools at 60% teacher capacity.

Tom: Teachers in Kampong Cham are requesting professional development. I recommend coordinating with the Provincial Education Department for a refresher training in July.

Sarah: Noted — action item. Maly, budget update?

Maly: We are at 48% budget utilization year-to-date, slightly under our 50% target. The gap is in the water program due to procurement delays for pump parts. We expect to catch up in Q3.

Dara: On Water Access: 78 of 120 planned wells are complete. Remaining 42 are scheduled for Kandal and Kampot in Q3 — on track.

Sreymom: M&E update: beneficiary satisfaction survey shows 88% positive. Top concerns: distance to health facilities (42% of respondents) and demand for more vocational training options for women (35%).

James: The Kampong Cham well inauguration was picked up by a CNN affiliate. Great visibility. I propose a social media campaign around our upcoming monsoon response.

Sarah: Good. Tom, what is the monsoon risk picture?

Tom: High risk in Kampong Cham and Kandal river areas. Last year 3 villages flooded, 200 families displaced. I recommend pre-positioning emergency supply kits at district offices by July 15.

Maly: Emergency reserve is $45,000. Pre-positioning requires approximately $30,000.

Sarah: Approved. Allocate that now. Any other items?

Dara: Women Empowerment graduation is July 8. 145 women completing the vocational training cycle. Recommend inviting our major donors.

James: I will send invitations by end of this week.

Sarah: Perfect. Let's wrap up and confirm action items.`;

const FEEDBACK_DATA = [
  { id: 1, province: "Siem Reap", program: "Education", rating: 5, text: "My children attend school every day. Teachers are wonderful and materials are excellent. Very grateful to CamboAid." },
  { id: 2, province: "Battambang", program: "Water Access", rating: 5, text: "The new well changed our lives. Before we walked 2km for water. Now it is right here — clean and safe." },
  { id: 3, province: "Kampong Cham", program: "Healthcare", rating: 2, text: "The mobile clinic comes only once a month. When my child was sick I waited too long. Please visit more often." },
  { id: 4, province: "Kandal", program: "Women Empowerment", rating: 5, text: "I learned to sew and now sell clothes at the market. My income doubled in three months. This program gave me independence." },
  { id: 5, province: "Kampot", program: "Microfinance", rating: 3, text: "The loan helped me buy a fishing boat but repayment is very difficult during slow season. Need more flexibility." },
  { id: 6, province: "Phnom Penh", program: "Education", rating: 3, text: "Good program but we need more books and computers. School building needs repairs before the rainy season." },
  { id: 7, province: "Siem Reap", program: "Healthcare", rating: 5, text: "Doctor Vannak was very professional. My elderly mother received treatment she could never afford otherwise. Thank you." },
  { id: 8, province: "Battambang", program: "Microfinance", rating: 3, text: "I do not fully understand the loan documents. Need someone to explain in Khmer more clearly. The money did help my farm." },
  { id: 9, province: "Kampong Cham", program: "Water Access", rating: 1, text: "The pump broke after 4 months and nobody came to fix it for 6 weeks. We went back to river water. Very disappointed." },
  { id: 10, province: "Kandal", program: "Women Empowerment", rating: 4, text: "My group of 12 women graduated together. We started a small sewing cooperative. Hope for more support next year." },
];

const TREND_DATA = [
  { year: "2022", actual: 6200 },
  { year: "2023", actual: 8100 },
  { year: "2024", actual: 10400 },
  { year: "2025", actual: 11600 },
  { year: "2026", actual: 12600, projected: 12600 },
  { year: "2027", projected: 14200 },
  { year: "2028", projected: 15800 },
];

const BUDGET_DATA = [
  { name: "Education", budget: 650, spent: 312 },
  { name: "Water", budget: 480, spent: 198 },
  { name: "Women", budget: 310, spent: 156 },
  { name: "Healthcare", budget: 420, spent: 201 },
  { name: "Microfinance", budget: 280, spent: 134 },
];

const TABS = [
  { id: 0, label: "Chat assistant", icon: "ti-message-circle" },
  { id: 1, label: "Meeting summary", icon: "ti-notes" },
  { id: 2, label: "Impact forecast", icon: "ti-chart-line" },
  { id: 3, label: "Community sentiment", icon: "ti-heart" },
];

const RED = "#C8102E";

// ── API ────────────────────────────────────────────────────────────────────────

async function callClaude(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? "No response received.";
}

// ── Chat Tab ───────────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "How many beneficiaries do we have?",
  "What is the status of the water program?",
  "Which province has the most coverage?",
  "How is the microfinance program performing?",
];

function ChatTab() {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Sour sdei! 👋 I'm the CamboAid AI assistant. Ask me anything about our programs, beneficiaries, provinces, or operations across Cambodia." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text) => {
    const msg = text ?? input;
    if (!msg.trim() || busy) return;
    const updated = [...msgs, { role: "user", content: msg }];
    setMsgs(updated);
    setInput("");
    setBusy(true);
    try {
      const apiMsgs = updated.slice(1).map(m => ({ role: m.role, content: m.content }));
      const reply = await callClaude(apiMsgs, NGO_SYSTEM);
      setMsgs(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 500 }}>
      {msgs.length === 1 && (
        <div style={{ padding: "0.75rem 1rem", display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "0.5px solid var(--border)" }}>
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => send(q)} style={{ padding: "6px 12px", borderRadius: 20, border: `0.5px solid ${RED}`, background: "transparent", color: RED, fontSize: 12, cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-robot" style={{ color: "#fff", fontSize: 14 }} aria-hidden="true"></i>
              </div>
            )}
            <div style={{
              maxWidth: "78%", padding: "10px 14px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? RED : "var(--surface-2)",
              color: m.role === "user" ? "#fff" : "var(--text-primary)",
              border: m.role === "user" ? "none" : "0.5px solid var(--border)",
              fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-robot" style={{ color: "#fff", fontSize: 14 }} aria-hidden="true"></i>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "var(--surface-2)", border: "0.5px solid var(--border)", fontSize: 13, color: "var(--text-muted)" }}>Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "10px 1rem", borderTop: "0.5px solid var(--border)", background: "var(--surface-2)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask about programs, budget, provinces…" style={{ flex: 1, fontSize: 14 }} />
        <button onClick={() => send()} disabled={busy || !input.trim()} style={{ padding: "0 16px", background: RED, color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 18 }}>
          <i className="ti ti-send" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

// ── Meeting Tab ────────────────────────────────────────────────────────────────

function MeetingTab() {
  const [text, setText] = useState(MEETING_TRANSCRIPT);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setSummary(null);
    try {
      const reply = await callClaude([{
        role: "user",
        content: `Summarize this CamboAid Foundation NGO meeting transcript. Structure it into:\n\n**Key Decisions**\n**Action Items** (person + deadline)\n**Program Updates** (per program mentioned)\n**Risks & Concerns**\n**Next Steps**\n\nTranscript:\n${text}`
      }], "You are a professional meeting analyst for CamboAid Foundation, a Cambodia-based NGO. Be concise and structured.");
      setSummary(reply);
    } catch {
      setSummary("Error generating summary. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-warning)", borderRadius: "var(--radius)", border: "0.5px solid var(--border-warning)" }}>
        <i className="ti ti-info-circle" style={{ color: "var(--text-warning)", fontSize: 16, flexShrink: 0 }} aria-hidden="true"></i>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-warning)" }}>Pre-loaded: Q2 2026 program review meeting. Paste your own transcript to replace.</p>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} style={{ height: 220, fontFamily: "var(--font-mono)", fontSize: 12, resize: "vertical", lineHeight: 1.6, borderRadius: "var(--radius)" }} />
      <button onClick={run} disabled={busy} style={{ alignSelf: "flex-start", padding: "10px 20px", background: RED, color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
        {busy ? "Generating summary…" : "Generate summary ↗"}
      </button>
      {summary && (
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "0.5px solid var(--border)" }}>
            <i className="ti ti-file-check" style={{ color: RED, fontSize: 18 }} aria-hidden="true"></i>
            <span style={{ fontWeight: 500, fontSize: 14, color: "var(--text-primary)" }}>Meeting summary — June 15, 2026</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{summary}</div>
        </div>
      )}
    </div>
  );
}

// ── Forecast Tab ───────────────────────────────────────────────────────────────

function ForecastTab() {
  const [insight, setInsight] = useState(null);
  const [busy, setBusy] = useState(false);
  const tt = { background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 8, fontSize: 12 };

  const run = async () => {
    setBusy(true);
    setInsight(null);
    try {
      const reply = await callClaude([{
        role: "user",
        content: `Based on CamboAid Foundation data, give 3 strategic recommendations for 2027–2028 planning. Be specific, actionable, and reference Cambodia's development context.

Data snapshot:
- Beneficiaries: 6,200 (2022) → 12,600 (2026), targeting 15,800 by 2028
- Budget utilization: 48% mid-year (slightly behind target)
- Strongest program: Education (4,523 beneficiaries, 91% attendance)
- Key gap: Healthcare mobile clinics too infrequent — 42% of health beneficiaries concerned
- Opportunity: Women Empowerment graduates forming cooperatives
- Risk: Monsoon flooding in Kampong Cham and Kandal provinces`
      }], "You are a strategic advisor for Cambodia NGOs with expertise in development impact. Be specific and practical.");
      setInsight(reply);
    } catch {
      setInsight("Error generating insights. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {[
          { label: "Total beneficiaries", value: "12,600", note: "+9% vs 2025", icon: "ti-users" },
          { label: "Budget utilization", value: "48%", note: "Mid-year 2026", icon: "ti-coins" },
          { label: "Villages reached", value: "156", note: "6 provinces", icon: "ti-map-pin" },
          { label: "Satisfaction rate", value: "88%", note: "Q2 2026 survey", icon: "ti-star" },
        ].map(m => (
          <div key={m.label} style={{ background: "var(--surface-1)", borderRadius: "var(--radius)", padding: "1rem" }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{m.label}</p>
            <p style={{ margin: "4px 0 2px", fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>{m.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{m.note}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Beneficiary growth & 2-year projection</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={TREND_DATA} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tt} formatter={v => [v?.toLocaleString(), ""]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="actual" name="Actual" stroke={RED} strokeWidth={2} dot={{ r: 4, fill: RED }} connectNulls={false} />
            <Line type="monotone" dataKey="projected" name="Projected" stroke={RED} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: RED }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>2026 budget vs. spending by program (USD thousands)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={BUDGET_DATA} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => `$${v}k`} />
            <Tooltip contentStyle={tt} formatter={v => [`$${v}K`, ""]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="budget" name="Budget" fill="#e8b4b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent" fill={RED} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button onClick={run} disabled={busy} style={{ alignSelf: "flex-start", padding: "10px 20px", background: RED, color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
        {busy ? "Analyzing data…" : "Get AI strategic insights ↗"}
      </button>
      {insight && (
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
          {insight}
        </div>
      )}
    </div>
  );
}

// ── Sentiment Tab ──────────────────────────────────────────────────────────────

function SentimentTab() {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      const feedbackText = FEEDBACK_DATA.map((f, i) =>
        `${i + 1}. [${f.program} | ${f.province}] Rating: ${f.rating}/5 — "${f.text}"`
      ).join("\n");
      const reply = await callClaude([{
        role: "user",
        content: `Analyze community feedback from CamboAid Foundation beneficiaries in Cambodia. Return ONLY valid JSON, no markdown:\n{\n  "overall": "Positive|Mixed|Negative",\n  "score": <0-100>,\n  "summary": "<2 sentences>",\n  "themes": [{"label": "<theme>", "sentiment": "positive|neutral|negative", "detail": "<1 sentence>"}],\n  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]\n}\n\nFeedback:\n${feedbackText}`
      }], "You are a beneficiary feedback analyst for Cambodia NGOs. Respond only with valid JSON, nothing else.");
      const clean = reply.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      setResult({ error: true });
    }
    setBusy(false);
  };

  const sc = s => ({ positive: "#16a34a", neutral: "#ca8a04", negative: "#dc2626" }[s] ?? "var(--text-muted)");
  const bg = s => ({ positive: "var(--bg-success)", neutral: "var(--bg-warning)", negative: "var(--bg-danger)" }[s] ?? "var(--surface-1)");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
        10 community feedback entries from 6 provinces — Q2 2026 beneficiary survey
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FEEDBACK_DATA.map(f => (
          <div key={f.id} style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 14px", display: "flex", gap: 12 }}>
            <div style={{ flexShrink: 0, width: 96 }}>
              <p style={{ margin: 0, fontSize: 11, color: RED, fontWeight: 500 }}>{f.program}</p>
              <p style={{ margin: "2px 0 4px", fontSize: 11, color: "var(--text-muted)" }}>{f.province}</p>
              <span style={{ fontSize: 13, color: f.rating >= 4 ? "#16a34a" : f.rating <= 2 ? "#dc2626" : "#ca8a04" }}>
                {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, flex: 1 }}>{f.text}</p>
          </div>
        ))}
      </div>

      <button onClick={run} disabled={busy} style={{ alignSelf: "flex-start", padding: "10px 20px", background: RED, color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
        {busy ? "Analyzing sentiment…" : "Analyze community sentiment ↗"}
      </button>

      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
            <div style={{ background: "var(--surface-1)", borderRadius: "var(--radius)", padding: "1rem" }}>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Overall sentiment</p>
              <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 500, color: sc(result.overall?.toLowerCase()) }}>{result.overall}</p>
            </div>
            <div style={{ background: "var(--surface-1)", borderRadius: "var(--radius)", padding: "1rem" }}>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Satisfaction score</p>
              <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>{result.score}/100</p>
            </div>
          </div>
          <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>{result.summary}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.themes?.map((t, i) => (
                <div key={i} style={{ background: bg(t.sentiment), borderRadius: "var(--radius)", padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: sc(t.sentiment) }}>{t.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>{t.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Program recommendations</p>
            {result.recommendations?.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginTop: 8, paddingLeft: 12, borderLeft: `3px solid ${RED}` }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)" }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {result?.error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>Could not parse AI response. Please try again.</p>}
    </div>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--surface-0)", minHeight: "100vh" }}>
      <h2 style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }}>
        CamboAid Foundation AI Platform
      </h2>

      {/* Header */}
      <div style={{ background: RED, color: "#fff", padding: "14px 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 800, margin: "0 auto" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-heart-handshake" style={{ fontSize: 22 }} aria-hidden="true"></i>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 17, lineHeight: 1.3 }}>CamboAid Foundation</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>AI-powered NGO platform · Cambodia 🇰🇭</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 500 }}>12,600</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>beneficiaries</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ background: "var(--surface-2)", borderBottom: "0.5px solid var(--border)", overflowX: "auto" }}>
        <div style={{ display: "flex", maxWidth: 800, margin: "0 auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "11px 14px", border: "none",
              borderBottom: tab === t.id ? `2px solid ${RED}` : "2px solid transparent",
              background: "transparent",
              color: tab === t.id ? RED : "var(--text-secondary)",
              cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
              whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
            }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: 15 }} aria-hidden="true"></i>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "1.25rem", maxWidth: 800, margin: "0 auto" }}>
        {tab === 0 && <ChatTab />}
        {tab === 1 && <MeetingTab />}
        {tab === 2 && <ForecastTab />}
        {tab === 3 && <SentimentTab />}
      </div>
    </div>
  );
}
