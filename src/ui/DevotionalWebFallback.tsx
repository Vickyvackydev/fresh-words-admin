import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Smartphone, ArrowRight, Shield, FileText, Sparkles, BookOpen } from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";

interface DevotionalMeta {
  id: string;
  title: string;
  category: string;
  default_day?: number;
}

export default function DevotionalWebFallback() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<DevotionalMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const googlePlayUrl =
    "https://play.google.com/store/apps/details?id=com.freshdevotionals.app";
  const appStoreUrl = "https://apps.apple.com/app/id6794951138";
  const appSchemeUrl = id ? `freshwordsapp://devotional/${id}` : "freshwordsapp://";

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`/api/v1/devotionals/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && json.data) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-xl flex items-center justify-between py-4 mb-2 z-10 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 p-0.5 shadow-lg">
            <img
              src="/app-logo.png"
              alt="Fresh Devotionals"
              className="w-full h-full object-cover rounded-[10px] bg-slate-900"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Fresh Devotionals
            </h2>
            <p className="text-[11px] text-slate-400">Daily Spiritual Growth</p>
          </div>
        </div>

        <a
          href={appSchemeUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Open App</span>
        </a>
      </header>

      {/* Main card */}
      <main className="w-full max-w-xl z-10 my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          {loading ? (
            <div className="py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Preparing devotional...</p>
            </div>
          ) : (
            <>
              {/* Category pill */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  {meta?.category || "Daily Devotional"}
                  {meta?.default_day ? ` • Day ${meta.default_day}` : ""}
                </span>
              </div>

              {/* Devotional Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif leading-snug capitalize max-w-md mx-auto">
                {meta?.title || "Today's Devotional"}
              </h1>

              {/* App-Only Reading Notice */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Available on Mobile</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To read the full meditation, scripture reading, prayers, and daily reflections, open or install the official <strong>Fresh Devotionals</strong> app.
                </p>
              </div>

              {/* Download CTA */}
              <div className="pt-2 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  <span>Download Free App to Read</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  {/* Google Play */}
                  <a
                    href={googlePlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500/60 text-white px-4 py-3 rounded-xl transition shadow-md group"
                  >
                    <FaGooglePlay className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                        Get it on
                      </div>
                      <div className="text-xs font-bold text-white">Google Play</div>
                    </div>
                  </a>

                  {/* Apple App Store */}
                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500/60 text-white px-4 py-3 rounded-xl transition shadow-md group"
                  >
                    <FaApple className="w-6 h-6 text-slate-100 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                        Download on the
                      </div>
                      <div className="text-xs font-bold text-white">App Store</div>
                    </div>
                  </a>
                </div>

                {/* Direct Open in App link */}
                <div className="pt-2">
                  <a
                    href={appSchemeUrl}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition underline"
                  >
                    <span>Already have the app? Tap here to open</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl z-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>&copy; {new Date().getFullYear()} Fresh Devotionals. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-slate-300 transition flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Privacy</span>
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-slate-300 transition flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Terms</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
