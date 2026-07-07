import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User
} from "lucide-react";
import { reset, selectUser } from "../state/slices/authReducer";
import { selectUnreadCount } from "../state/slices/feedbackSlice";

interface SidebarLayoutProps {
  children: React.ReactNode;
  setSelectedCategoryFilter?: (category: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional") => void;
}

export default function SidebarLayout({ children, setSelectedCategoryFilter }: SidebarLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDevotionsOpen, setIsDevotionsOpen] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const user = useSelector(selectUser);
  const unreadFeedbackCount = useSelector(selectUnreadCount);

  const handleLogout = () => {
    dispatch(reset());
    navigate("/login");
  };

  const categories = [
    { name: "Daily Deliverance", value: "Daily Deliverance" as const },
    { name: "Holiness", value: "Holiness" as const },
    { name: "Prayer", value: "Prayer" as const },
    { name: "Yearly Devotional", value: "Yearly Devotional" as const }
  ];

  const handleCategoryClick = (categoryVal: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional") => {
    if (setSelectedCategoryFilter) {
      setSelectedCategoryFilter(categoryVal);
    } else {
      sessionStorage.setItem("selectedCategoryFilter", categoryVal);
    }
    navigate("/devotions");
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Devotions",
      path: "/devotions",
      icon: BookOpen,
      isExpandable: true
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell
    },
    {
      name: "Feedback",
      path: "/feedback",
      icon: MessageSquare,
      badge: unreadFeedbackCount > 0 ? unreadFeedbackCount : undefined
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#121214] text-slate-400 font-sans border-r border-[#232326]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#232326] bg-[#161619]">
        <div className="w-8 h-8 rounded-sm bg-[#27272A] border border-[#3F3F46] flex items-center justify-center font-bold text-white text-md tracking-wider">
          FW
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[#FAFAFA] font-bold text-sm tracking-wide leading-tight">Fresh Words</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Console v1.0.0</span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isExpandable) {
            return (
              <div key={item.name} className="space-y-0.5">
                <button
                  onClick={() => setIsDevotionsOpen(!isDevotionsOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all group ${
                    active 
                      ? "bg-[#1E1E22] text-white border-l-2 border-orange-500 rounded-l-none pl-2.5" 
                      : "hover:bg-[#1A1A1E] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-orange-500" : "text-slate-500 group-hover:text-slate-350"}`} />
                    <span>{item.name}</span>
                  </div>
                  {isDevotionsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>

                {isDevotionsOpen && (
                  <div className="pl-6 space-y-0.5 border-l border-[#232326] ml-4.5 my-0.5">
                    {categories.map((cat) => {
                      const isCurrentCat = active && sessionStorage.getItem("selectedCategoryFilter") === cat.value;
                      return (
                        <button
                          key={cat.name}
                          onClick={() => handleCategoryClick(cat.value)}
                          className={`w-full text-left block px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                            isCurrentCat
                              ? "text-orange-500 bg-[#1E1E22]/40"
                              : "text-slate-500 hover:text-slate-300 hover:bg-[#1A1A1E]/30"
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all group ${
                active 
                  ? "bg-[#1E1E22] text-white border-l-2 border-orange-500 rounded-l-none pl-2.5" 
                  : "hover:bg-[#1A1A1E] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${active ? "text-orange-500" : "text-slate-500 group-hover:text-slate-350"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-[#27272A] border border-[#3F3F46] text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-xs scale-90">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-3 border-t border-[#232326] bg-[#0E0E10]">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-sm bg-[#161619] border border-[#232326]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-sm bg-[#27272A] border border-[#3F3F46] flex items-center justify-center flex-shrink-0 text-slate-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[11px] font-bold text-[#FAFAFA] truncate">Pastor John</span>
              <span className="text-[9px] font-mono text-slate-550 truncate">{user?.email || "admin@freshwords.org"}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1 rounded-sm text-slate-500 hover:text-red-400 hover:bg-[#232326] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#121214] shadow-2xl transition-transform duration-300 transform translate-x-0">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-md text-slate-500 hover:text-white focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-full flex flex-col">
              {sidebarContent}
            </div>
          </div>
          <div className="flex-shrink-0 w-14" onClick={() => setIsMobileOpen(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header on mobile */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#121214] border-b border-[#232326] text-white md:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-md text-slate-400 hover:text-white focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-xs tracking-wider font-mono">FW ADMIN</span>
          </div>
          <div className="w-7 h-7 rounded-sm bg-[#27272A] border border-[#3F3F46] flex items-center justify-center font-bold text-xxs">
            PJ
          </div>
        </header>

        {/* Dynamic content viewport */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#FAFAFC] p-4 md:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
