import { useSelector } from "react-redux";
import { selectPackages, DevotionalPackage } from "../state/slices/devotionalSlice";
import { BookOpen, CheckCircle2, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const packages = useSelector(selectPackages);

  // Categories list
  const categoryNames = [
    { key: "Daily Deliverance", display: "Daily Deliverance", desc: "Rotates and re-shuffles in the new year" },
    { key: "Prayer", display: "Prayer Devotional", desc: "Rotates and re-shuffles in the new year" },
    { key: "Holiness", display: "Holiness Devotional", desc: "Rotates and re-shuffles in the new year" },
    { key: "Yearly Devotional", display: "Yearly Devotional", desc: "Requires manual yearly package upload" }
  ];

  // Get active (Published) package for each category
  const getActivePackage = (category: string) => {
    return packages.find((pkg: DevotionalPackage) => pkg.category === category && pkg.status === "Published");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, Pastor John
        </h1>
        <p className="text-xs text-slate-500">
          Pastor administration portal. System operational and online.
        </p>
      </div>

      {/* Package Verification & Status Check Header */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 tracking-wide mb-1">Package Health Check</h2>
        <p className="text-xxs text-slate-400">Is everything ready for this year?</p>
      </div>

      {/* Devotion Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categoryNames.map((cat) => {
          const activePkg = getActivePackage(cat.key);
          const isPublished = !!activePkg;

          return (
            <div 
              key={cat.key}
              className="bg-white rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{cat.display}</span>
                  <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {isPublished ? `${activePkg.year} Package` : "No Active Package"}
                  </h3>
                  <p className="text-xxs text-slate-400 leading-normal">{cat.desc}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                {isPublished ? (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Upload Pending</span>
                  </div>
                )}
                <span className="text-xs text-slate-600 font-bold">
                  {isPublished ? `${activePkg.entriesCount} Devotions` : "0 Days"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Analytics Section */}
      <div className="bg-white rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-850 text-sm">System Usage Analytics</h3>
            <p className="text-xxs text-slate-400">Activity index, reads, and feedback statistics for the past 14 days</p>
          </div>

          <div className="flex gap-4 text-xxs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#475569]" />
              <span>Devotional Reads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-600" />
              <span>Feedback Received</span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-6 py-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Reads</span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">14,204</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">↑ 12.4% vs last week</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Feedbacks</span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">112</span>
            <span className="text-[10px] text-indigo-650 font-semibold block mt-0.5">↑ 4.2% vs last week</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Devotionals</span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">1,460</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">0.0% unchanged</span>
          </div>
        </div>

        {/* CSS activity chart */}
        <div className="h-48 flex items-end justify-between gap-2.5 pt-4 px-2 select-none">
          {[
            { day: "Jun 24", reads: 40, feedback: 20 },
            { day: "Jun 25", reads: 55, feedback: 15 },
            { day: "Jun 26", reads: 70, feedback: 25 },
            { day: "Jun 27", reads: 65, feedback: 30 },
            { day: "Jun 28", reads: 80, feedback: 10 },
            { day: "Jun 29", reads: 95, feedback: 40 },
            { day: "Jun 30", reads: 85, feedback: 20 },
            { day: "Jul 01", reads: 60, feedback: 15 },
            { day: "Jul 02", reads: 75, feedback: 35 },
            { day: "Jul 03", reads: 90, feedback: 45 },
            { day: "Jul 04", reads: 110, feedback: 50 },
            { day: "Jul 05", reads: 100, feedback: 30 },
            { day: "Jul 06", reads: 120, feedback: 55 },
            { day: "Jul 07", reads: 130, feedback: 60 }
          ].map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
              <div className="w-full flex justify-center gap-1 items-end h-full">
                {/* Reads Bar */}
                <div 
                  className="w-2.5 sm:w-4 bg-slate-600 rounded-t-xs transition-all duration-300 hover:bg-slate-700 relative" 
                  style={{ height: `${(item.reads / 150) * 100}%` }}
                  title={`Reads: ${item.reads * 100}`}
                />
                {/* Feedback Bar */}
                <div 
                  className="w-1.5 sm:w-2.5 bg-orange-600 rounded-t-xs transition-all duration-300 hover:bg-orange-500 relative" 
                  style={{ height: `${(item.feedback / 150) * 100}%` }}
                  title={`Feedback: ${item.feedback}`}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400 tracking-tight whitespace-nowrap">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
