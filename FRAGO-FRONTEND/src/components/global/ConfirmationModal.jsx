import { X, AlertCircle } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = <AlertCircle size={24} />,
  confirmColor = "bg-green-900",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div
            className={`w-12 h-12 ${confirmColor.replace("bg-", "bg-").replace("-600", "-50").replace("-900", "-50")} rounded-2xl flex items-center justify-center ${confirmColor.replace("bg-", "text-")}`}
          >
            {icon}
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
            {title}
          </h2>
          <div className="text-gray-500 leading-relaxed">{description}</div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 border border-gray-200 rounded-full font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 ${confirmColor} text-white rounded-full font-bold hover:opacity-90 transition-all shadow-lg active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
