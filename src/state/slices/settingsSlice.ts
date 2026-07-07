import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface SettingsState {
  churchName: string;
  appLogo: string; // Base64 or placeholder URL
  supportEmail: string;
  privacyPolicy: string;
  termsOfService: string;
  aboutUs: string;
}

const initialState: SettingsState = {
  churchName: "Fresh Words Ministry",
  appLogo: "", // starts empty, can be set to uploaded image URL/base64
  supportEmail: "info@freshwordsapp.org",
  privacyPolicy: "https://freshwordsapp.org/privacy",
  termsOfService: "https://freshwordsapp.org/terms",
  aboutUs: "Fresh Words is a daily devotional app dedicated to delivering scriptural guidance, holiness teachings, prayer devotions, and deliverance packages to believers worldwide."
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return {
        ...state,
        ...action.payload
      };
    }
  }
});

export const { updateSettings } = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings;

export default settingsSlice.reducer;
