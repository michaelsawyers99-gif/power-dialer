import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const INITIAL_CONTACTS = [
  { id: 1, name: "Sarah Chen", phone: "+1 (415) 555-0182", company: "Apex Corp", status: "pending", outcome: null, duration: null, notes: "" },
  { id: 2, name: "Marcus Webb", phone: "+1 (312) 555-0247", company: "Nexus LLC", status: "pending", outcome: null, duration: null, notes: "" },
  { id: 3, name: "Priya Nair", phone: "+1 (646) 555-0391", company: "Orbit Inc", status: "completed", outcome: "answered", duration: "3:42", notes: "Interested, call back Thursday" },
  { id: 4, name: "Jordan Blake", phone: "+1 (213) 555-0128", company: "Titan Co", status: "completed", outcome: "voicemail", duration: "0:31", notes: "" },
  { id: 5, name: "Elena Russo", phone: "+1 (617) 555-0456", company: "Solaris AG", status: "completed", outcome: "no-answer", duration: "0:00", notes: "" },
  { id: 6, name: "Dev Patel", phone: "+1 (408) 555-0763", company: "Vortex Ltd", status: "pending", outcome: null, duration: null, notes: "" },
  { id: 7, name: "Mia Torres", phone: "+1 (305) 555-0299", company: "Helix Bio", status: "pending", outcome: null, duration: null, notes: "" },
];

const DEFAULT_SCRIPT = `Hello, may I speak with {contact_name}?

[PAUSE — wait for response]

Hi {contact_name}, this is {agent_name} calling from {company}. I hope I'm catching you at a good time.

[IF YES] Great! I'm reaching out because we've been helping companies like {contact_company} with [VALUE PROP]. I'd love to share how we can help you [BENEFIT].

[IF BUSY] No problem at all — when would be a better time to connect? I can schedule a call at your convenience.

[IF VOICEMAIL]
Hi {contact_name}, this is {agent_name} from {company}. I'm calling about [TOPIC]. I'll try you again soon, or feel free to reach me at {callback_number}. Have a great day!`;

const DEFAULT_IVR = [
  { id: 1, key: "1", label: "Schedule a Demo", action: "transfer", target: "demo-queue" },
  { id: 2, key: "2", label: "Pricing Information", action: "playback", target: "pricing-message" },
  { id: 3, key: "3", label: "Speak to a Rep", action: "transfer", target: "sales-queue" },
  { id: 4, key: "9", label: "Remove from List", action: "tag", target: "opt-out" },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const PhoneIcon = ({ size }) => <Icon size={size} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.99 1.18 2 2 0 012.98 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />;
const StopIcon = ({ size }) => <Icon size={size} d="M9 9h6v6H9zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
const PlayIcon = ({ size }) => <Icon size={size} d="M5 3l14 9-14 9V3z" />;
const PauseIcon = ({ size }) => <Icon size={size} d="M6 4h4v16H6zM14 4h4v16h-4z" />;
const SkipIcon = ({ size }) => <Icon size={size} d="M5 4l10 8-10 8V4zM19 4v16" />;
const SettingsIcon = ({ size }) => <Icon size={size} d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />;
const ListIcon = ({ size }) => <Icon size={size} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const ChartIcon = ({ size }) => <Icon size={size} d="M18 20V10M12 20V4M6 20v-6" />;
const ServerIcon = ({ size }) => <Icon size={size} d="M2 3h20v6H2zM2 15h20v6H2zM6 6h.01M6 18h.01" />;
const ScriptIcon = ({ size }) => <Icon size={size} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function OutcomeBadge({ outcome }) {
  const map = {
    answered: { label: "Answered", bg: "#00d97e22", color: "#00d97e", border: "#00d97e44" },
    voicemail: { label: "Voicemail", bg: "#f6c90e22", color: "#f6c90e", border: "#f6c90e44" },
    "no-answer": { label: "No Answer", bg: "#e5515122", color: "#e55151", border: "#e5515144" },
    busy: { label: "Busy", bg: "#a78bfa22", color: "#a78bfa", border: "#a78bfa44" },
  };
  if (!outcome) return null;
  const s = map[outcome] || map["no-answer"];
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 4, fontSize: 11, padding: "2px 8px", fontFamily: "monospace", letterSpacing: 0.5 }}>
      {s.label}
    </span>
  );
}

