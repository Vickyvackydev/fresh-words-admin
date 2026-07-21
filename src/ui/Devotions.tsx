import React, { useState, useEffect } from "react";
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
  Sparkles,
  Plus,
  Loader2
} from "lucide-react";
import toast from "../components/CustomToast";
import { usePackageHistory, useUploadPackage, usePublishPackage, useRollbackPackage, useDeletePackage, useUpdateDevotional } from "../api/hooks";
import { Package, Devotional as APIDevotional } from "../api/services";
import moment from "moment";

interface DevotionsProps {
  categoryFilter?: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional" | null;
  setCategoryFilter?: (cat: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional" | null) => void;
}

export default function Devotions({ categoryFilter, setCategoryFilter }: DevotionsProps) {
  const uploadPackageMutation = useUploadPackage();
  const publishPackageMutation = usePublishPackage();
  const rollbackPackageMutation = useRollbackPackage();
  const deletePackageMutation = useDeletePackage();
  const updateDevotionalMutation = useUpdateDevotional();

  // Tabs: 'browse' | 'upload' | 'history'
  const [activeTab, setActiveTab] = useState<"browse" | "upload" | "history">("browse");

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<
    "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional"
  >(() => {
    const cached = sessionStorage.getItem("selectedCategoryFilter");
    if (cached) {
      sessionStorage.removeItem("selectedCategoryFilter");
      return cached as any;
    }
    return "Daily Deliverance";
  });
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedStatus, setSelectedStatus] = useState<string>("Published");
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
  const [previewDevotional, setPreviewDevotional] = useState<APIDevotional | null>(null);

