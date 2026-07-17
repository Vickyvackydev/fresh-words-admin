import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "./state/slices/authReducer";

import { useState, useEffect } from "react";

// Views
import Login from "./ui/Login";
import Dashboard from "./ui/Dashboard";
import Devotions from "./ui/Devotions";
import NotificationsView from "./ui/NotificationsView";
import FeedbackView from "./ui/FeedbackView";
import SettingsView from "./ui/SettingsView";
import PrivacyPolicy from "./ui/PrivacyPolicy";
import TermsOfUse from "./ui/TermsOfUse";
import SidebarLayout from "./layout/SidebarLayout";
import { ToastContainer } from "./components/CustomToast";

function App() {
  const token = useSelector(selectToken);
  const location = useLocation();

  // Keep track of which category was clicked in the sidebar to sync to Devotions filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional" | null
  >(null);

  // Sync category selection when coming from sidebar links
  const handleCategorySelection = (
    cat: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional",
  ) => {
    setSelectedCategoryFilter(cat);
  };

  // Reset category filter if we navigate elsewhere
  useEffect(() => {
    if (location.pathname !== "/devotions") {
      setSelectedCategoryFilter(null);
    }
  }, [location.pathname]);

  const isAuthenticated = !!token;

  return (
    <>
      <ToastContainer />

      <Routes>
        {/* Unauthenticated Route */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
          }
        />

        {/* Public Utility Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />

        {/* Authenticated Routes wrapped in SidebarLayout */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <SidebarLayout
                setSelectedCategoryFilter={handleCategorySelection}
              >
                <Dashboard />
              </SidebarLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/devotions"
          element={
            isAuthenticated ? (
              <SidebarLayout
                setSelectedCategoryFilter={handleCategorySelection}
              >
                <Devotions
                  categoryFilter={selectedCategoryFilter}
                  setCategoryFilter={setSelectedCategoryFilter}
                />
              </SidebarLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/notifications"
          element={
            isAuthenticated ? (
              <SidebarLayout
                setSelectedCategoryFilter={handleCategorySelection}
              >
                <NotificationsView />
              </SidebarLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/feedback"
          element={
            isAuthenticated ? (
              <SidebarLayout
                setSelectedCategoryFilter={handleCategorySelection}
              >
                <FeedbackView />
              </SidebarLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <SidebarLayout
                setSelectedCategoryFilter={handleCategorySelection}
              >
                <SettingsView />
              </SidebarLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallbacks */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </>
  );
}

export default App;