function StatusDot({ status }) {
  const colors = { pending: "#64748b", active: "#00d97e", completed: "#3b82f6", error: "#e55151" };
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: colors[status] || "#64748b", marginRight: 6, boxShadow: status === "active" ? `0 0 6px ${colors.active}` : "none" }} />;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function SipConfig({ config, setConfig }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(Math.random() > 0.2 ? "success" : "error");
    }, 1800);
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={config[key] || ""}
        placeholder={placeholder}
        onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
        style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#e2e8f0", padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Fira Code', monospace" }}
      />
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, marginBottom: 4, letterSpacing: 0.3 }}>SIP Provider Configuration</h2>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>Connect to your SIP trunk or hosted PBX for outbound call routing.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        {field("SIP Server / Domain", "server", "text", "sip.provider.com")}
        {field("SIP Port", "port", "text", "5060")}
        {field("Username / Extension", "username", "text", "user@sip.provider.com")}
        {field("Password", "password", "password", "••••••••")}
        {field("Outbound Proxy", "proxy", "text", "proxy.provider.com")}
        {field("Caller ID (FROM)", "callerId", "text", "+1 (800) 555-0100")}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Transport</label>
        <div style={{ display: "flex", gap: 10 }}>
          {["UDP", "TCP", "TLS"].map(t => (
            <button key={t} onClick={() => setConfig(c => ({ ...c, transport: t }))}
              style={{ padding: "7px 18px", borderRadius: 5, border: "1px solid", borderColor: config.transport === t ? "#3b82f6" : "#1e293b", background: config.transport === t ? "#3b82f620" : "#0f172a", color: config.transport === t ? "#60a5fa" : "#64748b", cursor: "pointer", fontSize: 12, fontFamily: "'Fira Code', monospace" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Codec Priority</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["PCMU (G.711u)", "PCMA (G.711a)", "G.729", "OPUS"].map(c => {
            const active = (config.codecs || ["PCMU (G.711u)", "OPUS"]).includes(c);
            return (
              <button key={c} onClick={() => setConfig(cfg => {
                const list = cfg.codecs || ["PCMU (G.711u)", "OPUS"];
                return { ...cfg, codecs: active ? list.filter(x => x !== c) : [...list, c] };
              })}
                style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid", borderColor: active ? "#00d97e44" : "#1e293b", background: active ? "#00d97e15" : "#0f172a", color: active ? "#00d97e" : "#475569", cursor: "pointer", fontSize: 11, fontFamily: "'Fira Code', monospace" }}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
        <button onClick={testConnection} disabled={testing}
          style={{ padding: "9px 22px", background: testing ? "#1e293b" : "#3b82f6", color: testing ? "#64748b" : "#fff", border: "none", borderRadius: 6, cursor: testing ? "default" : "pointer", fontSize: 13, fontWeight: 600 }}>
          {testing ? "Testing…" : "Test Connection"}
        </button>
        {testResult === "success" && <span style={{ color: "#00d97e", fontSize: 12 }}>✓ SIP registration successful</span>}
        {testResult === "error" && <span style={{ color: "#e55151", fontSize: 12 }}>✗ Connection failed — check credentials</span>}
      </div>
    </div>
  );
}

function ScriptEditor({ script, setScript }) {
  const variables = ["{contact_name}", "{contact_company}", "{agent_name}", "{company}", "{callback_number}", "{date}", "{time}"];
  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, marginBottom: 4, letterSpacing: 0.3 }}>Call Script Editor</h2>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>Write your call script with dynamic variable substitution and branching logic tags.</p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Available Variables</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {variables.map(v => (
            <button key={v} onClick={() => setScript(s => s + " " + v)}
              style={{ background: "#1e293b", color: "#60a5fa", border: "1px solid #334155", borderRadius: 4, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontFamily: "'Fira Code', monospace" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Script</label>
        <textarea value={script} onChange={e => setScript(e.target.value)}
          style={{ width: "100%", minHeight: 320, background: "#0b1120", border: "1px solid #1e293b", borderRadius: 8, color: "#cbd5e1", padding: 16, fontSize: 13, lineHeight: 1.7, fontFamily: "'Fira Code', monospace", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 16 }}>
        <p style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Scripting Tags</p>
        {[["[PAUSE]", "Insert a wait point for the agent to listen"], ["[IF YES]", "Branch for affirmative response"], ["[IF BUSY]", "Branch when prospect is unavailable"], ["[IF VOICEMAIL]", "Voicemail-specific copy"]].map(([tag, desc]) => (
          <div key={tag} style={{ display: "flex", gap: 12, marginBottom: 5 }}>
            <code style={{ color: "#a78bfa", fontSize: 11, minWidth: 120 }}>{tag}</code>
            <span style={{ color: "#475569", fontSize: 11 }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IvrBuilder({ nodes, setNodes }) {
  const actions = ["transfer", "playback", "tag", "hangup", "repeat"];

  const update = (id, field, val) => setNodes(ns => ns.map(n => n.id === id ? { ...n, [field]: val } : n));
  const remove = (id) => setNodes(ns => ns.filter(n => n.id !== id));
  const add = () => setNodes(ns => [...ns, { id: Date.now(), key: "", label: "New Option", action: "transfer", target: "" }]);

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, marginBottom: 4, letterSpacing: 0.3 }}>IVR Menu Builder</h2>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>Define DTMF keypress routing for inbound call handling and post-dial menus.</p>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>Greeting Prompt</p>
        <textarea defaultValue="Thank you for your interest. Press 1 to schedule a demo. Press 2 for pricing. Press 3 to speak with a representative. Press 9 to be removed from our list."
          style={{ width: "100%", background: "#0b1120", border: "1px solid #1e293b", borderRadius: 6, color: "#cbd5e1", padding: 12, fontSize: 12, fontFamily: "'Fira Code', monospace", resize: "none", height: 80, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {nodes.map(node => (
          <div key={node.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 14, display: "grid", gridTemplateColumns: "48px 1fr 130px 1fr 36px", gap: 10, alignItems: "center" }}>
            <div>
              <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 4 }}>KEY</label>
              <input value={node.key} onChange={e => update(node.id, "key", e.target.value)} maxLength={1}
                style={{ width: "100%", background: "#0b1120", border: "1px solid #334155", borderRadius: 4, color: "#f6c90e", padding: "6px 8px", fontSize: 16, textAlign: "center", outline: "none", fontFamily: "'Fira Code', monospace", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 4 }}>LABEL</label>
              <input value={node.label} onChange={e => update(node.id, "label", e.target.value)}
                style={{ width: "100%", background: "#0b1120", border: "1px solid #1e293b", borderRadius: 4, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 4 }}>ACTION</label>
              <select value={node.action} onChange={e => update(node.id, "action", e.target.value)}
                style={{ width: "100%", background: "#0b1120", border: "1px solid #1e293b", borderRadius: 4, color: "#a78bfa", padding: "6px 8px", fontSize: 12, outline: "none" }}>
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 4 }}>TARGET / VALUE</label>
              <input value={node.target} onChange={e => update(node.id, "target", e.target.value)}
                style={{ width: "100%", background: "#0b1120", border: "1px solid #1e293b", borderRadius: 4, color: "#94a3b8", padding: "6px 10px", fontSize: 12, fontFamily: "'Fira Code', monospace", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => remove(node.id)}
              style={{ background: "transparent", border: "1px solid #1e293b", borderRadius: 4, color: "#e55151", cursor: "pointer", padding: "6px 8px", fontSize: 14, lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>

      <button onClick={add}
        style={{ background: "transparent", border: "1px dashed #334155", borderRadius: 8, color: "#64748b", cursor: "pointer", padding: "10px 20px", fontSize: 12, width: "100%" }}>
        + Add Menu Option
      </button>
    </div>
  );
}

function Dialer({ contacts, setContacts }) {
  const [dialerState, setDialerState] = useState("idle"); // idle | running | paused | calling
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [callTimer, setCallTimer] = useState(0);
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);
  const callRef = useRef(null);
  const logRef = useRef(null);

  const pending = contacts.filter(c => c.status === "pending");
  const current = pending[0] || null;

  useEffect(() => {
    if (dialerState === "running") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [dialerState]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const addLog = (msg, type = "info") => {
    const entry = { id: Date.now(), time: new Date().toLocaleTimeString(), msg, type };
    setLog(l => [entry, ...l.slice(0, 49)]);
  };

  const simulateCall = (contact) => {
    setDialerState("calling");
    setCallTimer(0);
    addLog(`Dialing ${contact.name} — ${contact.phone}`, "dial");

    let t = 0;
    callRef.current = setInterval(() => {
      t++;
      setCallTimer(t);
      if (t > 28) {
        clearInterval(callRef.current);
        const outcomes = ["answered", "voicemail", "no-answer", "busy"];
        const weights = [0.45, 0.3, 0.2, 0.05];
        let r = Math.random(), cum = 0, outcome = "no-answer";
        for (let i = 0; i < outcomes.length; i++) { cum += weights[i]; if (r < cum) { outcome = outcomes[i]; break; } }
        const dur = outcome === "answered" ? `${Math.floor(Math.random() * 5 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` : outcome === "voicemail" ? "0:31" : "0:00";
        setContacts(cs => cs.map(c => c.id === contact.id ? { ...c, status: "completed", outcome, duration: dur } : c));
        addLog(`${contact.name} — ${outcome.toUpperCase()}${dur !== "0:00" ? ` (${dur})` : ""}`, outcome);
        setDialerState("running");
      }
    }, 200);
  };

  useEffect(() => {
    if (dialerState === "running") {
      const next = contacts.find(c => c.status === "pending");
      if (next) {
        const delay = setTimeout(() => simulateCall(next), 1200);
        return () => clearTimeout(delay);
      } else {
        setDialerState("idle");
        addLog("Campaign complete — all contacts dialed.", "complete");
      }
    }
  }, [dialerState, contacts]);

  const start = () => { setElapsed(0); setDialerState("running"); addLog("Campaign started.", "info"); };
  const pause = () => { setDialerState("paused"); clearInterval(callRef.current); addLog("Campaign paused.", "info"); };
  const resume = () => { setDialerState("running"); addLog("Campaign resumed.", "info"); };
  const stop = () => { setDialerState("idle"); clearInterval(callRef.current); addLog("Campaign stopped.", "info"); };
  const skip = () => {
    clearInterval(callRef.current);
    const calling = contacts.find(c => c.status === "pending");
    if (calling) {
      setContacts(cs => cs.map(c => c.id === calling.id ? { ...c, status: "completed", outcome: "no-answer", duration: "0:00" } : c));
      addLog(`Skipped ${calling.name}`, "info");
    }
    setDialerState("running");
  };

  const stats = { total: contacts.length, completed: contacts.filter(c => c.status === "completed").length, answered: contacts.filter(c => c.outcome === "answered").length, voicemail: contacts.filter(c => c.outcome === "voicemail").length };
  const rate = stats.completed ? Math.round((stats.answered / stats.completed) * 100) : 0;

  const stateColor = { idle: "#64748b", running: "#00d97e", paused: "#f6c90e", calling: "#3b82f6" };

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, marginBottom: 4, letterSpacing: 0.3 }}>Power Dialer</h2>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>Automated outbound dialing with real-time outcome tracking.</p>

      {/* Status Bar */}
      <div style={{ background: "#0f172a", border: `1px solid ${stateColor[dialerState]}33`, borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: stateColor[dialerState], boxShadow: dialerState !== "idle" ? `0 0 8px ${stateColor[dialerState]}` : "none" }} />
          <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{dialerState === "calling" ? `Calling — ${fmt(callTimer)}` : dialerState}</span>
          {current && dialerState !== "idle" && <span style={{ color: "#64748b", fontSize: 12 }}>· {current?.name}</span>}
        </div>
        <div style={{ color: "#475569", fontSize: 12, fontFamily: "'Fira Code', monospace" }}>{fmt(elapsed)} elapsed</div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {dialerState === "idle" && (
          <button onClick={start} disabled={pending.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: pending.length ? "#00d97e" : "#1e293b", color: pending.length ? "#011a0d" : "#334155", border: "none", borderRadius: 7, cursor: pending.length ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
            <PlayIcon size={14} /> Start Campaign
          </button>
        )}
        {dialerState === "running" && (
          <button onClick={pause}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#f6c90e22", color: "#f6c90e", border: "1px solid #f6c90e44", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <PauseIcon size={14} /> Pause
          </button>
        )}
        {dialerState === "paused" && (
          <button onClick={resume}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#3b82f622", color: "#60a5fa", border: "1px solid #3b82f644", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <PlayIcon size={14} /> Resume
          </button>
        )}
        {(dialerState === "running" || dialerState === "paused" || dialerState === "calling") && (
          <>
            <button onClick={skip}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>
              <SkipIcon size={14} /> Skip
            </button>
            <button onClick={stop}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#e5515122", color: "#e55151", border: "1px solid #e5515144", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>
              <StopIcon size={14} /> Stop
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", val: stats.total, color: "#94a3b8" },
          { label: "Dialed", val: stats.completed, color: "#60a5fa" },
          { label: "Answered", val: stats.answered, color: "#00d97e" },
          { label: "Answer Rate", val: `${rate}%`, color: "#f6c90e" },
        ].map(s => (
          <div key={s.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'Fira Code', monospace" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log */}
      <div>
        <p style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Activity Log</p>
        <div ref={logRef} style={{ background: "#0b1120", border: "1px solid #1e293b", borderRadius: 8, padding: 12, height: 180, overflowY: "auto", fontFamily: "'Fira Code', monospace", fontSize: 11 }}>
          {log.length === 0 && <span style={{ color: "#334155" }}>No activity yet. Start the campaign to begin.</span>}
          {log.map(e => {
            const colors = { dial: "#60a5fa", answered: "#00d97e", voicemail: "#f6c90e", "no-answer": "#e55151", busy: "#a78bfa", complete: "#00d97e", info: "#475569" };
            return (
              <div key={e.id} style={{ display: "flex", gap: 10, marginBottom: 3, color: colors[e.type] || "#475569" }}>
                <span style={{ color: "#334155", minWidth: 70 }}>{e.time}</span>
                <span>{e.msg}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContactList({ contacts, setContacts }) {
  const [editing, setEditing] = useState(null);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  const resetContact = (id) => setContacts(cs => cs.map(c => c.id === id ? { ...c, status: "pending", outcome: null, duration: null } : c));

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Contact List</h2>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>Manage your dial list. Import CSV or add contacts manually.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)}
          style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#e2e8f0", padding: "8px 12px", fontSize: 12, outline: "none" }} />
        <input placeholder="+1 (555) 000-0000" value={newPhone} onChange={e => setNewPhone(e.target.value)}
          style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#e2e8f0", padding: "8px 12px", fontSize: 12, outline: "none", fontFamily: "'Fira Code', monospace" }} />
        <button onClick={() => {
          if (!newName || !newPhone) return;
          setContacts(cs => [...cs, { id: Date.now(), name: newName, phone: newPhone, company: "—", status: "pending", outcome: null, duration: null, notes: "" }]);
          setNewName(""); setNewPhone("");
        }} style={{ padding: "8px 18px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Add</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {contacts.map(c => (
          <div key={c.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <StatusDot status={c.status} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
              <div style={{ color: "#475569", fontSize: 11, fontFamily: "'Fira Code', monospace" }}>{c.phone} · {c.company}</div>
            </div>
            {c.duration && <span style={{ color: "#334155", fontSize: 11, fontFamily: "'Fira Code', monospace" }}>{c.duration}</span>}
            <OutcomeBadge outcome={c.outcome} />
            {c.status === "completed" && (
              <button onClick={() => resetContact(c.id)} title="Reset"
                style={{ background: "transparent", border: "1px solid #1e293b", borderRadius: 4, color: "#64748b", cursor: "pointer", padding: "3px 7px", fontSize: 10 }}>↺</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics({ contacts }) {
  const total = contacts.length;
  const completed = contacts.filter(c => c.status === "completed").length;
  const outcomes = ["answered", "voicemail", "no-answer", "busy"];
  const counts = outcomes.reduce((acc, o) => ({ ...acc, [o]: contacts.filter(c => c.outcome === o).length }), {});
  const colors = { answered: "#00d97e", voicemail: "#f6c90e", "no-answer": "#e55151", busy: "#a78bfa" };

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Analytics & Reporting</h2>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>Campaign performance breakdown and outcome distribution.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {outcomes.map(o => {
          const pct = completed ? Math.round((counts[o] / completed) * 100) : 0;
          return (
            <div key={o} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>{o.replace("-", " ")}</span>
                <span style={{ color: colors[o], fontSize: 20, fontWeight: 700, fontFamily: "'Fira Code', monospace" }}>{counts[o]}</span>
              </div>
              <div style={{ background: "#1e293b", borderRadius: 4, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: colors[o], borderRadius: 4, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ color: "#475569", fontSize: 10, marginTop: 4, fontFamily: "'Fira Code', monospace" }}>{pct}% of dialed</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 18 }}>
        <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14, fontWeight: 600 }}>Campaign Summary</p>
        {[
          ["Total Contacts", total],
          ["Calls Dialed", completed],
          ["Pending", total - completed],
          ["Connect Rate", completed ? `${Math.round((counts.answered / completed) * 100)}%` : "—"],
          ["VM Drop Rate", completed ? `${Math.round((counts.voicemail / completed) * 100)}%` : "—"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: 12 }}>{k}</span>
            <span style={{ color: "#e2e8f0", fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dialer");
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [ivrNodes, setIvrNodes] = useState(DEFAULT_IVR);
  const [sipConfig, setSipConfig] = useState({ server: "", port: "5060", transport: "UDP", codecs: ["PCMU (G.711u)", "OPUS"] });

  const tabs = [
    { id: "dialer", label: "Dialer", Icon: PhoneIcon },
    { id: "contacts", label: "Contacts", Icon: ListIcon },
    { id: "script", label: "Script", Icon: ScriptIcon },
    { id: "ivr", label: "IVR", Icon: ServerIcon },
    { id: "analytics", label: "Analytics", Icon: ChartIcon },
    { id: "sip", label: "SIP Config", Icon: SettingsIcon },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080e1a", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        select option { background: #0f172a; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #0f172a", padding: "14px 28px", display: "flex", alignItems: "center", gap: 12, background: "#080e1a" }}>
        <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #3b82f6, #00d97e)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PhoneIcon size={15} />
        </div>
        <div>
          <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>PowerDialer Pro</div>
          <div style={{ color: "#334155", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>SIP · IVR · Outbound Automation</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: sipConfig.server ? "#00d97e" : "#334155" }} />
          <span style={{ fontSize: 11, color: sipConfig.server ? "#00d97e" : "#475569" }}>{sipConfig.server ? `SIP: ${sipConfig.server}` : "SIP not configured"}</span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        {/* Sidebar */}
        <nav style={{ width: 64, background: "#06090f", borderRight: "1px solid #0f172a", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 4 }}>
          {tabs.map(({ id, label, Icon: Ic }) => (
            <button key={id} onClick={() => setTab(id)} title={label}
              style={{ width: 44, height: 44, borderRadius: 10, border: "none", background: tab === id ? "#1e293b" : "transparent", color: tab === id ? "#60a5fa" : "#334155", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
              <Ic size={18} />
            </button>
          ))}
        </nav>

        {/* Tab Label */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 24px", borderBottom: "1px solid #0f172a", background: "#06090f" }}>
            <span style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: 1.2 }}>
              {tabs.find(t => t.id === tab)?.label}
            </span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 28, overflowY: "auto", maxWidth: 860 }}>
            {tab === "dialer" && <Dialer contacts={contacts} setContacts={setContacts} />}
            {tab === "contacts" && <ContactList contacts={contacts} setContacts={setContacts} />}
            {tab === "script" && <ScriptEditor script={script} setScript={setScript} />}
            {tab === "ivr" && <IvrBuilder nodes={ivrNodes} setNodes={setIvrNodes} />}
            {tab === "analytics" && <Analytics contacts={contacts} />}
            {tab === "sip" && <SipConfig config={sipConfig} setConfig={setSipConfig} />}
          </div>
        </div>
      </div>
    </div>
  );
}
