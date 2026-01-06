const axios = require('axios');
const asyncHandler = require('express-async-handler');
const PayoutAccount = require('../models/PayoutAccount');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getSecretKey = () => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is not configured.');
  }
  return process.env.PAYSTACK_SECRET_KEY;
};

const fetchPaystackBanks = asyncHandler(async (_req, res) => {
  const secret = getSecretKey();

  const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
    headers: { Authorization: `Bearer ${secret}` },
    params: { country: 'nigeria' },
  });

  const banks = Array.isArray(response.data?.data)
    ? response.data.data.map((bank) => ({
        name: bank.name,
        code: bank.code,
        slug: bank.slug,
      }))
    : [];

  res.json({ banks });
});

const resolveBankAccount = asyncHandler(async (req, res) => {
  const { bankCode, accountNumber } = req.body || {};

  if (!bankCode || !accountNumber) {
    return res.status(400).json({ message: 'Bank code and account number are required.' });
  }

  const secret = getSecretKey();

  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
      headers: { Authorization: `Bearer ${secret}` },
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
    });

    const data = response.data?.data;
    if (!data?.account_name) {
      return res.status(502).json({ message: 'Unable to resolve account name.' });
    }

    res.json({
      accountName: data.account_name,
      bankName: data.bank_name,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      'Account resolution failed.';
    res.status(status).json({ message });
  }
});

const createOrUpdatePayoutAccount = asyncHandler(async (req, res) => {
  const { bankCode, bankName, accountNumber, accountName, splitPercentage = 10 } = req.body || {};

  if (!bankCode || !accountNumber || !accountName) {
    return res.status(400).json({ message: 'Bank code, account number, and account name are required.' });
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
      }
    );

    const data = response.data?.data;
    if (!data?.subaccount_code) {
      return res.status(502).json({ message: 'Paystack did not return a subaccount code.' });
    }

    const payoutAccount = await PayoutAccount.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        subaccountCode: data.subaccount_code,
        bankName: bankName || data.settlement_bank || '',
        bankCode,
        accountNumber,
        accountName,
        splitPercentage,
        isActive: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ payoutAccount });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      'Unable to create subaccount.';
    res.status(status).json({ message });
  }
});
const getPayoutAccount = asyncHandler(async (req, res) => {
  const payoutAccount = await PayoutAccount.findOne({ user: req.user._id });
  // Return null if not found (status 200) so frontend can handle empty state
  res.status(200).json({ payoutAccount: payoutAccount || null });
});

module.exports = {
  fetchPaystackBanks,
  resolveBankAccount,
  createOrUpdatePayoutAccount,
  getPayoutAccount,
};
