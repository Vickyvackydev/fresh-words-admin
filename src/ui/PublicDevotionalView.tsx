import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Sparkles, Smartphone, ArrowRight, ExternalLink } from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";

interface DevotionalData {
  id: string;
  category: string;
  title: string;
  scripture_quote: string;
  scripture_reference: string;
  body: string;
  prayer?: string;
  reflection?: string;
  default_day?: number;
}

export default function PublicDevotionalView() {
  const { id } = useParams<{ id: string }>();
  const [devotional, setDevotional] = useState<DevotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectingToStore, setRedirectingToStore] = useState(false);

  const googlePlayUrl =
    "https://play.google.com/store/apps/details?id=com.freshdevotionals.app";
  const appStoreUrl = "https://apps.apple.com/app/id6742385194";
  const appSchemeUrl = id ? `freshwordsapp://devotional/${id}` : "freshwordsapp://";

  // Fetch devotional details
  useEffect(() => {
    if (!id) return;

    fetch(`/api/v1/devotionals/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && json.data) {
          setDevotional(json.data);
          if (json.data.title) {
            document.title = `${json.data.title} | Fresh Devotionals`;
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load devotional preview:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Handle smart mobile routing (App-to-App or Store fallback)
  useEffect(() => {
    if (!id) return;

    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const isAndroid = /android/i.test(userAgent);
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    // Only auto-attempt on mobile devices
    if (isAndroid || isIOS) {
      const storeUrl = isAndroid ? googlePlayUrl : appStoreUrl;
      const startTime = Date.now();

      // 1. Attempt to open in Fresh Devotionals app
      window.location.href = appSchemeUrl;

      // 2. If after 1.6s the user is still in the browser (app not installed), redirect to store
      const timer = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        // If app opened, browser would blur/pause, elapsed would be large or doc hidden
        if (!document.hidden && elapsed < 3000) {
          setRedirectingToStore(true);
          window.location.href = storeUrl;
        }
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [id]);

  const paragraphs = devotional?.body
    ? devotional.body.split("\n\n").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-2xl flex items-center justify-between py-4 mb-6 z-10 border-b border-slate-800/80">
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
            <p className="text-[11px] text-slate-400">Daily Bread & Spiritual Growth</p>
          </div>
        </div>

        {/* Quick App Open / Store Action */}
        <a
          href={appSchemeUrl}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Open in App</span>
        </a>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl z-10 space-y-6 pb-16">
        {/* Banner if auto-redirecting to Store */}
        {redirectingToStore && (
          <div className="bg-blue-900/60 border border-blue-500/40 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-200 shadow-xl backdrop-blur-md">
            <span>Redirecting to download the official mobile app...</span>
            <span className="font-semibold underline">Continue</span>
          </div>
        )}

        {/* Devotional Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Loading devotional...</p>
            </div>
          ) : (
            <>
              {/* Category & Read Time */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3 h-3" />
                  {devotional?.category || "Daily Devotional"}
                </span>
                {devotional?.default_day && (
                  <span className="text-xs font-medium text-slate-400">
                    Day {devotional.default_day}
                  </span>
                )}
              </div>

              {/* Devotional Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif leading-snug capitalize">
                {devotional?.title || "Daily Devotional"}
              </h1>

              {/* Scripture Quote Box */}
              {devotional?.scripture_quote && (
                <div className="bg-slate-950/70 border-l-4 border-orange-500 p-4 sm:p-5 rounded-r-2xl space-y-2">
                  <p className="text-sm sm:text-base italic text-slate-200 font-serif leading-relaxed">
                    "{devotional.scripture_quote}"
                  </p>
                  {devotional.scripture_reference && (
                    <p className="text-xs font-semibold text-orange-400">
                      — {devotional.scripture_reference}
                    </p>
                  )}
                </div>
              )}

              {/* Devotional Body Text */}
              <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, idx) => (
                    <p key={idx} className="leading-7">
                      {p}
                    </p>
                  ))
                ) : (
                  <p>{devotional?.body || "Be blessed by today's devotional word."}</p>
                )}
              </div>

              {/* Prayer section */}
              {devotional?.prayer && (
                <div className="bg-blue-950/40 border border-blue-800/40 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-300 uppercase">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Prayer</span>
                  </div>
                  <p className="text-sm italic text-blue-100 font-serif leading-relaxed">
                    "{devotional.prayer}"
                  </p>
                </div>
              )}
            </>
          )}

          {/* App Download Prompt Section */}
          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <span>Read more on Fresh Devotionals App</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Download for free to access complete 365-day devotionals, daily notifications, and offline Bible reading.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              {/* Google Play */}
              <a
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 border border-slate-700/80 hover:border-orange-500/60 text-white px-4 py-3 rounded-xl transition shadow-md group"
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
                className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 border border-slate-700/80 hover:border-orange-500/60 text-white px-4 py-3 rounded-xl transition shadow-md group"
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

            {/* Direct Open Deep Link Button */}
            <div className="text-center pt-1">
              <a
                href={appSchemeUrl}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition underline"
              >
                <span>Already have the app? Tap to open directly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
