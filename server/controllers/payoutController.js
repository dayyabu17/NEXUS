const axios = require('axios');
const asyncHandler = require('express-async-handler');
const PayoutAccount = require('../models/PayoutAccount');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Simple in-memory cache for banks to reduce external calls
let banksCache = {
  data: null,
  fetchedAt: 0,
};
const BANKS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const getSecretKey = () => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is not configured.');
  }
  return process.env.PAYSTACK_SECRET_KEY;
};

const fetchPaystackBanks = asyncHandler(async (_req, res) => {
  const secret = getSecretKey();

  const now = Date.now();
  const isCacheFresh = banksCache.data && now - banksCache.fetchedAt < BANKS_CACHE_TTL_MS;

  if (isCacheFresh) {
    return res.json({ success: true, banks: banksCache.data });
  }

  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
      headers: { Authorization: `Bearer ${secret}` },
      params: { country: 'nigeria' },
      timeout: 10000,
    });

    const banks = Array.isArray(response.data?.data)
      ? response.data.data.map((bank) => ({
          name: bank.name,
          code: bank.code,
          slug: bank.slug,
        }))
      : [];

    banksCache = { data: banks, fetchedAt: now };
    return res.json({ success: true, banks });
  } catch (error) {
    const status = error.response?.status || 502;
    const message = error.response?.data?.message || 'Failed to fetch bank list.';
    if (banksCache.data) {
      // Serve stale cache as a graceful fallback
      return res.status(200).json({ success: true, banks: banksCache.data, stale: true, message });
    }
    return res.status(status).json({ success: false, message });
  }
});

const resolveBankAccount = asyncHandler(async (req, res) => {
  const { bankCode, accountNumber } = req.body || {};

  if (!bankCode || !accountNumber) {
    return res.status(400).json({ success: false, message: 'Bank code and account number are required.' });
  }

  const num = String(accountNumber).trim();
  const code = String(bankCode).trim();
  if (!/^\d{10}$/.test(num)) {
    return res.status(400).json({ success: false, message: 'Account number must be 10 digits.' });
  }
  if (!/^\d{3,}$/.test(code)) {
    return res.status(400).json({ success: false, message: 'Bank code must be numeric.' });
  }

  const secret = getSecretKey();

  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
      headers: { Authorization: `Bearer ${secret}` },
      params: {
        account_number: num,
        bank_code: code,
      },
      timeout: 10000,
    });

    const data = response.data?.data;
    if (!data?.account_name) {
      return res.status(502).json({ success: false, message: 'Unable to resolve account name.' });
    }

    return res.json({
      success: true,
      accountName: data.account_name,
      bankName: data.bank_name,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      'Account resolution failed.';
    return res.status(status).json({ success: false, message });
  }
});

const createOrUpdatePayoutAccount = asyncHandler(async (req, res) => {
  let { bankCode, bankName, accountNumber, accountName, splitPercentage = 10 } = req.body || {};

  if (!bankCode || !accountNumber || !accountName) {
    return res.status(400).json({ success: false, message: 'Bank code, account number, and account name are required.' });
  }

  accountNumber = String(accountNumber).trim();
  bankCode = String(bankCode).trim();
  accountName = String(accountName).trim();
  bankName = bankName ? String(bankName).trim() : '';
  splitPercentage = Number(splitPercentage);

  if (!/^\d{10}$/.test(accountNumber)) {
    return res.status(400).json({ success: false, message: 'Account number must be 10 digits.' });
  }
  if (!/^\d{3,}$/.test(bankCode)) {
    return res.status(400).json({ success: false, message: 'Bank code must be numeric.' });
  }
  if (!accountName) {
    return res.status(400).json({ success: false, message: 'Account name is required.' });
  }
  if (!Number.isFinite(splitPercentage) || splitPercentage < 0 || splitPercentage > 100) {
    return res.status(400).json({ success: false, message: 'Split percentage must be between 0 and 100.' });
  }

  const secret = getSecretKey();

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/subaccount`,
      {
        business_name: accountName,
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: splitPercentage,
      },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const data = response.data?.data;
    if (!data?.subaccount_code) {
      return res.status(502).json({ success: false, message: 'Paystack did not return a subaccount code.' });
    }

    const payoutAccount = await PayoutAccount.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        subaccountCode: data.subaccount_code,
        bankName: bankName || '',
        bankCode,
        accountNumber,
        accountName,
        splitPercentage,
        isActive: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ success: true, payoutAccount });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      'Unable to create subaccount.';
    return res.status(status).json({ success: false, message });
  }
});
const getPayoutAccount = asyncHandler(async (req, res) => {
  const payoutAccount = await PayoutAccount.findOne({ user: req.user._id });
  // Return null if not found (status 200) so frontend can handle empty state
  return res.status(200).json({ success: true, payoutAccount: payoutAccount || null });
});

module.exports = {
  fetchPaystackBanks,
  resolveBankAccount,
  createOrUpdatePayoutAccount,
  getPayoutAccount,
};
