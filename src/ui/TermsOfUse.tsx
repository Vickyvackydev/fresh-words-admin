import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfUse() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Terms of Use
          </h1>
          <p className="text-xs text-slate-450 font-semibold font-mono uppercase tracking-wider">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <p>
            Welcome to <strong>Fresh Devotionals</strong>. By accessing or using
            our mobile application and services, you agree to comply with and be
            bound by the following Terms of Use. Please review them carefully.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">
              1. Acceptance of Terms
            </h2>
            <p>
              By downloading, installing, or using the Fresh Devotionals app,
              you signify your agreement to these Terms of Use. If you do not
              agree to these terms, you must not use or access the services.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">
              2. Description of Service
            </h2>
            <p>
              Fresh Devotionals provides daily spiritual reading, scripture
              references, prayers, bookmarks, and congregation feedback
              coordination. We grant you a limited, non-exclusive,
              non-transferable, revocable license to use the app for personal,
              non-commercial purposes.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">
              3. User Conduct & Responsibilities
            </h2>
            <p>
              You agree to use our services in accordance with all applicable
              local, national, and international laws. Specifically, you agree
              not to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Use the application to submit false, malicious, or inappropriate
                feedback comments.
              </li>
              <li>
                Attempt to scrape, reverse engineer, or compromise the database
                or backend systems.
              </li>
              <li>
                Circumvent any security measures or access-controls implemented
                on the server.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">
              4. Intellectual Property
            </h2>
            <p>
              All devotion contents, software code, graphic designs, logos, and
              trademarks contained within the Fresh Devotionals app and admin
              dashboard are the sole property of Fresh Devotionals or its
              content providers, protected by copyright and intellectual
              property laws.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">
              5. Disclaimer of Warranties
            </h2>
            <p>
              The services are provided on an "as is" and "as available" basis
              without warranties of any kind, whether express or implied. We do
              not guarantee that the application will be completely
              uninterrupted, secure, or free from temporary software errors.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Fresh Devotionals and its
              developer team shall not be liable for any direct, indirect,
              incidental, or consequential damages resulting from your use or
              inability to use the services.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-850">
              7. Changes to Terms
            </h2>
            <p>
              We reserve the right to update or modify these Terms of Use at any
              time. Any changes will become effective immediately upon posting.
              Your continued use of the application following updates
              constitutes your acceptance of the revised terms.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>&copy; {new Date().getFullYear()} Fresh Devotionals.</span>
          {/* <Link
            to="/login"
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Admin Portal</span>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