  // Edit Modal States
  const [editingDevotional, setEditingDevotional] = useState<APIDevotional | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editScriptureReference, setEditScriptureReference] = useState("");
  const [editScriptureQuote, setEditScriptureQuote] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editPrayer, setEditPrayer] = useState("");
  const [editReflection, setEditReflection] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 12;

  // Upload Tab States
  const [uploadCategory, setUploadCategory] = useState<
    "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional"
  >("Daily Deliverance");
  const [uploadYear, setUploadYear] = useState<number>(currentYear + 1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showValidationReport, setShowValidationReport] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [uploadReport, setUploadReport] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [packageIdToAppend, setPackageIdToAppend] = useState<string | null>(null);

  // Sync upload category selector with selected category when selected category changes
  useEffect(() => {
    setUploadCategory(selectedCategory);
  }, [selectedCategory]);

  // Query packages history from backend (automatically refetches when category changes)
  const { 
    data: packages = [], 
    isLoading: isPackagesLoading, 
    isFetching: isPackagesFetching, 
    refetch: refetchHistory 
  } = usePackageHistory(selectedCategory);

  const filteredPackages = packages.filter((pkg: Package) => {
    if (pkg.category !== selectedCategory) return false;
    if (selectedYear && pkg.year !== selectedYear) return false;
    if (selectedStatus !== "All" && pkg.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    return true;
  });

  // Get devotion entries from filtered packages
  const allFilteredEntries: { entry: APIDevotional; pkg: Package }[] = [];
  filteredPackages.forEach((pkg: Package) => {
    if (pkg.devotionals) {
      pkg.devotionals.forEach((entry: APIDevotional) => {
        const matchSearch =
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.scripture_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `day ${entry.default_day}`.includes(searchTerm.toLowerCase());
        
        if (matchSearch) {
          allFilteredEntries.push({ entry, pkg });
        }
      });
    }
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
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx" && ext !== "doc") {
        toast.error("Please upload PDF, DOC, or DOCX files only.");
        return;
      }
      setSelectedFile(file);
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
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx" && ext !== "doc") {
        toast.error("Please upload PDF, DOC, or DOCX files only.");
        return;
      }
      setSelectedFile(file);
      setShowValidationReport(false);
    }
  };

  const handleProceedUpload = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setShowValidationReport(false);

    const controller = new AbortController();
    setAbortController(controller);

    uploadPackageMutation.mutate({
      category: uploadCategory,
      year: uploadYear,
      file: selectedFile,
      packageId: packageIdToAppend || undefined,
      onProgress: (percent) => setUploadProgress(percent),
      signal: controller.signal,
    }, {
      onSuccess: (data) => {
        setIsProcessing(false);
        setUploadReport(data);
        setShowValidationReport(true);
        if (packageIdToAppend) {
          toast.success("Devotionals successfully appended to draft package!");
        } else {
          toast.success("Document parsed and draft package created!");
        }
        setPackageIdToAppend(null);
        refetchHistory();
        setAbortController(null);
      },
      onError: (err: any) => {
        setIsProcessing(false);
        setAbortController(null);
        if (err.name !== "CanceledError" && err.message !== "canceled") {
          toast.error("Document parsing failed: " + (err.message || "Unknown error"));
          setSelectedFile(null);
        }
      }
    });
  };

  const handleCancelUpload = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsProcessing(false);
    setSelectedFile(null);
    setAbortController(null);
    setUploadProgress(0);
    toast.info("Upload canceled by user");
  };

  const handleAppendClick = (pkg: Package) => {
    setUploadCategory(pkg.category as any);
    setUploadYear(pkg.year);
    setPackageIdToAppend(pkg.id);
    setSelectedFile(null);
    setShowValidationReport(false);
    setActiveTab("upload");
    toast.info(`Switched to Append Mode. Appending to: ${pkg.category} (${pkg.year})`);
  };

  const handlePublish = () => {
    if (!uploadReport || !uploadReport.package_id) return;
    
    publishPackageMutation.mutate(uploadReport.package_id, {
      onSuccess: () => {
        toast.success(`${uploadCategory} ${uploadYear} package successfully published!`);
        setShowPublishConfirm(false);
        setShowValidationReport(false);
        setSelectedFile(null);
        setUploadReport(null);
        
        refetchHistory();
        setSelectedCategory(uploadCategory);
        setSelectedYear(uploadYear);
        setActiveTab("browse");
      },
      onError: (err: any) => {
        toast.error("Failed to publish package: " + (err.message || "Unknown error"));
      }
    });
  };

  const handleRollback = (pkgId: string, category: string, year: number) => {
    rollbackPackageMutation.mutate(pkgId, {
      onSuccess: () => {
        toast.success(`Active package set to ${category} ${year}`);
        refetchHistory();
        setSelectedCategory(category as any);
        setSelectedYear(year);
        setActiveTab("browse");
      },
      onError: (err: any) => {
        toast.error("Failed to set active package: " + (err.message || "Unknown error"));
      }
    });
  };

  const handlePublishDraft = (pkgId: string, category: string, year: number) => {
    publishPackageMutation.mutate(pkgId, {
      onSuccess: () => {
        toast.success(`${category} ${year} package successfully published!`);
        refetchHistory();
        setSelectedCategory(category as any);
        setSelectedYear(year);
        setActiveTab("browse");
      },
      onError: (err: any) => {
        toast.error("Failed to publish package: " + (err.message || "Unknown error"));
      }
    });
  };

  const handleDeleteClick = (pkg: Package) => {
    setDeletingPackage(pkg);
  };

  const handleConfirmDelete = () => {
    if (!deletingPackage) return;
    deletePackageMutation.mutate(deletingPackage.id, {
      onSuccess: () => {
        toast.success("Package deleted successfully");
        setDeletingPackage(null);
        refetchHistory();
      },
      onError: (err: any) => {
        toast.error("Failed to delete package: " + (err.message || "Unknown error"));
        setDeletingPackage(null);
      }
    });
  };

  const handleStartEdit = (devo: APIDevotional) => {
    setEditingDevotional(devo);
    setEditTitle(devo.title);
    setEditScriptureReference(devo.scripture_reference);
    setEditScriptureQuote(devo.scripture_quote);
    setEditBody(devo.body);
    setEditPrayer(devo.prayer || "");
    setEditReflection(devo.reflection || "");
  };

  const handleSaveEdit = () => {
    if (!editingDevotional) return;
    
    updateDevotionalMutation.mutate({
      devotionalId: editingDevotional.id,
      data: {
        title: editTitle,
        scripture_reference: editScriptureReference,
        scripture_quote: editScriptureQuote,
        body: editBody,
        prayer: editPrayer,
        reflection: editReflection,
      }
    }, {
      onSuccess: () => {
        toast.success("Devotional updated successfully!");
        setEditingDevotional(null);
        if (previewDevotional && previewDevotional.id === editingDevotional.id) {
          setPreviewDevotional({
            ...previewDevotional,
            title: editTitle,
            scripture_reference: editScriptureReference,
            scripture_quote: editScriptureQuote,
            body: editBody,
            prayer: editPrayer,
            reflection: editReflection,
          });
        }
        refetchHistory();
      },
      onError: (err: any) => {
        toast.error("Failed to update devotional: " + (err.message || "Unknown error"));
      }
    });
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
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = currentYear - 2 + i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
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
          {isPackagesLoading || (isPackagesFetching && packages.length === 0) ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4 shadow-xs flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 text-base">Loading Devotionals...</h3>
                <p className="text-xs text-slate-400">Fetching {selectedCategory} ({selectedYear}) from server...</p>
              </div>
            </div>
          ) : allFilteredEntries.length === 0 ? (
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
                {paginatedEntries.map(({ entry, pkg }) => {
                  const needsAttention = !entry.title || entry.title.trim() === "" || !entry.body || entry.body.trim().length < 10;
                  return (
                    <div 
                      key={entry.id}
                      className="bg-white rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-slate-100 text-slate-700 text-xxs font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Day {entry.default_day}
                          </span>
                          {needsAttention ? (
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-sm inline-flex items-center gap-1 border border-red-100 animate-pulse">
                              <AlertCircle className="w-3 h-3" />
                              <span>Needs Attention</span>
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                              pkg.status.toLowerCase() === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              {pkg.status}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1 mt-1">{entry.title || "[No Title]"}</h3>
                        <p className="text-xs font-semibold text-slate-400 italic leading-snug">{entry.scripture_reference || "[No Scripture]"}</p>
                        <p className="text-xxs text-slate-500 line-clamp-2 leading-relaxed">{entry.scripture_quote || "[No Quote]"}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{Math.ceil((entry.body?.length || 1000) / 800)} min read</span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setPreviewDevotional(entry)}
                            className="text-xs font-bold text-orange-600 hover:text-orange-750 transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Preview...</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  disabled={isProcessing || showValidationReport || packageIdToAppend !== null}
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
                  disabled={isProcessing || showValidationReport || packageIdToAppend !== null}
                  onChange={(e) => setUploadYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500 disabled:opacity-60"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = currentYear + i;
                    let label = `${y}`;
                    if (y === currentYear) {
                      label = `${y} (Current Active)`;
                    } else if (y === currentYear + 1) {
                      label = `${y} (Next Year)`;
                    }
                    return (
                      <option key={y} value={y}>
                        {label}
                      </option>
                    );
                  })}
                </select>
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
                {selectedFile ? (
                  <div className="space-y-6 w-full max-w-md flex flex-col items-center">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                      <UploadCloud className="w-10 h-10 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-800 text-lg">Selected File</h3>
                      <p className="font-mono text-sm font-semibold text-slate-700 break-all">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400 font-semibold font-mono">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    
                    <div className="flex gap-4 w-full pt-2">
                      <label className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold tracking-wider transition-colors cursor-pointer text-center block">
                        Change File
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleFileUploadClick}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={handleProceedUpload}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        Proceed to Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl mb-4">
                      <UploadCloud className="w-10 h-10" />
                    </div>

                    <div className="space-y-1 mb-5">
                      {packageIdToAppend ? (
                        <>
                          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2 justify-center">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Append Part to Draft</span>
                          </h3>
                          <p className="text-xs font-semibold font-mono text-slate-650">
                            Target Draft: {uploadCategory} {uploadYear}
                          </p>
                          <button
                            onClick={() => {
                              setPackageIdToAppend(null);
                              toast.info("Returned to standard package upload");
                            }}
                            className="mt-2 text-xxs text-slate-400 hover:text-slate-600 underline font-bold tracking-wider uppercase cursor-pointer"
                          >
                            Cancel Append Mode
                          </button>
                        </>
                      ) : (
                        <>
                          <h3 className="font-extrabold text-slate-800 text-lg">Upload Devotion Document</h3>
                          <p className="text-xs text-slate-400">Drag and drop your devotion file here, or click to choose from directory</p>
                        </>
                      )}
                    </div>

                    <label className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-orange-600/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer block">
                      Choose Document (PDF/DOCX/DOC)
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileUploadClick}
                        className="hidden"
                      />
                    </label>

                    <div className="mt-8 grid grid-cols-3 gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6 w-full max-w-md">
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">Supported</span>
                        <span>PDF</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">Supported</span>
                        <span>DOCX / DOC</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 opacity-50">
                        <span>Future</span>
                        <span>EXCEL</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PROCESSING LOADER SCREEN */}
            {isProcessing && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-white space-y-5 min-h-[350px] flex flex-col justify-center items-center text-center font-sans">
                <div className="w-12 h-12 border-4 border-t-orange-500 border-slate-700 rounded-full animate-spin mb-2" />
                
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-orange-400">Uploading and Parsing Document...</h3>
                  <p className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">
                    Upload Progress: {uploadProgress}%
                  </p>
                </div>

                <div className="w-full max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-300 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <p className="text-xs text-slate-450 max-w-xs leading-normal">
                  {uploadProgress < 100 
                    ? "Sending document bytes to server. Do not close this tab." 
                    : "We are parsing the devotional chapters, extracting days, verifying scriptures, and preparing the database draft..."}
                </p>

                <button
                  onClick={handleCancelUpload}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold tracking-wide rounded-xl transition-colors cursor-pointer mt-2"
                >
                  Cancel Upload
                </button>
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
                {/* Status indicator banner */}
                {uploadReport?.is_valid ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Validation Completed Successfully</h4>
                      <p className="text-xs text-emerald-700/90 leading-normal mt-0.5">
                        This devotional package contains a complete set. It is formatted correctly and is ready to be published.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Document Parsing Warnings</h4>
                      <p className="text-xs text-amber-700/90 leading-normal mt-0.5">
                        We detected formatting or layout diagnostics in this file. Review the warning checklist. You can still publish if the count is correct.
                      </p>
                    </div>
                  </div>
                )}

                {/* Validation Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Entries Found</div>
                    <div className="text-xl font-mono font-extrabold text-slate-800 mt-0.5">
                      {uploadReport?.total_parsed ?? 0}
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Target Year</div>
                    <div className="text-xl font-mono font-extrabold text-slate-800 mt-0.5">
                      {uploadYear}
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Category</div>
                    <div className="text-[10px] font-extrabold text-slate-800 mt-1 truncate">
                      {uploadCategory}
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-md border border-slate-150">
                    <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Diagnostics</div>
                    <div className={`text-xl font-mono font-extrabold mt-0.5 ${uploadReport?.is_valid ? "text-emerald-600" : "text-amber-600"}`}>
                      {uploadReport?.issues?.length || 0} Warnings
                    </div>
                  </div>
                </div>

                {/* Diagnostic detailed issues */}
                {uploadReport?.issues && uploadReport.issues.length > 0 && (
                  <div className="border border-amber-100 rounded-xl overflow-hidden">
                    <div className="bg-amber-50/50 px-4 py-2 border-b border-amber-100 text-xxs font-bold text-amber-800 uppercase tracking-wider">
                      Document Processing Warnings
                    </div>
                    <div className="p-4 space-y-3 text-xs leading-normal max-h-[160px] overflow-y-auto font-mono">
                      {uploadReport.issues.map((issue: any, idx: number) => {
                        const label = issue.day_of_year > 0
                          ? `Day ${issue.day_of_year} (${issue.date_text}): ${issue.message}`
                          : issue.message;
                        return (
                          <div key={idx} className="flex gap-2 text-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
                  <button
                    onClick={() => {
                      setShowValidationReport(false);
                      setSelectedFile(null);
                      setUploadReport(null);
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold tracking-wide cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowPublishConfirm(true)}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold tracking-wide cursor-pointer shadow-md shadow-orange-600/10"
                  >
                    Publish Package
                  </button>
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
                {packages.map((pkg: Package) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800 font-sans">
                      {pkg.category} (<span className="font-mono text-slate-500 font-semibold">{pkg.year}</span>)
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-600">
                      {pkg.devotionals?.length ?? 0} Days
                    </td>
                    <td className="px-6 py-4">
                      {pkg.status.toLowerCase() === "published" ? (
                        <span className="bg-emerald-50 text-emerald-700 text-xxs font-bold px-2 py-0.5 rounded-sm inline-flex items-center gap-1 border border-emerald-150">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span>Active / Published</span>
                        </span>
                      ) : pkg.status.toLowerCase() === "draft" ? (
                        <span className="bg-amber-50 text-amber-600 text-xxs font-semibold px-2 py-0.5 rounded-sm border border-amber-150">
                          Draft
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-xxs font-semibold px-2 py-0.5 rounded-sm border border-slate-150">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {moment(pkg.uploaded_at).format("MMM DD, YYYY")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {pkg.status.toLowerCase() !== "published" ? (
                          <>
                            {pkg.status.toLowerCase() === "archived" && (
                              <button
                                onClick={() => handleRollback(pkg.id, pkg.category, pkg.year)}
                                title="Rollback / Set Active"
                                className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold px-2.5 py-1.5 rounded-lg border border-orange-100 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Set Active</span>
                              </button>
                            )}
                            {pkg.status.toLowerCase() === "draft" && (
                              <>
                                <button
                                  onClick={() => handlePublishDraft(pkg.id, pkg.category, pkg.year)}
                                  title="Publish Draft"
                                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold px-2.5 py-1.5 rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Publish</span>
                                </button>
                                <button
                                  onClick={() => handleAppendClick(pkg)}
                                  title="Append split part/file to this draft package"
                                  className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold px-2.5 py-1.5 rounded-lg border border-amber-100 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Append Part</span>
                                </button>
                              </>
                            )}
                             <button
                              onClick={() => handleDeleteClick(pkg)}
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
                  Day {previewDevotional.default_day}
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
                  Scripture Reading: {previewDevotional.scripture_reference}
                </div>
                <div className="text-slate-800 font-semibold italic text-sm">
                  "{previewDevotional.scripture_quote}"
                </div>
              </div>

              {/* Devotional Body */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</h4>
                {(typeof previewDevotional.body === "string" ? previewDevotional.body.split("\n\n") : []).map((p: string, i: number) => (
                  <p key={i} className="text-slate-650 text-justify">{p}</p>
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
                <ul className="list-disc pl-5 space-y-1.5 text-slate-650">
                  {(typeof previewDevotional.action_points === "string" ? JSON.parse(previewDevotional.action_points || "[]") : []).map((ap: string, i: number) => (
                    <li key={i}>{ap}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPreviewDevotional(null);
                  handleStartEdit(previewDevotional);
                }}
                className="px-5 py-2 border border-slate-205 text-slate-700 font-semibold text-xs tracking-wide rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Edit
              </button>
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
          MODAL 3: DEVOTIONAL ENTRY EDIT MODAL
          ======================================================== */}
      {editingDevotional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Day {editingDevotional.default_day}
                </span>
                <h3 className="font-extrabold text-md mt-1 leading-snug">Edit Devotional Entry</h3>
              </div>
              <button
                onClick={() => setEditingDevotional(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin text-slate-700 text-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Scripture Reference</label>
                  <input
                    type="text"
                    value={editScriptureReference}
                    onChange={(e) => setEditScriptureReference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Scripture Quote</label>
                  <input
                    type="text"
                    value={editScriptureQuote}
                    onChange={(e) => setEditScriptureQuote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Message Body</label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-normal focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Prayer Point</label>
                <textarea
                  rows={2}
                  value={editPrayer}
                  onChange={(e) => setEditPrayer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-normal focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reflection</label>
                <textarea
                  rows={2}
                  value={editReflection}
                  onChange={(e) => setEditReflection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-normal focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingDevotional(null)}
                className="px-5 py-2 border border-slate-200 text-slate-600 font-semibold text-xs tracking-wide rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateDevotionalMutation.isPending}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs tracking-wide rounded-lg transition-colors cursor-pointer shadow-md shadow-orange-600/10 disabled:opacity-50"
              >
                {updateDevotionalMutation.isPending ? "Saving..." : "Save Changes"}
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

      {/* ========================================================
          MODAL 4: DELETE PACKAGE CONFIRMATION
          ======================================================== */}
      {deletingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 font-sans text-left">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-lg font-sans">Delete Devotional Package?</h3>
              <p className="text-xs text-slate-400 leading-normal font-sans">
                Are you sure you want to permanently delete the <strong>{deletingPackage.category} ({deletingPackage.year})</strong> package?
              </p>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-xl p-3.5 flex gap-2 text-red-800 text-xs leading-normal font-sans">
              <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> This will permanently erase the package metadata, all <strong>{deletingPackage.devotionals?.length ?? 365} devotionals</strong>, schedules, reads, and user bookmarks associated with it. This action cannot be undone.
              </span>
            </div>

            <div className="flex gap-3 justify-end pt-2 font-sans">
              <button
                onClick={() => setDeletingPackage(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-semibold tracking-wide cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletePackageMutation.isPending}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold tracking-wide cursor-pointer shadow-md shadow-red-600/10 disabled:opacity-50"
              >
                {deletePackageMutation.isPending ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
