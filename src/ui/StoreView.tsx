import { Link } from "react-router-dom";
import { BookOpen, Shield, FileText, Smartphone, Star } from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";

export default function StoreView() {
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.freshdevotionals.app";
  const appStoreUrl = "https://apps.apple.com/app/id6742385194"; // Official iOS App Store URL

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Container */}
      <div className="w-full max-w-xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative z-10 text-center">
        
        {/* App Logo & Badge */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 ring-4 ring-orange-500/20">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            <span>Daily Spiritual Growth</span>
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Fresh Devotionals
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
            Experience daily biblical wisdom, uplifting scriptures, and spiritual growth right on your mobile device.
          </p>
        </div>

        {/* Download Buttons Section */}
        <div className="space-y-4 pt-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4 text-orange-400" />
            <span>Download Official App</span>
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            {/* Google Play Store Button */}
            <a
              href={googlePlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-orange-500/60 text-white px-5 py-3.5 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
            >
              <FaGooglePlay className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Get it on</div>
                <div className="text-sm font-bold text-white">Google Play</div>
              </div>
            </a>

            {/* Apple App Store Button */}
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-orange-500/60 text-white px-5 py-3.5 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
            >
              <FaApple className="w-7 h-7 text-slate-100 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Download on the</div>
                <div className="text-sm font-bold text-white">App Store</div>
              </div>
            </a>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/60 text-center">
          <div className="space-y-1">
            <div className="text-xs font-bold text-orange-400">Daily Verses</div>
            <div className="text-[11px] text-slate-400">Fresh daily word</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-orange-400">Holy Bible</div>
            <div className="text-[11px] text-slate-400">Complete KJV</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-orange-400">Offline Reading</div>
            <div className="text-[11px] text-slate-400">Sync anytime</div>
          </div>
        </div>

        {/* Centered Privacy & Terms Links */}
        <div className="pt-6 border-t border-slate-700/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <Link
            to="/privacy"
            className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </Link>
          <span className="text-slate-600">•</span>
          <Link
            to="/terms"
            className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </Link>
        </div>

      </div>

      {/* Footer Copyright */}
      <footer className="mt-8 text-xs text-slate-500 text-center font-medium relative z-10">
        &copy; {new Date().getFullYear()} Fresh Devotionals. All rights reserved.
      </footer>
    </div>
  );
}
