import React, { useState } from "react";
import { Bell, Clock, Shuffle, CheckCircle, Loader2 } from "lucide-react";
import toast from "../components/CustomToast";
import { useAdminSettings, useUpdateAdminSettings } from "../api/hooks";

interface TimeSelectProps {
  value: string;
  onChange: (time: string) => void;
  disabled: boolean;
}

const TimeSelect = ({ value, onChange, disabled }: TimeSelectProps) => {
  // Parse value (e.g. "08:30 AM")
  const parts = value.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i) || ["08:00 AM", "08", "00", "AM"];
  const hour = parts[1];
  const minute = parts[2];
  const ampm = parts[3].toUpperCase();

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute} ${ampm}`);
  };
  const handleMinuteChange = (newMin: string) => {
    onChange(`${hour}:${newMin} ${ampm}`);
  };
  const handleAmpmChange = (newAmpm: string) => {
    onChange(`${hour}:${minute} ${newAmpm}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"]; // Common devotional time step divisions

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <select
        value={hour}
        disabled={disabled}
        onChange={(e) => handleHourChange(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs text-center text-slate-750 font-bold focus:outline-none focus:border-orange-500 disabled:opacity-50 cursor-pointer font-mono"
      >
        {hours.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-slate-400 font-bold text-xs">:</span>
      <select
        value={minute}
        disabled={disabled}
        onChange={(e) => handleMinuteChange(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs text-center text-slate-750 font-bold focus:outline-none focus:border-orange-500 disabled:opacity-50 cursor-pointer font-mono"
      >
        {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select
        value={ampm}
        disabled={disabled}
        onChange={(e) => handleAmpmChange(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs text-center text-slate-750 font-bold focus:outline-none focus:border-orange-500 disabled:opacity-50 cursor-pointer font-mono"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default function NotificationsView() {
  const { data: settingsData, isLoading, refetch } = useAdminSettings();
  const updateSettingsMutation = useUpdateAdminSettings();
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);

  const settingsList = settingsData ? [
    {
      id: "daily_deliverance",
      category: "Daily Deliverance",
      enabled: settingsData.daily_deliverance_enabled,
      time: settingsData.daily_deliverance_time,
      randomize: settingsData.daily_deliverance_randomize,
    },
    {
      id: "holiness",
      category: "Holiness",
      enabled: settingsData.holiness_enabled,
      time: settingsData.holiness_time,
      randomize: settingsData.holiness_randomize,
    },
    {
      id: "prayer",
      category: "Prayer",
      enabled: settingsData.prayer_enabled,
      time: settingsData.prayer_time,
      randomize: settingsData.prayer_randomize,
    },
    {
      id: "yearly_devotional",
      category: "Yearly Devotional",
      enabled: settingsData.yearly_devotional_enabled,
      time: settingsData.yearly_devotional_time,
      randomize: settingsData.yearly_devotional_randomize,
    }
  ] : [];

  const handleToggleEnabled = (id: string, enabled: boolean, category: string) => {
    setLoadingToggleId(id);
    updateSettingsMutation.mutate({
      ...settingsData,
      [`${id}_enabled`]: enabled
    }, {
      onSuccess: () => {
        refetch();
        toast.success(`${category} notifications ${enabled ? "enabled" : "disabled"}`);
        setLoadingToggleId(null);
      },
      onError: (err: any) => {
        toast.error("Failed to update status: " + (err.message || "Unknown error"));
        setLoadingToggleId(null);
      }
    });
  };

  const handleTimeChange = (id: string, time: string) => {
    updateSettingsMutation.mutate({
      ...settingsData,
      [`${id}_time`]: time
    }, {
      onSuccess: () => {
        refetch();
      },
      onError: (err: any) => {
        toast.error("Failed to update time: " + (err.message || "Unknown error"));
      }
    });
  };

  const handleToggleRandomize = (id: string, randomize: boolean, category: string) => {
    updateSettingsMutation.mutate({
      ...settingsData,
      [`${id}_randomize`]: randomize
    }, {
      onSuccess: () => {
        refetch();
        toast.success(`${category} year randomization ${randomize ? "enabled" : "disabled"}`);
      },
      onError: (err: any) => {
        toast.error("Failed to update randomization: " + (err.message || "Unknown error"));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Heading */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-5 w-full">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Devotional Settings</h1>
        <p className="text-xs text-slate-500">Control category availability in the mobile app and default delivery schedules for users.</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsList.map((setting) => {
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
                      <p className="text-xxs text-slate-400">Category availability in mobile app</p>
                    </div>
                  </div>
                  
                  {/* Enabled Toggle Switch */}
                  <label className={`relative inline-flex items-center cursor-pointer select-none ${loadingToggleId === setting.id ? "opacity-70 pointer-events-none" : ""}`}>
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      disabled={loadingToggleId === setting.id}
                      onChange={(e) => handleToggleEnabled(setting.id, e.target.checked, setting.category)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    {loadingToggleId === setting.id && (
                      <div className={`absolute top-[2px] h-5 w-5 flex items-center justify-center z-10 transition-all ${setting.enabled ? "left-[22px]" : "left-[2px]"}`}>
                        <Loader2 className={`w-3.5 h-3.5 animate-spin ${setting.enabled ? "text-orange-600" : "text-slate-400"}`} />
                      </div>
                    )}
                  </label>
                </div>

                {/* Delivery Time */}
                <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold">Default Delivery Time</span>
                  </div>
                  
                  <div>
                    {/* Time Dropdowns Selectors */}
                    <TimeSelect
                      value={setting.time}
                      disabled={!setting.enabled}
                      onChange={(time) => handleTimeChange(setting.id, time)}
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
                      <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md uppercase tracking-wider select-none" title="Yearly devotional follows calendar date sequence and cannot be randomized">
                        Disabled (Calendar Order)
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
