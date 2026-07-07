import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSettings, updateSettings } from "../state/slices/settingsSlice";
import { Save, UploadCloud, Info, Globe, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsView() {
  const dispatch = useDispatch();
  const currentSettings = useSelector(selectSettings);

  const [churchName, setChurchName] = useState(currentSettings.churchName);
  const [supportEmail, setSupportEmail] = useState(currentSettings.supportEmail);
  const [privacyPolicy, setPrivacyPolicy] = useState(currentSettings.privacyPolicy);
  const [termsOfService, setTermsOfService] = useState(currentSettings.termsOfService);
  const [aboutUs, setAboutUs] = useState(currentSettings.aboutUs);
  const [logoPreview, setLogoPreview] = useState<string>(currentSettings.appLogo);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file only.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setLogoPreview(reader.result);
          toast.success("Logo uploaded successfully. Save settings to apply.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!churchName || !supportEmail) {
      toast.error("Church Name and Support Email are required.");
      return;
    }

    dispatch(
      updateSettings({
        churchName,
        supportEmail,
        privacyPolicy,
        termsOfService,
        aboutUs,
        appLogo: logoPreview
      })
    );
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Heading */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-5 w-full">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Portal Settings</h1>
        <p className="text-xs text-slate-500">Customize church metadata, application logo assets, support coordinates, and privacy policies</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Branding / Logo */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-md p-6 space-y-6 flex flex-col items-center text-center">
            <div className="space-y-1 w-full text-left">
              <h3 className="font-bold text-slate-800 text-md">App Branding</h3>
              <p className="text-xs text-slate-400">Modify logo and brand assets displayed in the app</p>
            </div>

            {/* Logo Preview box */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-md border-2 border-slate-150 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="App Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <span className="font-extrabold text-2xl text-orange-500">FW</span>
                    <span className="text-[10px] uppercase font-bold mt-1">No Logo</span>
                  </div>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-md flex flex-col items-center justify-center text-white text-xxs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200">
                <UploadCloud className="w-5 h-5 mb-1 text-orange-500" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-700 text-sm">{churchName || "Fresh Words App"}</h4>
              <p className="text-xxs text-slate-400">Church Logo Image Asset</p>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-md p-3.5 flex gap-2 text-slate-550 text-xxs leading-normal text-left w-full">
              <Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>For best visual rendering, upload a square SVG or PNG format (e.g. 512px by 512px).</span>
            </div>
          </div>
        </div>

        {/* Right column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-md p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">General Settings</h3>
            
            <div className="space-y-4">
              {/* Church Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Church Name</label>
                <input
                  type="text"
                  required
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="e.g. Fresh Words Ministry"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Support Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Support / Contact Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="e.g. info@freshwords.org"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Policy Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Privacy Policy */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Privacy Policy URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={privacyPolicy}
                      onChange={(e) => setPrivacyPolicy(e.target.value)}
                      placeholder="e.g. https://domain.org/privacy"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Terms of Service */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Terms & Conditions URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={termsOfService}
                      onChange={(e) => setTermsOfService(e.target.value)}
                      placeholder="e.g. https://domain.org/terms"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* About Us */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">About Ministry Description</label>
                <textarea
                  rows={4}
                  value={aboutUs}
                  onChange={(e) => setAboutUs(e.target.value)}
                  placeholder="Describe your ministry or app details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
