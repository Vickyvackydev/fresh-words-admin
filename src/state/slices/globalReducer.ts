import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface GlobalTypes {
  slideOpen: boolean;
  dropBox: boolean;
  selectedBlog: Object;
  showCookies: boolean;
  tab: string;
}
const initialState: GlobalTypes = {
  slideOpen: false,
  dropBox: false,
  selectedBlog: {},
  showCookies: false,
  tab: "",
};
export const GlobalSlice = createSlice({
  initialState,
  name: "globalstate",
  reducers: {
    setSlideOpen: (state, action: PayloadAction<boolean>) => {
      state.slideOpen = action.payload;
    },
    setDropBox: (state, action: PayloadAction<boolean>) => {
      state.dropBox = action.payload;
    },
    setSelectedBlog: (state, action) => {
      state.selectedBlog = action.payload;
    },

    setShowCookies: (state, action) => {
      state.showCookies = action.payload;
    },
    setTab: (state, action) => {
      state.tab = action.payload;
    },
  },
});

export const {
  setSlideOpen,
  setDropBox,
  setSelectedBlog,
  setShowCookies,
  setTab,
} = GlobalSlice.actions;

export const slideOpen = (state: RootState) => state.globalstate.slideOpen;
export const dropBox = (state: RootState) => state.globalstate.dropBox;
export const selectBlog = (state: RootState) => state.globalstate.selectedBlog;
export const selecTab = (state: RootState) => state.globalstate.tab;
export const showCookie = (state: RootState) => state.globalstate.showCookies;

export const globalReducer = GlobalSlice.reducer;
