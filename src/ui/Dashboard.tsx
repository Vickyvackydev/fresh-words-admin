import { BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { useDashboardStats } from "../api/hooks";
import { useSelector } from "react-redux";
import { selectUser } from "../state/slices/authReducer";

export default function Dashboard() {
  const { data: stats } = useDashboardStats();
  const user = useSelector(selectUser);

  // Categories list
  const categoryNames = [
    {
      key: "Daily Deliverance",
      display: "Daily Deliverance",
      desc: "Rotates and re-shuffles in the new year",
    },
    {
      key: "Prayer",
      display: "Prayer Devotional",
      desc: "Rotates and re-shuffles in the new year",
    },
    {
      key: "Holiness",
      display: "Holiness Devotional",
      desc: "Rotates and re-shuffles in the new year",
    },
    {
      key: "Yearly Devotional",
      display: "Yearly Devotional",
      desc: "Requires manual yearly package upload",
    },
  ];

  // Get active (Published) package for each category
  const getActivePackage = (category: string) => {
    return stats?.active_packages?.find(
      (pkg: any) => pkg.category === category,
    );
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
          {getGreeting()}, {user?.first_name}
        </h1>
        <p className="text-xs text-slate-500">
          Admin administration portal. System operational and online.
        </p>
      </div>

      {/* Package Verification & Status Check Header */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 tracking-wide mb-1">
          Package Health Check
        </h2>
        <p className="text-xxs text-slate-400">
          Is everything ready for this year?
        </p>
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
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    {cat.display}
                  </span>
                  <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {isPublished
                      ? `${activePkg.year} Package`
                      : "No Active Package"}
                  </h3>
                  <p className="text-xxs text-slate-400 leading-normal">
                    {cat.desc}
                  </p>
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
                  {isPublished
                    ? `${activePkg.devotionals?.length ?? 0} Devotions`
                    : "0 Days"}
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
            <h3 className="font-bold text-slate-850 text-sm">
              System Usage Analytics
            </h3>
            <p className="text-xxs text-slate-400">
              Activity index, reads, and feedback statistics for the past 14
              days
            </p>
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Active Reads
            </span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">
              {stats?.total_active_reads?.toLocaleString() ?? 0}
            </span>
            <span
              className={`text-[10px] font-semibold block mt-0.5 ${
                stats?.active_reads_percentage_change?.includes("↓")
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              {stats?.active_reads_percentage_change || "0% vs last week"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Feedbacks
            </span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">
              {stats?.total_feedback ?? 0}
            </span>
            <span className="text-[10px] text-indigo-650 font-semibold block mt-0.5">
              {stats?.unread_feedback
                ? `${stats.unread_feedback} unread`
                : "0 unread"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Devotionals
            </span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">
              {stats?.total_devotionals ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              {stats?.published_packages
                ? `${stats.published_packages} active books`
                : "0 active books"}
            </span>
          </div>
        </div>

        {/* CSS activity chart */}
        <div className="h-48 flex items-end justify-between gap-2.5 pt-4 px-2 select-none">
          {(() => {
            const dailyAnalytics = stats?.daily_analytics || [];
            const maxVal = Math.max(
              ...dailyAnalytics.map((d) => Math.max(d.reads, d.feedback, 10)),
            );
            return dailyAnalytics.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
              >
                <div className="w-full flex justify-center gap-1 items-end h-full">
                  {/* Reads Bar */}
                  <div
                    className="w-2.5 sm:w-4 bg-slate-600 rounded-t-xs transition-all duration-300 hover:bg-slate-750 relative"
                    style={{ height: `${(item.reads / maxVal) * 100}%` }}
                    title={`Reads: ${item.reads}`}
                  />
                  {/* Feedback Bar */}
                  <div
                    className="w-1.5 sm:w-2.5 bg-orange-600 rounded-t-xs transition-all duration-300 hover:bg-orange-500 relative"
                    style={{ height: `${(item.feedback / maxVal) * 100}%` }}
                    title={`Feedback: ${item.feedback}`}
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-tight whitespace-nowrap">
                  {item.day}
                </span>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
