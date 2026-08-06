import { Headset, Mail, Phone } from "lucide-react";

export default function SupportView() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/50 p-8 sm:p-12 shadow-sm space-y-8 relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="space-y-4 border-b border-slate-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold tracking-wide uppercase">
            <Headset className="w-3.5 h-3.5" />
            <span>Help & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Contact Support
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            We are here to help! If you have any questions, run into issues, or need assistance with the Fresh Devotionals app, please reach out to our support team using the contact details below.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-600">
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Email Contact Card */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6 flex flex-col items-start space-y-4 transition-colors hover:border-orange-200 hover:bg-orange-50/30">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <Mail className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-850">Email Support</h3>
                <p className="text-slate-500 mt-1 mb-3">Send us an email and we will get back to you as soon as possible.</p>
                <a 
                  href="mailto:freshdevotionals@gmail.com" 
                  className="inline-flex font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  freshdevotionals@gmail.com
                </a>
              </div>
            </div>

            {/* Phone Contact Card */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6 flex flex-col items-start space-y-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <Phone className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-850">Phone Support</h3>
                <p className="text-slate-500 mt-1 mb-3">Available during standard business hours for urgent assistance.</p>
                <a 
                  href="tel:+15168495045" 
                  className="inline-flex font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  +1 (516) 849-5045
                </a>
              </div>
            </div>

          </div>

          <div className="space-y-3 pt-4">
            <h2 className="text-lg font-bold text-slate-850">App Store Review & Availability</h2>
            <p>
              This support page is actively monitored by our development team. 
              If you are reviewing our application on an app store or marketplace, please utilize the contact methods above if you require demonstration credentials, business model clarification, or technical walkthroughs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>&copy; {new Date().getFullYear()} Fresh Devotionals. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
