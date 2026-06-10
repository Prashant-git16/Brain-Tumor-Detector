import { useState, useRef, useEffect } from "react";


const CLASS_META = {
  glioma:     { color: "#C0392B", light: "#FDECEA", border: "#E57373", label: "Glioma",     badge: "HIGH RISK", icon: "⚠", desc: "Malignant tumor arising from glial cells of the brain or spine. Requires immediate medical consultation.", severity: 4 },
  meningioma: { color: "#D4830A", light: "#FEF3E2", border: "#FFB74D", label: "Meningioma", badge: "DETECTED",  icon: "◈", desc: "Tumor arising from the meninges — membranes surrounding brain and spinal cord. Usually slow-growing.", severity: 3 },
  notumor:    { color: "#1A7A4A", light: "#E8F8F2", border: "#66BB6A", label: "No Tumor",   badge: "CLEAR",     icon: "✓", desc: "No malignant or benign tumor detected in the MRI scan. Results appear within normal parameters.", severity: 1 },
  pituitary:  { color: "#1565A6", light: "#E3F0FB", border: "#64B5F6", label: "Pituitary",  badge: "DETECTED",  icon: "◉", desc: "Tumor detected in the pituitary gland region of the brain. Follow-up with an endocrinologist advised.", severity: 2 },
};

const FAQ = [
  { q: "What MRI scan types are supported?", a: "TumorDetector works with axial, coronal, and sagittal MRI views. Best results are from T1-weighted contrast-enhanced scans. JPEG, PNG, and WEBP are accepted." },
  { q: "How accurate is the analysis?", a: "Our EfficientNetB0 model achieves 90.87% accuracy on the test set of 1,422 images, trained across 5,712 labeled scans from four tumor classes." },
  { q: "Is my data stored?", a: "No. Images are processed in-memory and never stored or transmitted beyond the local analysis session. Your privacy is fully protected." },
  { q: "Can this replace a doctor?", a: "No. This tool is for academic and research purposes only. Always consult a qualified neurologist or radiologist for any medical decisions." },
];

const TUMOR_FACTS = [
  { icon: "🧠", stat: "330,000+", label: "Brain tumors diagnosed annually worldwide" },
  { icon: "⏱", stat: "40%", label: "Survival improvement with early detection" },
  { icon: "🔬", stat: "120+", label: "Distinct brain tumor types classified" },
  { icon: "📊", stat: "90.87%", label: "Model classification accuracy" },
];

function RadialGauge({ value, color }) {
  const R = 48, circ = 2 * Math.PI * R;
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(value), 100); return () => clearTimeout(t); }, [value]);
  const off = circ - (animated / 100) * circ;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={R} fill="none" stroke="#E8EDF2" strokeWidth="10" />
      <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round" transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }} />
      <text x="60" y="56" textAnchor="middle" fill="#1A2B3C" fontSize="18" fontWeight="700" fontFamily="Inter,sans-serif">{value.toFixed(1)}%</text>
      <text x="60" y="71" textAnchor="middle" fill="#7A94A8" fontSize="9" letterSpacing="1.5" fontFamily="Inter,sans-serif">CONFIDENCE</text>
    </svg>
  );
}

function AnimatedBar({ value, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 120 + delay); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ flex: 1, height: 8, background: "#EEF2F6", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.9s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function SeverityDots({ level }) {
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i <= level ? (level >= 4 ? "#C0392B" : level === 3 ? "#D4830A" : level === 2 ? "#1565A6" : "#1A7A4A") : "#DDE3EA" }} />
      ))}
    </div>
  );
}

