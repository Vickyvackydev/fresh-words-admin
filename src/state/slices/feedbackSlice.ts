import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: "Read" | "Unread";
}

interface FeedbackState {
  entries: FeedbackEntry[];
}

const initialState: FeedbackState = {
  entries: [
    {
      id: "fb-1",
      name: "Bro. Emmanuel Nwosu",
      email: "emmanuel.nwosu@gmail.com",
      message: "The daily deliverance devotions have been a source of strength for my family. We read it every morning during devotion. God bless the church!",
      date: "July 7, 2026",
      status: "Unread"
    },
    {
      id: "fb-2",
      name: "Sis. Deborah Vance",
      email: "debbie.vance@yahoo.com",
      message: "Is there a way to request physical prints of the 2027 packages? My elderly grandmother struggles with reading on the phone and would love a booklet.",
      date: "July 6, 2026",
      status: "Unread"
    },
    {
      id: "fb-3",
      name: "Pastor Andrew Cole",
      email: "andrewcole@gracechapel.net",
      message: "Excellent application interface. Can we integrate our local payment gateway for tithing and donations in the settings later on?",
      date: "July 6, 2026",
      status: "Unread"
    },
    {
      id: "fb-4",
      name: "Chinedu Okafor",
      email: "chinedu_okafor99@outlook.com",
      message: "I noticed a minor typo in the scripture citation for March 12 Daily Deliverance. It says Genesis instead of Exodus. Please check.",
      date: "July 5, 2026",
      status: "Unread"
    },
    {
      id: "fb-5",
      name: "Sarah Jenkins",
      email: "sjenkins@me.com",
      message: "The alarm/notification for the Prayer Devotional goes off on time but doesn't play any sound on my Android phone. Is this from my settings or the app?",
      date: "July 4, 2026",
      status: "Unread"
    },
    {
      id: "fb-6",
      name: "David Adeleke",
      email: "davido_adeleke@gmail.com",
      message: "Thank you Pastor John! The Holiness devotional for July 3 really spoke to my heart. I feel renewed and cleansed today.",
      date: "July 3, 2026",
      status: "Unread"
    },
    {
      id: "fb-7",
      name: "Elizabeth Taylor",
      email: "liz_taylor@gmail.com",
      message: "Is it possible to share specific devotionals on WhatsApp directly from the app? That would be a wonderful tool for evangelism.",
      date: "July 2, 2026",
      status: "Unread"
    },
    {
      id: "fb-8",
      name: "Gabriel Arch",
      email: "g_arch@outlook.com",
      message: "The yearly devotional doesn't seem to refresh daily on my iPhone unless I close and reopen the app. Please check the background caching.",
      date: "July 2, 2026",
      status: "Unread"
    },
    {
      id: "fb-9",
      name: "Victoria Harrison",
      email: "vharrison@gmail.com",
      message: "God bless you for this app! It's so clean, zero advertisements, and straight to the point. We love the prayer section.",
      date: "July 1, 2026",
      status: "Unread"
    },
    {
      id: "fb-10",
      name: "Marcus Aurelius",
      email: "marcus.aurelius@gmail.com",
      message: "The UI looks premium. I love the dark mode on the mobile version, it's very easy on the eyes during late-night reading.",
      date: "June 30, 2026",
      status: "Unread"
    },
    {
      id: "fb-11",
      name: "Grace Animashaun",
      email: "grace_anim@yahoo.com",
      message: "Can we have an audio read-along feature in future updates? It will help visually impaired members follow the devotions.",
      date: "June 29, 2026",
      status: "Unread"
    },
    {
      id: "fb-12",
      name: "Samuel L. Jackson",
      email: "samuel_l@gmail.com",
      message: "Excellent effort. Everything is working fine. May God continue to expand this ministry.",
      date: "June 28, 2026",
      status: "Unread"
    },
    {
      id: "fb-13",
      name: "Peter Parker",
      email: "spidey@dailybugle.com",
      message: "This app helps me stay grounded in scripture. Thanks to the tech team for putting this together.",
      date: "June 25, 2026",
      status: "Read"
    },
    {
      id: "fb-14",
      name: "Clark Kent",
      email: "ckent@dailyplanet.com",
      message: "Very useful app. Works perfectly offline as well. Looking forward to the next year package updates.",
      date: "June 24, 2026",
      status: "Read"
    }
  ]
};

export const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<{ id: string }>) => {
      const entry = state.entries.find((e) => e.id === action.payload.id);
      if (entry) {
        entry.status = "Read";
      }
    },
    deleteFeedback: (state, action: PayloadAction<{ id: string }>) => {
      state.entries = state.entries.filter((e) => e.id !== action.payload.id);
    }
  }
});

export const { markAsRead, deleteFeedback } = feedbackSlice.actions;

export const selectFeedback = (state: RootState) => state.feedback.entries;
export const selectUnreadCount = (state: RootState) =>
  state.feedback.entries.filter((e: FeedbackEntry) => e.status === "Unread").length;

export default feedbackSlice.reducer;
