import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  selectFeedback, 
  markAsRead, 
  deleteFeedback,
  FeedbackEntry 
} from "../state/slices/feedbackSlice";
import { MessageSquare, Mail, Calendar, Check, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function FeedbackView() {
  const dispatch = useDispatch();
  const feedbackList = useSelector(selectFeedback);

  // Modal active entry
  const [selectedEntry, setSelectedEntry] = useState<FeedbackEntry | null>(null);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead({ id }));
    toast.success("Feedback marked as read");
    // Update the selected entry modal view too
    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry({
        ...selectedEntry,
        status: "Read"
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete feedback from ${name}?`)) {
      dispatch(deleteFeedback({ id }));
      toast.success("Feedback deleted");
      setSelectedEntry(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Heading */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-5 w-full">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Congregation Feedback</h1>
        <p className="text-xs text-slate-500">Read inquiries, review app testimonials, and handle notifications troubleshooting logs</p>
      </div>

      {/* Feedback Table */}
      {feedbackList.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-700 text-lg">No Feedback Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You've cleared all feedback inquiries. Excellent job maintaining contact channels!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Message Segment</th>
                  <th className="px-6 py-4">Date Recieved</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {feedbackList.map((entry: FeedbackEntry) => {
                  const isUnread = entry.status === "Unread";

                  return (
                    <tr 
                      key={entry.id} 
                      onClick={() => setSelectedEntry(entry)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                        isUnread ? "bg-orange-50/20 font-bold" : ""
                      }`}
                    >
                      {/* Sender */}
                      <td className="px-6 py-4 max-w-[200px] truncate">
                        <div className="flex flex-col gap-0.5">
                          <span className={isUnread ? "text-slate-900 font-extrabold text-sm" : "text-slate-800 font-bold"}>
                            {entry.name}
                          </span>
                          <span className="text-[10px] text-slate-450 font-mono truncate">{entry.email}</span>
                        </div>
                      </td>

                      {/* Message preview */}
                      <td className="px-6 py-4 max-w-[320px] truncate">
                        <span className={isUnread ? "text-slate-800 font-semibold" : "text-slate-500 font-medium"}>
                          {entry.message}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-400 font-mono whitespace-nowrap">{entry.date}</td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isUnread ? (
                          <span className="bg-orange-50 text-orange-700 text-xxs font-bold px-2 py-0.5 rounded-none inline-flex items-center gap-1 border border-orange-150">
                            <span className="w-1 h-1 bg-orange-500" />
                            <span>Unread</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-xxs font-semibold px-2 py-0.5 rounded-sm border border-slate-150">
                            Read
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(entry.id)}
                              title="Mark Read"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(entry.id, entry.name)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          FEEDBACK DETAIL MODAL
          ======================================================== */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Message Detail</span>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 text-slate-700 text-sm leading-relaxed">
              {/* Sender Details Card */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-md space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{selectedEntry.name}</h3>
                    <span className="text-xs text-slate-500 font-mono inline-flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedEntry.email}</span>
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-slate-500 font-mono inline-flex items-center gap-1 bg-slate-200/50 px-2 py-0.5 rounded-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{selectedEntry.date}</span>
                  </span>
                </div>
              </div>

              {/* Message text */}
              <div className="space-y-1">
                <h4 className="text-xxs font-bold text-slate-400 uppercase tracking-widest block">Message Body</h4>
                <p className="text-slate-650 bg-slate-50/50 border border-slate-100 rounded-xl p-4 min-h-[100px] text-justify whitespace-pre-wrap">
                  {selectedEntry.message}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div>
                <button
                  onClick={() => handleDelete(selectedEntry.id, selectedEntry.name)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-750 font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="flex gap-2">
                {selectedEntry.status === "Unread" && (
                  <button
                    onClick={() => handleMarkAsRead(selectedEntry.id)}
                    className="inline-flex items-center gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-md shadow-orange-600/10 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as Read</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold tracking-wide cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
