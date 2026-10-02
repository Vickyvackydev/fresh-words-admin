import { useState, useMemo } from "react";
import { 
  Search, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Trash2, 
  BookOpen, 
  Plus, 
  Loader2,
  Music
} from "lucide-react";
import toast from "../components/CustomToast";
import { 
  useHymnsList, 
  useCreateHymn, 
  useUpdateHymn, 
  useDeleteHymn, 
  useBulkUploadHymns 
} from "../api/hooks";
import { Hymn } from "../api/services";

function formatKey(key: string | undefined): string {
  if (!key) return "";
  return key.replace(/^(?:key\s*:\s*)+/i, "").trim();
}

function stripLeadingVerseNumber(verse: string): string {
  if (!verse) return "";
  return verse.replace(/^\s*\d+[\.\:\)\-]+\s*/, "").trim();
}

function getVersesArray(verses: string | string[] | undefined): string[] {
  if (!verses || verses === "null") return [];
  let list: string[] = [];
  if (Array.isArray(verses)) {
    list = verses.filter((v) => typeof v === "string" && v.trim() !== "" && v !== "null");
  } else {
    try {
      const parsed = JSON.parse(verses);
      if (Array.isArray(parsed)) {
        list = parsed.filter((v: any) => typeof v === "string" && v.trim() !== "" && v !== "null");
      } else if (verses !== "null" && verses !== '""') {
        list = [verses];
      }
    } catch {
      if (verses !== "null" && verses !== '""') {
        list = [verses];
      }
    }
  }
  return list.map(stripLeadingVerseNumber);
}

