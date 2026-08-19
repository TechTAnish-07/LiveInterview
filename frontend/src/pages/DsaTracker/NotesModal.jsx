import React, { useState, useEffect } from "react";
import { X, Save, FileText, Check } from "lucide-react";

const NotesModal = ({ isOpen, onClose, question, onSave }) => {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (question) {
      setNotes(question.notes || "");
      setSavedSuccess(false);
    }
  }, [question, isOpen]);

  if (!isOpen || !question) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(question.id, notes);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Personal Notes & Insights</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{question.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <label className="block text-xs font-medium text-slate-600">
            Write your approaches, edge cases, time/space complexity notes, or key takeaways:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Approach: Two-pointer technique. Time: O(N), Space: O(1). Remember to handle empty array edge case..."
            rows={7}
            className="w-full text-xs font-sans p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#070235]/20 focus:border-[#070235] resize-y leading-relaxed text-slate-800 placeholder-slate-400 bg-slate-50/50"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {notes.length} characters
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#070235] hover:bg-[#150f55] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved!
                </>
              ) : saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
