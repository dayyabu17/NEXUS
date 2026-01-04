import React, { useEffect, useRef, useState } from 'react';

const TitleEditor = ({ value, onSave, onCancel }) => {
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(draft.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="event-title-input" className="block text-sm font-medium text-slate-900 dark:text-white/70">
          Event name
        </label>
        <input
          id="event-title-input"
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Give your event a standout name"
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-[#161b27] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/15 dark:text-white/70 dark:hover:border-white/35 dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default TitleEditor;
