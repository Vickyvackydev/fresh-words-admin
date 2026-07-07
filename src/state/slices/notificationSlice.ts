import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface NotificationSetting {
  id: string;
  category: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional";
  enabled: boolean;
  time: string; // e.g. "08:00 AM"
  randomize: boolean;
}

interface NotificationState {
  settings: NotificationSetting[];
}

const initialState: NotificationState = {
  settings: [
    {
      id: "notif-dd",
      category: "Daily Deliverance",
      enabled: true,
      time: "08:00 AM",
      randomize: true
    },
    {
      id: "notif-pr",
      category: "Prayer",
      enabled: true,
      time: "08:30 AM",
      randomize: true
    },
    {
      id: "notif-ho",
      category: "Holiness",
      enabled: true,
      time: "09:00 AM",
      randomize: true
    },
    {
      id: "notif-yr",
      category: "Yearly Devotional",
      enabled: true,
      time: "08:00 AM",
      randomize: false // Locked for yearly
    }
  ]
};

export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    updateNotificationSetting: (
      state,
      action: PayloadAction<{
        id: string;
        enabled?: boolean;
        time?: string;
        randomize?: boolean;
      }>
    ) => {
      const setting = state.settings.find((s) => s.id === action.payload.id);
      if (setting) {
        if (action.payload.enabled !== undefined) {
          setting.enabled = action.payload.enabled;
        }
        if (action.payload.time !== undefined) {
          setting.time = action.payload.time;
        }
        // Yearly cannot be randomized, so keep it false
        if (action.payload.randomize !== undefined && setting.category !== "Yearly Devotional") {
          setting.randomize = action.payload.randomize;
        }
      }
    }
  }
});

export const { updateNotificationSetting } = notificationSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications.settings;

export default notificationSlice.reducer;
