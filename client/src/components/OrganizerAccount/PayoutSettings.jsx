import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';

const INITIAL_FORM = {
  bankCode: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  splitPercentage: 10,
};

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.localStorage.getItem('token') || '';
};

const PayoutSettings = () => {
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const token = useMemo(() => getStoredToken(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchBanks = async () => {
      if (!token) {
        return;
      }

      setLoadingBanks(true);

      try {
        const { data } = await api.get('/paystack/banks', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setBanks(Array.isArray(data?.banks) ? data.banks : []);
        }
      } catch (error) {
        if (isMounted) {
          const message = error?.response?.data?.message || 'Unable to load banks.';
          setStatus({ type: 'error', message });
        }
      } finally {
        if (isMounted) {
          setLoadingBanks(false);
        }
      }
    };

    fetchBanks();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleFieldChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      setForm((prev) => {
        const next = { ...prev, [name]: value };

        if (name === 'bankCode') {
          const selected = banks.find((bank) => bank.code === value);
          next.bankName = selected?.name || '';
          next.accountNumber = '';
          next.accountName = '';
        }

        if (name === 'accountNumber') {
          next.accountName = '';
        }

        return next;
      });

      if (name === 'bankCode' || name === 'accountNumber') {
        setStatus({ type: '', message: '' });
      }
    },
    [banks]
  );

  const handleAccountBlur = useCallback(async () => {
    const trimmedAccount = form.accountNumber.trim();

    if (!form.bankCode || trimmedAccount.length !== 10) {
      return;
    }

    setResolvingAccount(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await api.post(
        '/paystack/resolve-account',
        {
          bankCode: form.bankCode,
          accountNumber: trimmedAccount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setForm((prev) => ({
        ...prev,
        accountName: data?.accountName || '',
        bankName: data?.bankName || prev.bankName,
      }));
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to resolve this account number.';
      setStatus({ type: 'error', message });
      setForm((prev) => ({ ...prev, accountName: '' }));
    } finally {
      setResolvingAccount(false);
    }
  }, [form.accountNumber, form.bankCode, token]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!form.bankCode || !form.accountNumber || !form.accountName) {
        setStatus({ type: 'error', message: 'Complete bank, account number, and resolved name.' });
        return;
      }

      setSubmitting(true);
      setStatus({ type: '', message: '' });

      try {
        await api.post(
          '/payouts/create',
          {
            bankCode: form.bankCode,
            bankName: form.bankName,
            accountNumber: form.accountNumber.trim(),
            accountName: form.accountName,
            splitPercentage: form.splitPercentage,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStatus({ type: 'success', message: 'Payout account saved.' });
      } catch (error) {
        const message = error?.response?.data?.message || 'Unable to save payout account.';
        setStatus({ type: 'error', message });
      } finally {
        setSubmitting(false);
      }
    },
    [form, token]
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:shadow-[0_18px_60px_rgba(8,12,24,0.55)]">
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payout / Bank Details</h2>
        <p className="text-sm text-slate-500 dark:text-white/60">
          Connect your Paystack subaccount to receive settlements.
        </p>
      </header>

      {status.message && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            status.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100'
          }`}
        >
          {status.message}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Bank</label>
          <div className="relative">
            <select
              name="bankCode"
              value={form.bankCode}
              onChange={handleFieldChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
              disabled={loadingBanks}
            >
              <option value="">{loadingBanks ? 'Loading banks…' : 'Select a bank'}</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            {loadingBanks && (
              <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-slate-400 dark:text-white/60" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Account number</label>
          <input
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleFieldChange}
            onBlur={handleAccountBlur}
            maxLength={10}
            inputMode="numeric"
            placeholder="0123456789"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
          />
          <p className="text-xs text-slate-500 dark:text-white/45">
            We will auto-fill the account name after verifying with Paystack.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Account name</label>
          <div className="relative">
            <input
              name="accountName"
              value={form.accountName}
              readOnly
              className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-white/30"
              placeholder={resolvingAccount ? 'Resolving…' : 'Resolved account name'}
            />
            {resolvingAccount && (
              <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-slate-400 dark:text-white/60" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Split percentage</label>
          <input
            name="splitPercentage"
            type="number"
            min={0}
            max={100}
            value={form.splitPercentage}
            onChange={handleFieldChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
          />
          <p className="text-xs text-slate-500 dark:text-white/45">
            Default is 10% (Paystack's percentage_charge field).
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || resolvingAccount}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save payout account
        </button>
      </form>
    </section>
  );
};

export default PayoutSettings;
