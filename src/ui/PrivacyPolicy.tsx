import React from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  const lastUpdated = "July 17, 2026";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/50 p-8 sm:p-12 shadow-sm space-y-8 relative overflow-hidden">
        
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="space-y-4 border-b border-slate-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-450 font-semibold font-mono uppercase tracking-wider">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <p>
            At <strong>Fresh Devotionals</strong>, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and protect your information when you use our mobile application and services.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">1. Information We Collect</h2>
            <p>
              We collect information that you voluntarily provide to us when using the application. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Bookmarks:</strong> Favorite/bookmarked devotionals are saved locally on your device or linked securely to your anonymous device ID.</li>
              <li><strong>Feedback:</strong> If you submit feedback, we collect your name, email address, and message details to address your comments.</li>
              <li><strong>Usage Metrics:</strong> We compile anonymous analytics about devotional read counts to help us understand engagement and improve the software.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">2. How We Use Your Information</h2>
            <p>
              We utilize the collected information for the following core purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To store bookmarks, customize reading schedules, and personalise your devotion feed.</li>
              <li>To process and reply to support inquiries and feedback submissions.</li>
              <li>To compile aggregate, non-identifiable usage statistics for content enhancement.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">3. Data Storage & Security</h2>
            <p>
              We prioritize the safety of your information. Feedback comments and database records are securely hosted on protected cloud databases. We utilize standard SSL/TLS encryption for all data transit. We do not sell or lease user information to third-party advertisers.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">4. Third-Party Services</h2>
            <p>
              The app may display external scripture references or allow sharing quotes via standard social applications. We are not responsible for the privacy practices of external websites linked within devotional content.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">5. Changes to This Policy</h2>
            <p>
              We reserve the right to revise this Privacy Policy periodically. We recommend checking this page periodically to remain informed about how we safeguard your data.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">6. Contact Us</h2>
            <p>
              If you have any questions, feedback, or concerns regarding our privacy standards, please reach out to us at <strong>support@freshdevotionals.com</strong>.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>&copy; {new Date().getFullYear()} Fresh Devotionals.</span>
          <Link 
            to="/login"
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Admin Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