export default function App() {
  const [gradcam, setGradcam] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [pulse, setPulse] = useState(false);
  const inputRef = useRef();
  const resultRef = useRef();
  const analysisId = useRef(null);
  

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file); setPreview(URL.createObjectURL(file));
    setResult(null); setError(null); setPulse(true);
    setTimeout(() => setPulse(false), 600);
  };

  const handlePredict = async () => {
  if (!image) return;

  setLoading(true);
  setError(null);

  analysisId.current = Math.random()
    .toString(36)
    .slice(2, 10)
    .toUpperCase();

  const fd = new FormData();
  fd.append("image", image);

  try {
    const res = await fetch(
      "http://localhost:5000/predict",
      {
        method: "POST",
        body: fd,
      }
    );

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    setResult(data);

    if (data.gradcam) {
      setGradcam(data.gradcam);
    }

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};

  const reset = () => {setGradcam(null); setImage(null); setPreview(null); setResult(null); setError(null); };
  const meta = result ? CLASS_META[result.predicted_class] : null;

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#F4F7FA", minHeight: "100vh", color: "#1A2B3C" }}>

      {/* ── Header ── */}
      <header style={{ background: "#fff", borderBottom: "1px solid #DDE3EA", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Logo */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#1565A6,#1A7A4A)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(21,101,166,0.28)", position: "relative", overflow: "hidden" }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="10" stroke="white" strokeWidth="1.8" fill="none"/>
                <path d="M8 13 C8 9.5 10 7 13 7 C16 7 18 9.5 18 13 C18 16.5 16 19 13 19 C10 19 8 16.5 8 13Z" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"/>
                <circle cx="13" cy="13" r="2.5" fill="white"/>
                <line x1="13" y1="3" x2="13" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="13" y1="19" x2="13" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="3" y1="13" x2="7" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="19" y1="13" x2="23" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.4px", color: "#0F1E2D" }}>
                Tumor<span style={{ color: "#1565A6" }}>Detector</span>
              </div>
              <div style={{ fontSize: "0.67rem", color: "#7A94A8", letterSpacing: "0.3px", marginTop: 1 }}>Brain MRI Classification · EfficientNetB0</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#1A7A4A", background: "#E8F8F2", padding: "5px 12px", borderRadius: 20, border: "1px solid #A8D5C0" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A7A4A" }} />
              System Ready
            </div>
            <div style={{ fontSize: "0.75rem", color: "#7A94A8" }}>Academic Use Only</div>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div style={{ background: "linear-gradient(135deg,#1565A6 0%,#1A7A4A 100%)", color: "white", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.4px" }}>AI-Powered Brain MRI Analysis</h1>
            <p style={{ margin: 0, fontSize: "0.92rem", opacity: 0.88, maxWidth: 520 }}>Upload a brain MRI scan and receive instant classification across 4 tumor categories using deep learning trained on 5,712 clinical images.</p>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {TUMOR_FACTS.map(f => (
              <div key={f.label} style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: "1.1rem", marginBottom: 2 }}>{f.icon}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.1 }}>{f.stat}</div>
                <div style={{ fontSize: "0.65rem", opacity: 0.78, marginTop: 3, maxWidth: 90, lineHeight: 1.4 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Three-Column Layout ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "260px 1fr 260px", gap: 22, alignItems: "start" }}>

        {/* ── LEFT PANEL ── */}
        <aside>
          {/* Tumor Classes Guide */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #DDE3EA", padding: "20px", marginBottom: 18 }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "#7A94A8", marginBottom: 16 }}>TUMOR CLASSES</div>
            {Object.entries(CLASS_META).map(([key, m]) => (
              <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #EEF2F6" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: m.light, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: m.color }}>{m.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#5A7A96", lineHeight: 1.5, marginTop: 2 }}>{m.desc.split(".")[0]}.</div>
                  <SeverityDots level={m.severity} />
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #DDE3EA", padding: "20px" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "#7A94A8", marginBottom: 16 }}>HOW IT WORKS</div>
            {[
              { n: "1", t: "Upload MRI", d: "Drag & drop or click to select your brain scan image (JPG/PNG/WEBP)." },
              { n: "2", t: "AI Analysis", d: "EfficientNetB0 processes the scan through 7 million parameters in seconds." },
              { n: "3", t: "Read Report", d: "View confidence scores, class probabilities, and a detailed diagnosis summary." },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EBF3FB", border: "1px solid #B5D4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#1565A6", flexShrink: 0, marginTop: 2 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 3 }}>{s.t}</div>
                  <div style={{ fontSize: "0.72rem", color: "#5A7A96", lineHeight: 1.55 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: Upload + Result ── */}
        <main>
          {/* Upload Card */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #DDE3EA", padding: "28px", marginBottom: 22, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F1E2D" }}>MRI Scan Upload</div>
                <div style={{ fontSize: "0.75rem", color: "#7A94A8", marginTop: 3 }}>Accepted: JPG · PNG · WEBP · Max 20MB</div>
              </div>
              {preview && (
                <button onClick={reset} style={{ fontSize: "0.78rem", color: "#1565A6", background: "#EBF3FB", border: "1px solid #B5D4F4", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>
                  ↺ New Scan
                </button>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => !preview && inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: `2px dashed ${dragging ? "#1565A6" : preview ? "#A8D5C0" : "#CBD5DF"}`,
                borderRadius: 12,
                minHeight: 280,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: preview ? "default" : "pointer",
                background: dragging ? "#EBF3FB" : preview ? "#F4FAF7" : "#F8FAFB",
                position: "relative", overflow: "hidden",
                transition: "all 0.2s ease",
                transform: pulse ? "scale(1.01)" : "scale(1)",
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="MRI scan" style={{ width: "100%", maxHeight: 320, objectFit: "contain", display: "block" }} />
                  {loading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(240,248,255,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                      <div style={{ width: 50, height: 50, border: "3px solid #DDE3EA", borderTopColor: "#1565A6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1565A6", letterSpacing: "2px" }}>ANALYSING SCAN…</div>
                      <div style={{ fontSize: "0.68rem", color: "#7A94A8" }}>EfficientNetB0 processing</div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 28 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#EBF3FB", border: "1.5px dashed #7AADD6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 6v14M10 12l6-6 6 6" stroke="#1565A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 24h20" stroke="#1565A6" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0F1E2D", marginBottom: 6 }}>Drop MRI scan here</div>
                  <div style={{ fontSize: "0.82rem", color: "#5A7A96", marginBottom: 8 }}>or click to browse your files</div>
                  <div style={{ fontSize: "0.68rem", color: "#9AADB8", background: "#EEF2F6", display: "inline-block", padding: "4px 12px", borderRadius: 20 }}>JPG · PNG · WEBP</div>
                </div>
              )}
              <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
            </div>

            {/* Analyse Button */}
            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handlePredict}
                disabled={!image || loading}
                style={{
                  background: image && !loading ? "linear-gradient(135deg,#1565A6,#1A7A4A)" : "#C8D4DE",
                  color: "white", border: "none", borderRadius: 10,
                  padding: "12px 32px", fontSize: "0.9rem", fontWeight: 700,
                  cursor: image && !loading ? "pointer" : "not-allowed",
                  boxShadow: image && !loading ? "0 4px 16px rgba(21,101,166,0.3)" : "none",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {loading ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Analysing…</> : <>⚡ Run Analysis</>}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 14, background: "#FDECEA", border: "1px solid #E57373", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem", color: "#C0392B", display: "flex", alignItems: "center", gap: 8 }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Result Card */}
          {gradcam && (
  <div
    style={{
      marginTop: 30,
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      border: "1px solid #DDE3EA"
    }}
  >
    <h3
      style={{
        marginBottom: 15
      }}
    >
      Grad-CAM Visualization
    </h3>

    <p
      style={{
        color: "#5A7A96",
        fontSize: "0.8rem"
      }}
    >
      Highlighted regions indicate
      where the AI focused when
      making its prediction.
    </p>

    <img
      src={`data:image/png;base64,${gradcam}`}
      alt="GradCAM"
      style={{
        width: "100%",
        borderRadius: 12,
        marginTop: 10
      }}
    />
  </div>
)}
          {result && meta && (
            <div ref={resultRef} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${meta.border}`, padding: "28px", boxShadow: `0 4px 20px ${meta.color}18`, animation: "fadeIn 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "#7A94A8" }}>DIAGNOSIS REPORT · {analysisId.current}</div>
                <div style={{ fontSize: "0.68rem", color: "#7A94A8" }}>{new Date().toLocaleString()}</div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "inline-block", background: meta.light, border: `1px solid ${meta.border}`, color: meta.color, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "2px", padding: "4px 12px", borderRadius: 6, marginBottom: 10 }}>
                    {meta.badge}
                  </div>
                  <h2 style={{ fontSize: "2rem", fontWeight: 800, color: meta.color, margin: "0 0 8px", letterSpacing: "-0.5px" }}>{meta.label}</h2>
                  <p style={{ fontSize: "0.84rem", color: "#5A7A96", lineHeight: 1.65, margin: 0 }}>{meta.desc}</p>
                  <div style={{ marginTop: 14, padding: "12px 16px", background: meta.light, borderRadius: 10, fontSize: "0.78rem", color: meta.color, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    {meta.severity >= 3 ? "⚠ Please consult a qualified neurologist promptly." : meta.severity === 1 ? "✓ No immediate concern detected. Routine follow-up advised." : "ℹ Follow-up imaging recommended at 3–6 months."}
                  </div>
                </div>
                <RadialGauge value={result.confidence} color={meta.color} />
              </div>

              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${meta.border},transparent)`, marginBottom: 22 }} />

              <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2.5px", color: "#7A94A8", marginBottom: 14 }}>CLASS PROBABILITY BREAKDOWN</div>
              {Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]).map(([cls, prob], i) => (
                <div key={cls} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: CLASS_META[cls].color, flexShrink: 0 }} />
                  <div style={{ width: 96, fontSize: "0.82rem", color: "#1A2B3C", flexShrink: 0 }}>{CLASS_META[cls].label}</div>
                  <AnimatedBar value={prob} color={CLASS_META[cls].color} delay={i * 100} />
                  <div style={{ width: 58, textAlign: "right", fontSize: "0.82rem", fontWeight: 700, color: CLASS_META[cls].color, fontFamily: "monospace" }}>{prob.toFixed(2)}%</div>
                </div>
              ))}

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #EEF2F6", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: "0.68rem", color: "#9AADB8", fontFamily: "monospace" }}>EfficientNetB0 · Accuracy 90.87% · Build 2026</span>
                <span style={{ fontSize: "0.68rem", color: "#9AADB8" }}>Analysis ID: {analysisId.current}</span>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside>
          {/* Model Info */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #DDE3EA", padding: "20px", marginBottom: 18 }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "#7A94A8", marginBottom: 16 }}>MODEL DETAILS</div>
            {[
              { label: "Architecture", value: "EfficientNetB0" },
              { label: "Training Images", value: "5,712" },
              { label: "Test Accuracy", value: "90.87%" },
              { label: "Classes", value: "4 tumor types" },
              { label: "Input Resolution", value: "224 × 224 px" },
              { label: "Framework", value: "TensorFlow / Keras" },
            ].map(d => (
              <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #EEF2F6", fontSize: "0.78rem" }}>
                <span style={{ color: "#5A7A96" }}>{d.label}</span>
                <span style={{ fontWeight: 700, color: "#0F1E2D" }}>{d.value}</span>
              </div>
            ))}
          </div>

          {/* Confidence guide */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #DDE3EA", padding: "20px", marginBottom: 18 }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "#7A94A8", marginBottom: 14 }}>CONFIDENCE GUIDE</div>
            {[
              { range: "90–100%", label: "Very High", color: "#1A7A4A", bg: "#E8F8F2" },
              { range: "75–89%",  label: "High",      color: "#1565A6", bg: "#EBF3FB" },
              { range: "55–74%",  label: "Moderate",  color: "#D4830A", bg: "#FEF3E2" },
              { range: "< 55%",   label: "Low",       color: "#C0392B", bg: "#FDECEA" },
            ].map(c => (
              <div key={c.range} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, background: c.bg, border: `1px solid ${c.color}55`, borderRadius: 6, padding: "3px 6px", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: c.color }}>{c.label}</div>
                <div style={{ fontSize: "0.75rem", color: "#5A7A96" }}>{c.range}</div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #DDE3EA", padding: "20px" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "#7A94A8", marginBottom: 14 }}>FAQ</div>
            {FAQ.map((f, i) => (
              <div key={i} style={{ marginBottom: 8, borderRadius: 8, border: "1px solid #EEF2F6", overflow: "hidden" }}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  style={{ width: "100%", textAlign: "left", background: expandedFaq === i ? "#F4F7FA" : "transparent", border: "none", padding: "10px 14px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, color: "#0F1E2D", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ paddingRight: 8, lineHeight: 1.4 }}>{f.q}</span>
                  <span style={{ color: "#7A94A8", flexShrink: 0, fontSize: "1rem", transform: expandedFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </button>
                {expandedFaq === i && (
                  <div style={{ padding: "10px 14px 12px", fontSize: "0.74rem", color: "#5A7A96", lineHeight: 1.6, borderTop: "1px solid #EEF2F6", background: "#F8FAFB" }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #DDE3EA", padding: "24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* DISCLAIMER — BOLD */}
          <div style={{ background: "#FEF3E2", border: "2px solid #FFB74D", borderRadius: 12, padding: "16px 22px", marginBottom: 22, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>⚠</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#8B5000", marginBottom: 6, letterSpacing: "0.2px" }}>MEDICAL DISCLAIMER — FOR ACADEMIC &amp; RESEARCH PURPOSES ONLY</div>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#A0600A", lineHeight: 1.65 }}>
                TumorDetector is an AI-assisted academic research tool and <strong>DOES NOT</strong> constitute a medical diagnosis, clinical opinion, or substitute for professional medical advice. This application must <strong>NOT</strong> be used as the basis for any medical decision. Always consult a qualified and licensed neurologist, radiologist, or physician for accurate diagnosis and treatment. The developers and institution accept no liability for clinical use of this tool.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#1565A6,#1A7A4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "white", letterSpacing: "1px" }}>PP</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F1E2D" }}>Prashant Pandey</div>
                <div style={{ fontSize: "0.72rem", color: "#5A7A96", marginTop: 1 }}>Chandigarh University · prashantmars09@gmail.com</div>
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#7A94A8", textAlign: "right" }}>
              TumorDetector v1.0 · EfficientNetB0 · 90.87% Test Accuracy<br/>
              <span style={{ color: "#9AADB8" }}>Not for clinical use · Academic project only</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
