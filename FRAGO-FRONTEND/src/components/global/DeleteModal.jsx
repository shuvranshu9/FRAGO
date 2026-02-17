import React from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  title,
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <Trash2 size={24} />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            {title || "Confirm Delete"}
          </h2>
          <p className="text-gray-500 leading-relaxed">
            {description || (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{itemName}"
                </span>
                ? This action cannot be undone.
              </>
            )}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 border border-gray-200 rounded-full font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