export default function HymnsView() {
  // Queries & Mutations
  const { data, isLoading, isFetching, refetch } = useHymnsList();
  const hymns: Hymn[] = useMemo(() => data?.items || [], [data]);

  const createHymnMutation = useCreateHymn();
  const updateHymnMutation = useUpdateHymn();
  const deleteHymnMutation = useDeleteHymn();
  const bulkUploadMutation = useBulkUploadHymns();

  // Navigation Tabs: 'browse' | 'upload'
  const [activeTab, setActiveTab] = useState<"browse" | "upload">("browse");

  // Search & Filter (No category filter per design instructions)
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 12;

  // Preview Modal State
  const [previewHymn, setPreviewHymn] = useState<Hymn | null>(null);

  // Edit / Create Modal States
  const [editingHymn, setEditingHymn] = useState<Hymn | null>(null);
  const [isCreatingHymn, setIsCreatingHymn] = useState(false);
  const [formNumber, setFormNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formChorus, setFormChorus] = useState("");
  const [formVersesText, setFormVersesText] = useState("");

  // Delete Confirm State
  const [deletingHymn, setDeletingHymn] = useState<Hymn | null>(null);

  // Upload Tab States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadReport, setUploadReport] = useState<any>(null);

  // Filter entries based on search
  const filteredHymns = useMemo(() => {
    return hymns.filter((hymn: Hymn) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const matchesNum = hymn.number.toString().includes(q);
      const matchesTitle = hymn.title?.toLowerCase().includes(q);
      const matchesAuthor = hymn.author?.toLowerCase().includes(q);
      const matchesChorus = hymn.chorus?.toLowerCase().includes(q);
      const versesArr = getVersesArray(hymn.verses);
      const matchesVerse = versesArr.some((v: string) => v.toLowerCase().includes(q));
      return matchesNum || matchesTitle || matchesAuthor || matchesChorus || matchesVerse;
    });
  }, [hymns, searchTerm]);

  // Paginated Entries
  const totalPages = Math.ceil(filteredHymns.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedEntries = filteredHymns.slice(startIndex, startIndex + entriesPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Open Edit Modal
  const handleStartEdit = (hymn: Hymn) => {
    setEditingHymn(hymn);
    setIsCreatingHymn(false);
    setFormNumber(hymn.number);
    setFormTitle(hymn.title);
    setFormAuthor(hymn.author || "");
    setFormKey(formatKey(hymn.key || ""));
    setFormChorus(hymn.chorus || "");
    const versesArr = getVersesArray(hymn.verses);
    setFormVersesText(versesArr.join("\n\n---\n\n"));
  };

  // Open Create Modal
  const handleStartCreate = () => {
    const nextNum = hymns.length > 0 ? Math.max(...hymns.map((h: Hymn) => h.number)) + 1 : 1;
    setEditingHymn(null);
    setIsCreatingHymn(true);
    setFormNumber(nextNum);
    setFormTitle("");
    setFormAuthor("");
    setFormKey("");
    setFormChorus("");
    setFormVersesText("");
  };

  // Save Edit / Create
  const handleSaveForm = () => {
    if (!formTitle.trim()) {
      toast.error("Please enter a hymn title.");
      return;
    }

    const verses = formVersesText
      .split(/\n\n---\n\n|\n\n\n+/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const payload = {
      number: Number(formNumber),
      title: formTitle.trim(),
      author: formAuthor.trim(),
      key: formKey.trim(),
      chorus: formChorus.trim(),
      verses: verses.length > 0 ? verses : [formVersesText.trim()],
    };

    if (isCreatingHymn) {
      createHymnMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Hymn created successfully!");
          setIsCreatingHymn(false);
          refetch();
        },
        onError: (err: any) => {
          toast.error("Failed to create hymn: " + (err.message || "Unknown error"));
        },
      });
    } else if (editingHymn) {
      updateHymnMutation.mutate(
        { id: editingHymn.id, data: payload },
        {
          onSuccess: (updated: Hymn) => {
            toast.success("Hymn updated successfully!");
            setEditingHymn(null);
            if (previewHymn && previewHymn.id === editingHymn.id) {
              setPreviewHymn(updated);
            }
            refetch();
          },
          onError: (err: any) => {
            toast.error("Failed to update hymn: " + (err.message || "Unknown error"));
          },
        }
      );
    }
  };

  // Delete Hymn
  const handleConfirmDelete = () => {
    if (!deletingHymn) return;
    deleteHymnMutation.mutate(deletingHymn.id, {
      onSuccess: () => {
        toast.success(`Hymn #${deletingHymn.number} deleted successfully.`);
        setDeletingHymn(null);
        if (previewHymn?.id === deletingHymn.id) setPreviewHymn(null);
        refetch();
      },
      onError: (err: any) => {
        toast.error("Failed to delete hymn: " + (err.message || "Unknown error"));
        setDeletingHymn(null);
      },
    });
  };

  // File Upload Handlers (identical to Devotions)
  const handleFileUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "docx" && ext !== "txt" && ext !== "json") {
        toast.error("Please upload DOCX, TXT, or JSON hymnal files only.");
        return;
      }
      setSelectedFile(file);
      setUploadReport(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "docx" && ext !== "txt" && ext !== "json") {
        toast.error("Please upload DOCX, TXT, or JSON hymnal files only.");
        return;
      }
      setSelectedFile(file);
      setUploadReport(null);
    }
  };

  const handleProceedUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsProcessing(true);
    setUploadProgress(20);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    bulkUploadMutation.mutate(selectedFile, {
      onSuccess: (data: any) => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => {
          setIsProcessing(false);
          setUploadReport(data);
          toast.success(`Hymnal uploaded! Parsed ${data.count || 0} hymns.`);
          setSelectedFile(null);
          refetch();
        }, 400);
      },
      onError: (err: any) => {
        clearInterval(progressInterval);
        setIsProcessing(false);
        toast.error("Failed to parse hymnal: " + (err.message || "Unknown error"));
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Hymn Heading & Tabs (Exact Devotions Styling) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 w-full">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hymn Library</h1>
          <p className="text-xs text-slate-500">
            Upload hymnal documents, inspect hymns, and manage church hymnal entries
          </p>
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
            <span>Browse Hymns</span>
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
            <span>Upload Hymn</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: BROWSE HYMNS
          ======================================================== */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Action & Search Bar */}
          <div className="bg-white p-5 rounded-xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search by hymn number, title, author, lyrics..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-orange-600" />
                  <span>Upload Document</span>
                </button>
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Hymn</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hymns List / Loader / Empty State */}
          {isLoading || (isFetching && hymns.length === 0) ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4 shadow-xs flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 text-base">Loading Hymns...</h3>
                <p className="text-xs text-slate-400">Fetching hymns from server...</p>
              </div>
            </div>
          ) : filteredHymns.length === 0 ? (
            /* Devotional-Style Empty State */
            <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 text-lg">No Hymns Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchTerm
                    ? `We couldn't find any hymns matching "${searchTerm}". Try searching by hymn number or another keyword.`
                    : "No hymns have been uploaded yet. Upload your church hymnal document or create a new hymn to populate the hymnal."}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Hymnal Document</span>
                </button>
                <button
                  onClick={handleStartCreate}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Manually</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Entries Grid (Exact Devotional Cards Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedEntries.map((entry: Hymn) => {
                  const versesArr = getVersesArray(entry.verses);
                  const firstVersePreview =
                    versesArr.length > 0 && versesArr[0] !== "null"
                      ? versesArr[0].split("\n")[0]
                      : entry.chorus && entry.chorus !== "null"
                      ? entry.chorus.split("\n")[0]
                      : "";

                  return (
                    <div
                      key={entry.id}
                      className="bg-white rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Top row with Hymn # and Key */}
                        <div className="flex items-center justify-between">
                          <span className="bg-slate-100 text-slate-700 text-xxs font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Hymn #{entry.number}
                          </span>
                          {entry.key ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                              Key: {formatKey(entry.key)}
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                              Published
                            </span>
                          )}
                        </div>

                        {/* Title & Author */}
                        <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1 mt-1">
                          {entry.title || "[No Title]"}
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 italic leading-snug">
                          {entry.author ? `By ${entry.author}` : "Traditional Hymn"}
                        </p>

                        {/* First verse or chorus snippet */}
                        <p className="text-xxs text-slate-500 line-clamp-2 leading-relaxed">
                          {firstVersePreview ? `"${firstVersePreview}"` : "[No Verse Text]"}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <Music className="w-3 h-3 text-orange-500" />
                          <span>{versesArr.length} stanzas</span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setPreviewHymn(entry)}
                            className="text-xs font-bold text-orange-600 hover:text-orange-750 transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Preview...</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingHymn(entry)}
                            className="p-1 text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Hymn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls (Exact Devotions Styling) */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl shadow-xs">
                  <span className="text-xs text-slate-500">
                    Showing <strong className="font-semibold">{startIndex + 1}</strong> -{" "}
                    <strong className="font-semibold">
                      {Math.min(startIndex + entriesPerPage, filteredHymns.length)}
                    </strong>{" "}
                    of <strong className="font-semibold">{filteredHymns.length}</strong> hymns
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
                      if (
                        totalPages > 6 &&
                        Math.abs(currentPage - pageNum) > 2 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return (
                            <span key={pageNum} className="text-slate-300 text-xs">
                              ...
                            </span>
                          );
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
          TAB 2: UPLOAD HYMNAL (Exact Devotions Upload Portal)
          ======================================================== */}
      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Settings / Guidelines */}
          <div className="bg-white rounded-xl p-6 shadow-xs space-y-6 lg:col-span-1">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-md">Hymnal Upload Configuration</h3>
              <p className="text-xs text-slate-400">
                Upload church hymnal documents to automatically parse and populate hymns
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Supported File Types
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span><strong>.docx</strong> (Word document with headings & lyrics)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span><strong>.txt</strong> (Plain text with numbered hymn entries)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span><strong>.json</strong> (Structured hymnal export format)</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Auto-Numbering & Sync</span>
                </h4>
                <p className="text-xxs text-orange-950 leading-relaxed">
                  The parser extracts hymn numbers, titles, tunes, stanzas, and choruses. Uploaded hymns are instantly available to all mobile app users through background sync.
                </p>
              </div>

              {/* Quick stats */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Current Active Hymns:</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{hymns.length}</span>
              </div>
            </div>
          </div>

          {/* Upload Dropzone Portal */}
          <div className="lg:col-span-2 space-y-6">
            {!isProcessing && !uploadReport && (
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
                      <p className="font-mono text-sm font-semibold text-slate-700 break-all">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold font-mono">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <div className="flex gap-4 w-full pt-2">
                      <label className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold tracking-wider transition-colors cursor-pointer text-center block">
                        Change File
                        <input
                          type="file"
                          accept=".docx,.txt,.json"
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
                      <h3 className="font-extrabold text-slate-800 text-lg">
                        Upload Hymnal Document
                      </h3>
                      <p className="text-xs text-slate-400">
                        Drag and drop your hymnal document here, or click to choose from directory
                      </p>
                    </div>

                    <label className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-orange-600/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer block">
                      Choose Document (DOCX / TXT / JSON)
                      <input
                        type="file"
                        accept=".docx,.txt,.json"
                        onChange={handleFileUploadClick}
                        className="hidden"
                      />
                    </label>

                    <div className="mt-8 grid grid-cols-3 gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6 w-full max-w-md">
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                          Supported
                        </span>
                        <span>DOCX</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                          Supported
                        </span>
                        <span>TXT</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                          Supported
                        </span>
                        <span>JSON</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PROCESSING LOADER SCREEN (Exact Devotions Processing Screen) */}
            {isProcessing && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-white space-y-5 min-h-[350px] flex flex-col justify-center items-center text-center font-sans">
                <div className="w-12 h-12 border-4 border-t-orange-500 border-slate-700 rounded-full animate-spin mb-2" />

                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-orange-400">
                    Uploading and Parsing Hymnal Document...
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Upload Progress: {uploadProgress}%
                  </p>
                </div>

                <div className="w-full max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400 max-w-xs leading-normal">
                  Extracting hymns, numbers, tunes, and stanzas from document...
                </p>
              </div>
            )}

            {/* UPLOAD REPORT / SUCCESS SUMMARY */}
            {uploadReport && (
              <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      Hymnal Upload Completed Successfully!
                    </h3>
                    <p className="text-xs text-slate-400">
                      Parsed and synchronized {uploadReport.count || 0} hymns
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => {
                      setUploadReport(null);
                      setActiveTab("browse");
                    }}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                  >
                    View in Browse Hymns
                  </button>
                  <button
                    onClick={() => {
                      setUploadReport(null);
                      setSelectedFile(null);
                    }}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Upload Another File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: HYMN ENTRY PREVIEW MODAL (Exact Devotions Styling)
          ======================================================== */}
      {previewHymn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="bg-orange-600 text-white text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Hymn #{previewHymn.number}
                </span>
                <h3 className="font-extrabold text-md mt-1 leading-snug">{previewHymn.title}</h3>
              </div>
              <button
                onClick={() => setPreviewHymn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin text-slate-700 leading-relaxed text-sm">
              {/* Hymn Info Header Bar */}
              <div className="bg-orange-50/50 border-l-4 border-orange-500 p-4 rounded-r-xl flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-orange-600 uppercase tracking-wider mb-1">
                    {previewHymn.author ? `Author: ${previewHymn.author}` : "Traditional Hymn"}
                  </div>
                  {previewHymn.key && (
                    <div className="text-slate-800 font-semibold text-xs">
                      Key: {formatKey(previewHymn.key)}
                    </div>
                  )}
                </div>
                <div className="text-xxs font-mono text-slate-400 font-bold uppercase">
                  {getVersesArray(previewHymn.verses).length} Stanzas
                </div>
              </div>

              {/* Verses & Stanzas */}
              <div className="space-y-5">
                {getVersesArray(previewHymn.verses).map((verse: string, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed flex-1">
                        {verse}
                      </p>
                    </div>

                    {/* Chorus after 1st verse */}
                    {index === 0 && previewHymn.chorus && (
                      <div className="bg-slate-50 border-l-4 border-orange-400 p-4 rounded-r-xl ml-9 my-3">
                        <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1.5">
                          Chorus / Refrain
                        </h4>
                        <p className="text-slate-700 italic whitespace-pre-line text-sm leading-relaxed">
                          {previewHymn.chorus}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* If there was a chorus but verses were empty */}
                {getVersesArray(previewHymn.verses).length === 0 && previewHymn.chorus && (
                  <div className="bg-slate-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1.5">
                      Chorus / Refrain
                    </h4>
                    <p className="text-slate-700 italic whitespace-pre-line text-sm leading-relaxed">
                      {previewHymn.chorus}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  const h = previewHymn;
                  setPreviewHymn(null);
                  handleStartEdit(h);
                }}
                className="px-5 py-2 border border-slate-200 text-slate-700 font-semibold text-xs tracking-wide rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => setPreviewHymn(null)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold text-xs tracking-wide rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT / CREATE HYMN MODAL
          ======================================================== */}
      {(editingHymn || isCreatingHymn) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="bg-orange-600 text-white text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {isCreatingHymn ? "Add New Hymn" : `Edit Hymn #${formNumber}`}
                </span>
                <h3 className="font-extrabold text-md mt-1 leading-snug">
                  {formTitle || (isCreatingHymn ? "Untitled Hymn" : "Edit Hymn")}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingHymn(null);
                  setIsCreatingHymn(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Hymn Number *
                  </label>
                  <input
                    type="number"
                    value={formNumber}
                    onChange={(e) => setFormNumber(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Hymn Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Great Is Thy Faithfulness"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Author / Composer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Thomas O. Chisholm"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Key / Tune
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. D Major / FAITHFULNESS"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Chorus / Refrain (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter chorus or refrain lyrics..."
                  value={formChorus}
                  onChange={(e) => setFormChorus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Stanzas / Verses (Separate stanzas with --- or triple newlines)
                </label>
                <textarea
                  rows={8}
                  placeholder="Great is Thy faithfulness, O God my Father...&#10;&#10;---&#10;&#10;Summer and winter, and springtime and harvest..."
                  value={formVersesText}
                  onChange={(e) => setFormVersesText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingHymn(null);
                  setIsCreatingHymn(false);
                }}
                className="px-5 py-2 border border-slate-200 text-slate-700 font-semibold text-xs tracking-wide rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                disabled={createHymnMutation.isPending || updateHymnMutation.isPending}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs tracking-wide rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {(createHymnMutation.isPending || updateHymnMutation.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>{isCreatingHymn ? "Create Hymn" : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: DELETE CONFIRMATION MODAL
          ======================================================== */}
      {deletingHymn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Delete Hymn #{deletingHymn.number}?</h3>
                <p className="text-xs text-slate-400">"{deletingHymn.title}"</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove this hymn from the hymnal library? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingHymn(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteHymnMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteHymnMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Hymn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
