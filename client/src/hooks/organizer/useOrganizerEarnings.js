import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const defaultSummaryTip = 'Tip: Connect your dedicated payout account in settings to shorten settlement times.';

const useOrganizerEarnings = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    netIncome: 0,
    pendingPayout: 0,
    totalTickets: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payoutSummary, setPayoutSummary] = useState({
    nextPayoutDate: null,
    averageSettlementDelayDays: null,
    feeRate: 0.08,
    tip: defaultSummaryTip,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gradientId = useMemo(
    () => `earningsGradient-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  useEffect(() => {
    let isSubscribed = true;

    const fetchEarnings = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/sign-in');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/organizer/earnings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isSubscribed) {
          return;
        }

        const metricsPayload = data?.metrics || {};
        const trendPayload = Array.isArray(data?.revenueTrend) ? data.revenueTrend : [];
        const transactionsPayload = Array.isArray(data?.transactions) ? data.transactions : [];
        const summaryPayload = data?.payoutSummary || {};

        setMetrics({
          totalRevenue: Number(metricsPayload.totalRevenue) || 0,
          netIncome: Number(metricsPayload.netIncome) || 0,
          pendingPayout: Number(metricsPayload.pendingPayout) || 0,
          totalTickets: Number(metricsPayload.totalTickets) || 0,
        });

        setChartData(
          trendPayload.map((point) => {
            const baseLabel = point.label;
            let label = typeof baseLabel === 'string' ? baseLabel : '';

            if (!label && point.date) {
              const parsed = new Date(point.date);
              if (!Number.isNaN(parsed.getTime())) {
                label = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            }

            if (!label) {
              label = '';
            }

            return {
              label,
              revenue: Number(point.revenue) || 0,
            };
          }),
        );

        setTransactions(
          transactionsPayload.map((transaction) => ({
            id: transaction.id,
            event: transaction.event,
            buyer: transaction.buyer,
            amount: Number(transaction.amount) || 0,
            date: transaction.date,
            status: transaction.status || 'Processing',
          })),
        );

        setPayoutSummary((previous) => ({
          ...previous,
          ...summaryPayload,
          feeRate:
            summaryPayload.feeRate !== undefined && summaryPayload.feeRate !== null
              ? summaryPayload.feeRate
              : previous.feeRate,
          tip: summaryPayload.tip || previous.tip || defaultSummaryTip,
        }));
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
          return;
        }

        if (isSubscribed) {
          setError(err?.response?.data?.message || 'Unable to load earnings data.');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchEarnings();

    return () => {
      isSubscribed = false;
    };
  }, [navigate]);

  const formattedNextPayout = useMemo(() => {
    if (!payoutSummary.nextPayoutDate) {
      return 'TBD';
    }

    const parsed = new Date(payoutSummary.nextPayoutDate);
    if (Number.isNaN(parsed.getTime())) {
      return 'TBD';
    }

    return parsed.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [payoutSummary.nextPayoutDate]);

  const formattedAverageDelay = useMemo(() => {
    if (
      payoutSummary.averageSettlementDelayDays === null ||
      payoutSummary.averageSettlementDelayDays === undefined
    ) {
      return '—';
    }

    const value = payoutSummary.averageSettlementDelayDays;
    return `${value} day${value === 1 ? '' : 's'}`;
  }, [payoutSummary.averageSettlementDelayDays]);

  const feeRatePercent = useMemo(() => {
    if (payoutSummary.feeRate === null || payoutSummary.feeRate === undefined) {
      return '—';
    }

    return `${Math.round(Number(payoutSummary.feeRate) * 100)}%`;
  }, [payoutSummary.feeRate]);

  return {
    metrics,
    chartData,
    transactions,
    payoutSummary,
    loading,
    error,
    gradientId,
    formattedNextPayout,
    formattedAverageDelay,
    feeRatePercent,
    currencyFormatter,
    defaultSummaryTip,
  };
};

export default useOrganizerEarnings;
