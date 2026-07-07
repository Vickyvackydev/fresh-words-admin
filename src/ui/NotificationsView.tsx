import { useDispatch, useSelector } from "react-redux";
import { selectNotifications, updateNotificationSetting, NotificationSetting } from "../state/slices/notificationSlice";
import { Bell, Clock, Shuffle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationsView() {
  const dispatch = useDispatch();
  const settings = useSelector(selectNotifications);

  const handleToggleEnabled = (id: string, enabled: boolean, category: string) => {
    dispatch(updateNotificationSetting({ id, enabled }));
    toast.success(`${category} notifications ${enabled ? "enabled" : "disabled"}`);
  };

  const handleTimeChange = (id: string, time: string) => {
    dispatch(updateNotificationSetting({ id, time }));
    // No toast here to prevent spamming while user is editing
  };

  const handleToggleRandomize = (id: string, randomize: boolean, category: string) => {
    dispatch(updateNotificationSetting({ id, randomize }));
    toast.success(`${category} year randomization ${randomize ? "enabled" : "disabled"}`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Heading */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-5 w-full">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notification Manager</h1>
        <p className="text-xs text-slate-500">Configure delivery schedules and yearly randomization for each devotional category</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting: NotificationSetting) => {
          const isYearly = setting.category === "Yearly Devotional";

          return (
            <div 
              key={setting.id}
              className="bg-white rounded-xl p-6 shadow-xs space-y-6 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${setting.enabled ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-400"}`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{setting.category}</h3>
                      <p className="text-xxs text-slate-400">Push notification schedule</p>
                    </div>
                  </div>
                  
                  {/* Enabled Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={(e) => handleToggleEnabled(setting.id, e.target.checked, setting.category)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                {/* Delivery Time */}
                <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold">Delivery Time</span>
                  </div>
                  
                  <div>
                    {/* Time Input / Picker */}
                    <input
                      type="text"
                      value={setting.time}
                      disabled={!setting.enabled}
                      onChange={(e) => handleTimeChange(setting.id, e.target.value)}
                      placeholder="e.g. 08:00 AM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-center text-slate-750 font-bold font-mono focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Randomize Settings */}
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Shuffle className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold">Randomize Every Year</span>
                  </div>

                  <div>
                    {isYearly ? (
                      <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md uppercase tracking-wider select-none">
                        Randomize: OFF
                      </span>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.randomize}
                          disabled={!setting.enabled}
                          onChange={(e) => handleToggleRandomize(setting.id, e.target.checked, setting.category)}
                          className="w-4.5 h-4.5 text-orange-600 border-slate-350 rounded focus:ring-orange-500 disabled:opacity-40"
                        />
                        <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">
                          {setting.randomize ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-6 pt-4 border-t border-slate-50/60 flex items-center gap-1.5 text-xxs font-semibold text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Auto-saved to settings profile</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
