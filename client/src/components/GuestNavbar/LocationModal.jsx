import { createPortal } from 'react-dom';

const LocationModal = ({ isOpen, onClose, onUseGps, onSelectShoprite }) => {
  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Choose Location</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <button
            type="button"
            onClick={onUseGps}
            className="group flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-blue-500 hover:bg-slate-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-600 group-hover:text-white">
              📍
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Use My Current Location</p>
              <p className="text-xs text-slate-400">Enable GPS</p>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Or Select Campus</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSelectShoprite}
            className="group flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-purple-500 hover:bg-slate-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 transition group-hover:bg-purple-600 group-hover:text-white">
              🛍️
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Shoprite (Kano)</p>
              <p className="text-xs text-slate-400">Ado Bayero Mall</p>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationModal;
