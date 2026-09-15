import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaApple, FaGooglePlay } from "react-icons/fa";

interface DevotionalMeta {
  id: string;
  title: string;
  category: string;
  default_day?: number;
}

interface AppSettings {
  app_logo_url?: string;
  church_name?: string;
}

export default function DevotionalWebFallback() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<DevotionalMeta | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const googlePlayUrl =
    "https://play.google.com/store/apps/details?id=com.freshdevotionals.app";
  const appStoreUrl = "https://apps.apple.com/app/id6794951138";
  const appSchemeUrl = id
    ? `freshwordsapp://devotional/${id}`
    : "freshwordsapp://";

  useEffect(() => {
    // Fetch public branding settings (no auth needed)
    fetch("/api/v1/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json?.data) {
          setSettings({
            app_logo_url: json.data.app_logo_url,
            church_name: json.data.church_name,
          });
        }
      })
      .catch(() => {});

    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`/api/v1/devotionals/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setMeta({
            id: json.data.id,
            title: json.data.title,
            category: json.data.category,
            default_day: json.data.default_day,
          });
          if (json.data.title) {
            document.title = `${json.data.title} | Fresh Devotionals`;
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load devotional metadata:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const appName = settings?.church_name || "Fresh Devotionals";

  return (
    <>
      {/* Keyframe for spinner */}
      <style>{`
        @keyframes _spin { to { transform: rotate(360deg); } }
        ._spinner { animation: _spin 0.8s linear infinite; }
        ._store-btn:hover { background: #222228 !important; border-color: rgba(217,119,6,0.5) !important; }
        ._open-btn:hover { opacity: 0.85; }
        ._already:hover { color: #d1d5db; }
      `}</style>

      <div style={s.root}>
        {/* Amber glow */}
        <div style={s.glow} />

        <div style={s.wrapper}>

          {/* ── Header ── */}
          <header style={s.header}>
            <div style={s.brandRow}>
              <div style={s.logoBox}>
                {settings?.app_logo_url ? (
                  <img
                    src={settings.app_logo_url}
                    alt={appName}
                    style={s.logoImg}
                  />
                ) : (
                  <span style={s.logoText}>FD</span>
                )}
              </div>
              <span style={s.brandName}>{appName}</span>
            </div>

            <a href={appSchemeUrl} className="_open-btn" style={s.openBtn}>
              Open App
            </a>
          </header>

          {/* ── Main ── */}
          <main style={s.main}>
            {loading ? (
              <div style={s.spinnerWrap}>
                <div
                  className="_spinner"
                  style={s.spinner}
                />
                <p style={s.spinnerText}>Loading devotional…</p>
              </div>
            ) : (
              <div style={s.card}>
                {/* Eyebrow */}
                {(meta?.category || meta?.default_day) && (
                  <p style={s.eyebrow}>
                    {meta?.category || "Daily Devotional"}
                    {meta?.default_day ? `  ·  Day ${meta.default_day}` : ""}
                  </p>
                )}

                {/* Title */}
                <h1 style={s.title}>
                  {meta?.title || "Today's Devotional"}
                </h1>

                {/* Rule */}
                <div style={s.rule} />

                {/* Notice */}
                <p style={s.notice}>
                  The full reading — scripture, meditation, prayers, and
                  reflection — is available inside the{" "}
                  <strong style={{ color: "#f5f5f7" }}>{appName}</strong> app.
                </p>

                {/* Store buttons */}
                <div style={s.storeCol}>
                  <a
                    href={googlePlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="_store-btn"
                    style={s.storeBtn}
                  >
                    <FaGooglePlay style={{ fontSize: 20, color: "#4ade80", flexShrink: 0 }} />
                    <div>
                      <div style={s.storeLabel}>Get it on</div>
                      <div style={s.storeName}>Google Play</div>
                    </div>
                  </a>

                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="_store-btn"
                    style={s.storeBtn}
                  >
                    <FaApple style={{ fontSize: 22, color: "#e8e8ea", flexShrink: 0 }} />
                    <div>
                      <div style={s.storeLabel}>Download on the</div>
                      <div style={s.storeName}>App Store</div>
                    </div>
                  </a>
                </div>

                {/* Already installed */}
                <a href={appSchemeUrl} className="_already" style={s.already}>
                  Already installed? Open in app →
                </a>
              </div>
            )}
          </main>

          {/* ── Footer ── */}
          <footer style={s.footer}>
            <span>© {new Date().getFullYear()} {appName}</span>
            <div style={s.footerLinks}>
              <Link to="/privacy" style={s.footerLink}>Privacy</Link>
              <span style={{ color: "#374151" }}>·</span>
              <Link to="/terms" style={s.footerLink}>Terms</Link>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100dvh",
    background: "#0f0f11",
    color: "#e8e8ea",
    fontFamily:
      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflowX: "hidden",
  },
  glow: {
    position: "fixed",
    top: -100,
    left: "50%",
    transform: "translateX(-50%)",
    width: 600,
    height: 340,
    background:
      "radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  wrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 480,
    padding: "0 20px",
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
    background: "#1c1c1f",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  logoText: {
    fontSize: 12,
    fontWeight: 700,
    color: "#d97706",
    letterSpacing: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#f5f5f7",
    letterSpacing: "-0.2px",
  },
  openBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    background: "#d97706",
    borderRadius: 8,
    padding: "7px 15px",
    textDecoration: "none",
    transition: "opacity .15s",
    whiteSpace: "nowrap",
  },

  /* Main */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 48,
    paddingBottom: 40,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#d97706",
    marginBottom: 14,
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.28,
    letterSpacing: "-0.4px",
    color: "#f5f5f7",
    margin: "0 0 22px",
  },
  rule: {
    width: 36,
    height: 2,
    borderRadius: 2,
    background: "rgba(217,119,6,0.45)",
    marginBottom: 22,
  },
  notice: {
    fontSize: 15,
    lineHeight: 1.75,
    color: "#9ca3af",
    margin: "0 0 34px",
  },

  /* Store */
  storeCol: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 26,
  },
  storeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 18px",
    borderRadius: 12,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.09)",
    background: "#18181b",
    color: "#f5f5f7",
    cursor: "pointer",
    transition: "background .15s, border-color .15s",
  },
  storeLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: "#6b7280",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    lineHeight: 1,
    marginBottom: 3,
  },
  storeName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#f5f5f7",
    lineHeight: 1,
  },

  already: {
    fontSize: 13,
    color: "#6b7280",
    textDecoration: "none",
    borderBottom: "1px solid rgba(107,114,128,0.35)",
    paddingBottom: 1,
    alignSelf: "flex-start",
    transition: "color .15s",
    cursor: "pointer",
  },

  /* Spinner */
  spinnerWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    padding: "80px 0",
  },
  spinner: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "2px solid rgba(217,119,6,0.2)",
    borderTopColor: "#d97706",
  },
  spinnerText: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },

  /* Footer */
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 24,
    borderTop: "1px solid rgba(255,255,255,0.07)",
    fontSize: 12,
    color: "#4b5563",
  },
  footerLinks: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  footerLink: {
    color: "#4b5563",
    textDecoration: "none",
  },
};
