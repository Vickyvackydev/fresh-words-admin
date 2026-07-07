import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  selectPackages, 
  publishPackage, 
  rollbackPackage, 
  deletePackage,
  generate365Days,
  DevotionalEntry,
  DevotionalPackage 
} from "../state/slices/devotionalSlice";
import { 
  Search, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  X,
  History,
  RotateCcw,
  Trash2,
  BookOpen,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

interface DevotionsProps {
  categoryFilter?: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional" | null;
  setCategoryFilter?: (cat: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional" | null) => void;
}

export default function Devotions({ categoryFilter, setCategoryFilter }: DevotionsProps) {
  const dispatch = useDispatch();
  const allPackages = useSelector(selectPackages);

  // Tabs: 'browse' | 'upload' | 'history'
  const [activeTab, setActiveTab] = useState<"browse" | "upload" | "history">("browse");

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<
    "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional"
  >("Daily Deliverance");
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Sync category selection if set from sidebar
  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
      setActiveTab("browse");
      if (setCategoryFilter) setCategoryFilter(null); // consume it
    }
  }, [categoryFilter, setCategoryFilter]);

  // Preview Modal States
  const [previewDevotional, setPreviewDevotional] = useState<DevotionalEntry | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 12;

  // Upload Tab States
  const [uploadCategory, setUploadCategory] = useState<
    "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional"
  >("Daily Deliverance");
  const [uploadYear, setUploadYear] = useState<number>(2028);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [simulateError, setSimulateError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showValidationReport, setShowValidationReport] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  // Processing steps text
  const uploadSteps = [
    { title: "Uploading File...", barChar: "█████████" },
    { title: "Reading PDF...", barChar: "██████" },
    { title: "Extracting Days & Scripts...", barChar: "███████" },
    { title: "Validating Dates & Scripture Ref...", barChar: "█████████" },
    { title: "Saving Draft Package...", barChar: "███████" }
  ];

  // Simulated processing timer
  useEffect(() => {
    let timer: any;
    if (isProcessing) {
      timer = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            if (processingStep < uploadSteps.length - 1) {
              setProcessingStep((s) => s + 1);
              return 0;
            } else {
              // Complete processing
              setIsProcessing(false);
              setShowValidationReport(true);
              clearInterval(timer);
              return 100;
            }
          }
          return prev + 10;
        });
      }, 80);
    }
    return () => clearInterval(timer);
  }, [isProcessing, processingStep]);

  // Get active/filtered packages
  const filteredPackages = allPackages.filter((pkg: DevotionalPackage) => {
    if (pkg.category !== selectedCategory) return false;
    if (selectedYear && pkg.year !== selectedYear) return false;
    if (selectedStatus !== "All" && pkg.status !== selectedStatus) return false;
    return true;
  });

  // Get devotion entries from filtered packages
  const allFilteredEntries: { entry: DevotionalEntry; pkg: DevotionalPackage }[] = [];
  filteredPackages.forEach((pkg: DevotionalPackage) => {
    pkg.entries.forEach((entry: DevotionalEntry) => {
      const matchSearch =
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.scriptureRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.date.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (matchSearch) {
        allFilteredEntries.push({ entry, pkg });
      }
    });
  });

  // Paginated Entries
  const totalPages = Math.ceil(allFilteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedEntries = allFilteredEntries.slice(startIndex, startIndex + entriesPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFileUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }
      setSelectedFile(file);
      setIsProcessing(true);
      setProcessingStep(0);
      setProcessingProgress(0);
      setShowValidationReport(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }
      setSelectedFile(file);
      setIsProcessing(true);
      setProcessingStep(0);
      setProcessingProgress(0);
      setShowValidationReport(false);
    }
  };

  const handlePublish = () => {
    // Generate parsed list
    const generatedEntries = generate365Days(uploadCategory, uploadYear);
    dispatch(
      publishPackage({
        category: uploadCategory,
        year: uploadYear,
        entries: generatedEntries
      })
    );
    toast.success(`${uploadCategory} ${uploadYear} package successfully published!`);
    
    // Reset states
    setShowPublishConfirm(false);
    setShowValidationReport(false);
    setSelectedFile(null);
    
    // Switch to Browse tab
    setSelectedCategory(uploadCategory);
    setSelectedYear(uploadYear);
    setActiveTab("browse");
  };

  const handleRollback = (pkgId: string, category: string, year: number) => {
    dispatch(rollbackPackage({ packageId: pkgId }));
    toast.success(`Active package set to ${category} ${year}`);
  };

  const handleDelete = (pkgId: string) => {
    if (confirm("Are you sure you want to delete this package? This cannot be undone.")) {
      dispatch(deletePackage({ packageId: pkgId }));
      toast.success("Package deleted successfully");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Devotions Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 w-full">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Devotion Library</h1>
          <p className="text-xs text-slate-500">Upload new devotion documents, inspect days, and manage published packages</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-md border border-slate-200 md:self-end">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "browse" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Devotions</span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "upload" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Package</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "history" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Package History</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: BROWSE DEVOTIONS
          ======================================================== */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-xl shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
                >
                  <option value="Daily Deliverance">Daily Deliverance</option>
                  <option value="Holiness">Holiness Devotional</option>
                  <option value="Prayer">Prayer Devotional</option>
                  <option value="Yearly Devotional">Yearly Devotional</option>
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Package Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
                >
                  <option value={2027}>2027</option>
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
                >
                  <option value="All">All Packages</option>
                  <option value="Published">Published (Active)</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search days, scriptures..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Devotion List */}
          {allFilteredEntries.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 text-lg">No Devotionals Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn't find any devotions matching the category <strong>{selectedCategory}</strong>, year <strong>{selectedYear}</strong>, and status.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Entries Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedEntries.map(({ entry, pkg }) => (
                  <div 
                    key={entry.id}
                    className="bg-white rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-100 text-slate-700 text-xxs font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          {entry.date}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          pkg.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {pkg.status}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1 mt-1">{entry.title}</h3>
                      <p className="text-xs font-semibold text-slate-400 italic leading-snug">{entry.scriptureRef}</p>
                      <p className="text-xxs text-slate-500 line-clamp-2 leading-relaxed">{entry.scriptureText}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{entry.readingTime} min read</span>
                      </div>
                      <button
                        onClick={() => setPreviewDevotional(entry)}
                        className="text-xs font-bold text-orange-600 hover:text-orange-750 transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Preview...</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl shadow-xs">
                  <span className="text-xs text-slate-500">
                    Showing <strong className="font-semibold">{startIndex + 1}</strong> - <strong className="font-semibold">{Math.min(startIndex + entriesPerPage, allFilteredEntries.length)}</strong> of <strong className="font-semibold">{allFilteredEntries.length}</strong> devotions
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      // Display dynamic range of pages if too many
                      if (totalPages > 6 && Math.abs(currentPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="text-slate-300 text-xs">...</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-orange-600 text-white shadow-sm"
                              : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: UPLOAD PACKAGE
          ======================================================== */}
      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Settings */}
          <div className="bg-white rounded-xl p-6 shadow-xs space-y-6 lg:col-span-1">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-md">Package Configuration</h3>
              <p className="text-xs text-slate-400">Select which package and year you are uploading</p>
            </div>

            <div className="space-y-4">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Category</label>
                <select
                  value={uploadCategory}
                  disabled={isProcessing || showValidationReport}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500 disabled:opacity-60"
                >
                  <option value="Daily Deliverance">Daily Deliverance</option>
                  <option value="Holiness">Holiness Devotional</option>
                  <option value="Prayer">Prayer Devotional</option>
                  <option value="Yearly Devotional">Yearly Devotional</option>
                </select>
              </div>

              {/* Year selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Target Year</label>
                <select
                  value={uploadYear}
                  disabled={isProcessing || showValidationReport}
                  onChange={(e) => setUploadYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500 disabled:opacity-60"
                >
                  <option value={2028}>2028 (Next Year)</option>
                  <option value={2027}>2027 (Current Active)</option>
                  <option value={2029}>2029</option>
                </select>
              </div>

              {/* Simulation Mode Selector */}
              <div className="pt-4 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Simulate Parse Errors</label>
                    <p className="text-[10px] text-slate-400 leading-normal">Enabling this generates mock extraction errors (missing days/duplicates) on upload.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateError}
                    disabled={isProcessing}
                    onChange={(e) => setSimulateError(e.target.checked)}
                    className="w-4.5 h-4.5 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload and processing content */}
          <div className="lg:col-span-2 space-y-6">
            {!isProcessing && !showValidationReport && (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="bg-white border border-dashed border-slate-200/50 rounded-xl p-12 text-center hover:border-orange-500 transition-colors flex flex-col items-center justify-center min-h-[350px] shadow-xs"
              >
                <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl mb-4">
                  <UploadCloud className="w-10 h-10" />
                </div>

                <div className="space-y-1 mb-5">
                  <h3 className="font-extrabold text-slate-800 text-lg">Upload Devotion Document</h3>
                  <p className="text-xs text-slate-400">Drag and drop your devotion file here, or click to choose from directory</p>
                </div>

                <label className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-orange-600/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer block">
                  Choose PDF Document
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUploadClick}
                    className="hidden"
                  />
                </label>

                <div className="mt-8 grid grid-cols-3 gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6 w-full max-w-md">
                  <div className="flex flex-col items-center gap-1">
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">Supported</span>
                    <span>PDF</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <span>Future</span>
                    <span>DOCX</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <span>Future</span>
                    <span>EXCEL</span>
                  </div>
                </div>
              </div>
            )}

            {/* PROCESSING LOADER SCREEN */}
            {isProcessing && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white space-y-8 min-h-[350px] flex flex-col justify-center">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-lg text-orange-400">{uploadSteps[processingStep].title}</h3>
                    <span className="text-xs font-semibold text-slate-400">{processingProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-75"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Animated status logs in terminal look */}
                <div className="bg-black/40 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 leading-relaxed">
                  <div className="text-orange-500 font-bold">&gt; Initializing Devotional Extractor v2.4.1</div>
                  
                  {uploadSteps.map((step, idx) => {
                    const isCompleted = idx < processingStep;
                    const isCurrent = idx === processingStep;
                    
                    if (isCompleted) {
                      return (
                        <div key={idx} className="flex items-center justify-between text-slate-400">
                          <span>✓ {step.title}</span>
                          <span className="text-emerald-500">SUCCESS {step.barChar}</span>
                        </div>
                      );
                    } else if (isCurrent) {
                      return (
                        <div key={idx} className="flex items-center justify-between text-orange-400 animate-pulse">
                          <span>⚙ {step.title}</span>
                          <span>RUNNING...</span>
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="opacity-30">
                          <span>⚬ {step.title}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            {/* VALIDATION REPORT */}
            {showValidationReport && !isProcessing && (
              <div className="bg-white rounded-xl p-6 shadow-xs space-y-6">
                
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Processing Result</span>
                    <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                      {selectedFile?.name || "Devotional Document"}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowValidationReport(false);
                      setSelectedFile(null);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status indicator banner */}
                {!simulateError ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Validation Completed Successfully</h4>
                      <p className="text-xs text-emerald-700/90 leading-normal mt-0.5">
                        This devotional package contains a complete cycle. It is formatted correctly and is ready to be published.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-800">
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Document Parsing Failed</h4>
                      <p className="text-xs text-rose-700/90 leading-normal mt-0.5">
                        We detected formatting or structural issues in this PDF. Please correct the document and upload a new version.
                      </p>
                    </div>
                  </div>
                )}

                {/* Validation Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Entries Found</div>
                    <div className="text-xl font-mono font-extrabold text-slate-800 mt-0.5">
                      {!simulateError ? "365" : "362"}
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Dates Checked</div>
                    <div className="text-xl font-mono font-extrabold text-slate-800 mt-0.5">
                      {!simulateError ? "365" : "364"}
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Scripture Refs</div>
                    <div className="text-xl font-mono font-extrabold text-slate-800 mt-0.5">
                      {!simulateError ? "365" : "363"}
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Diagnostics</div>
                    <div className={`text-xl font-mono font-extrabold mt-0.5 ${!simulateError ? "text-emerald-600" : "text-rose-600"}`}>
                      {!simulateError ? "0 Errors" : "3 Errors"}
                    </div>
                  </div>
                </div>

                {/* Diagnostic detailed issues */}
                {simulateError ? (
                  <div className="border border-rose-100 rounded-xl overflow-hidden">
                    <div className="bg-rose-50/50 px-4 py-2 border-b border-rose-100 text-xxs font-bold text-rose-800 uppercase tracking-wider">
                      Critical Document Errors
                    </div>
                    <div className="p-4 space-y-3 text-xs leading-normal">
                      <div className="flex gap-2 text-rose-700">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Missing January 18:</strong> The day transition skips from Jan 17 to Jan 19.</span>
                      </div>
                      <div className="flex gap-2 text-rose-700">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Missing Scripture on February 5:</strong> Title found but no reading content could be parsed.</span>
                      </div>
                      <div className="flex gap-2 text-rose-700">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Duplicate March 12:</strong> Two distinct devotional segments are marked with the date March 12.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preview Extracted Segment (First 3 Days)</h4>
                    <div className="space-y-2">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="bg-slate-200 text-slate-700 text-xxs font-bold px-1.5 py-0.5 rounded-md">January 1</span>
                          <span className="text-slate-800 font-bold ml-2">Walking in Faith</span>
                        </div>
                        <span className="text-slate-400 italic">Hebrews 11:1-3</span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="bg-slate-200 text-slate-700 text-xxs font-bold px-1.5 py-0.5 rounded-md">January 2</span>
                          <span className="text-slate-800 font-bold ml-2">Walking in Peace</span>
                        </div>
                        <span className="text-slate-400 italic">Psalm 46:10</span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="bg-slate-200 text-slate-700 text-xxs font-bold px-1.5 py-0.5 rounded-md">January 3</span>
                          <span className="text-slate-800 font-bold ml-2">Walking in Deliverance</span>
                        </div>
                        <span className="text-slate-400 italic">Psalm 91:1-2</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
                  <button
                    onClick={() => {
                      setShowValidationReport(false);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold tracking-wide cursor-pointer"
                  >
                    {!simulateError ? "Cancel" : "Upload Different File"}
                  </button>
                  {!simulateError && (
                    <button
                      onClick={() => setShowPublishConfirm(true)}
                      className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold tracking-wide cursor-pointer shadow-md shadow-orange-600/10"
                    >
                      Publish Package
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PACKAGE HISTORY / HISTORY MANAGER
          ======================================================== */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-md">Package Archive</h3>
              <p className="text-xs text-slate-400">Review, rollback, and purge devotional packages</p>
            </div>
            
            {/* Quick Category filter inside Archive tab */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter by category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
              >
                <option value="Daily Deliverance">Daily Deliverance</option>
                <option value="Holiness">Holiness Devotional</option>
                <option value="Prayer">Prayer Devotional</option>
                <option value="Yearly Devotional">Yearly Devotional</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Size / Days</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Published Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {allPackages
                  .filter((p: DevotionalPackage) => p.category === selectedCategory)
                  .map((pkg: DevotionalPackage) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {pkg.category} (<span className="font-mono text-slate-500 font-semibold">{pkg.year}</span>)
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-600">{pkg.entriesCount} Days</td>
                      <td className="px-6 py-4">
                        {pkg.status === "Published" ? (
                          <span className="bg-emerald-50 text-emerald-700 text-xxs font-bold px-2 py-0.5 rounded-sm inline-flex items-center gap-1 border border-emerald-150">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span>Active / Published</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-xxs font-semibold px-2 py-0.5 rounded-sm border border-slate-150">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{pkg.publishedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {pkg.status !== "Published" ? (
                            <>
                              <button
                                onClick={() => handleRollback(pkg.id, pkg.category, pkg.year)}
                                title="Rollback / Set Active"
                                className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold px-2.5 py-1.5 rounded-lg border border-orange-100 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Set Active</span>
                              </button>
                              <button
                                onClick={() => handleDelete(pkg.id)}
                                title="Delete Package"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none px-3 py-1">
                              Current Active
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: DEVOTIONAL ENTRY PREVIEW MODAL
          ======================================================== */}
      {previewDevotional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="bg-orange-600 text-white text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {previewDevotional.date}
                </span>
                <h3 className="font-extrabold text-md mt-1 leading-snug">{previewDevotional.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDevotional(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin text-slate-700 leading-relaxed text-sm">
              
              {/* Scripture Section */}
              <div className="bg-orange-50/50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                <div className="font-bold text-xs text-orange-600 uppercase tracking-wider mb-1">
                  Scripture Reading: {previewDevotional.scriptureRef}
                </div>
                <div className="text-slate-800 font-semibold italic text-sm">
                  "{previewDevotional.scriptureText}"
                </div>
              </div>

              {/* Devotional Body */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</h4>
                {previewDevotional.body.map((p, i) => (
                  <p key={i} className="text-slate-600 text-justify">{p}</p>
                ))}
              </div>

              {/* Prayer Point */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Prayer Point</h4>
                <p className="text-slate-700 font-medium italic">"{previewDevotional.prayer}"</p>
              </div>

              {/* Reflection */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Reflection</h4>
                <p className="text-slate-700 font-medium">"{previewDevotional.reflection}"</p>
              </div>

              {/* Action Points */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Points</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  {previewDevotional.actionPoints.map((ap, i) => (
                    <li key={i}>{ap}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50 flex justify-end">
              <button
                onClick={() => setPreviewDevotional(null)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold text-xs tracking-wide rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: PUBLISH CONFIRMATION
          ======================================================== */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 font-sans text-left">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl w-fit">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-lg">Publish 365 Devotions?</h3>
              <p className="text-xs text-slate-400 leading-normal">
                This will compile and publish the <strong>{uploadCategory} ({uploadYear})</strong> devotional package. It will replace the currently active package for this category.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex gap-2 text-amber-800 text-xs leading-normal">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span><strong>Note:</strong> Historical packages are kept in the archive, and you can roll back to a previously active package at any time from the Package History tab.</span>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold tracking-wide cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold tracking-wide cursor-pointer shadow-md shadow-orange-600/10"
              >
                Publish Package
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
