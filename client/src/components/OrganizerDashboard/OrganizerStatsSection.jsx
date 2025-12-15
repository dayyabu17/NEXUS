import React, { useEffect, useMemo, useRef } from 'react';

const AnimatedStatValue = ({ value, formatter, animate, delay = 0, duration = 900 }) => {
  const nodeRef = useRef(null);
  const target = Number(value) || 0;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) {
      return undefined;
    }

    const formatValue = (input) => {
      const rounded = Math.round(input);
      if (formatter) {
        return formatter(rounded);
      }
      return rounded.toLocaleString();
    };

    if (!animate) {
      node.textContent = formatValue(target);
      return undefined;
    }

    let start;
    let rafId;
    let timeoutId;

    const step = (timestamp) => {
      if (start === undefined) {
        start = timestamp;
      }
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);
      const current = target * eased;
      node.textContent = formatValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    if (delay > 0) {
      timeoutId = window.setTimeout(() => {
        rafId = requestAnimationFrame(step);
      }, delay);
    } else {
      rafId = requestAnimationFrame(step);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [animate, delay, duration, formatter, target]);

  const initial = animate
    ? formatter
      ? formatter(0)
      : '0'
    : formatter
      ? formatter(target)
      : target.toLocaleString();
  return <span ref={nodeRef}>{initial}</span>;
};

const StatSparkline = ({ data, color = '#4d997a', animate, delay = 0, id }) => {
  const svgWidth = 112;
  const svgHeight = 56;

  const values = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [0];
    }
    return data.map((point) => {
      if (typeof point === 'number') {
        return point;
      }
      if (point && typeof point === 'object') {
        return Number(point.value) || 0;
      }
      return 0;
    });
  }, [data]);

  const { pathD, areaD, lastPoint } = useMemo(() => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = values.length > 1 ? svgWidth / (values.length - 1) : svgWidth;

    let pathString = '';

    values.forEach((value, index) => {
      const x = index * step;
      const normalized = (value - min) / range;
      const y = svgHeight - normalized * svgHeight;
      pathString += index === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
    });

    const areaString = `${pathString} L${svgWidth} ${svgHeight} L0 ${svgHeight} Z`;
    const lastIndex = values.length - 1;
    const lastValue = values[lastIndex];
    const normalizedLast = (lastValue - min) / range;
    const lastY = svgHeight - normalizedLast * svgHeight;

    return {
      pathD: pathString,
      areaD: areaString,
      lastPoint: { x: lastIndex * step, y: lastY },
    };
  }, [values]);

  const transitionClass = animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2';

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={`h-14 w-28 transform transition-all duration-700 ease-out ${transitionClass}`}
      style={{ transitionDelay: `${delay}ms` }}
      role="img"
      aria-labelledby={`sparkline-${id}`}
    >
      <title id={`sparkline-${id}`}>Recent trend</title>
      <defs>
        <linearGradient id={`sparkline-area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkline-area-${id})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={color} />
    </svg>
  );
};

const OrganizerStatsSection = ({ statsCards }) => (
  <section className="mt-10 grid gap-6 lg:grid-cols-3">
    {statsCards.map(({ id, title, value, change, formatter, trendSeries, color }) => {
      const numericValue = Number(value) || 0;
      const numericChange = Number(change) || 0;
      const trendColor = numericChange >= 0 ? 'text-[#4d997a]' : 'text-[#c26666]';
      const changePrefix = numericChange > 0 ? '+' : '';

      return (
        <article
          key={id}
          className="rounded-xl border border-white/5 bg-[rgba(25,27,29,0.78)] px-6 py-8 shadow-lg shadow-black/20"
        >
          <p className="text-sm text-white/70">{title}</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold">
              <AnimatedStatValue
                value={numericValue}
                formatter={formatter}
                animate={false}
              />
            </p>
            <StatSparkline
              id={id}
              data={trendSeries}
              color={color}
              animate={false}
            />
          </div>
          <p className={`mt-4 text-xs font-medium ${trendColor}`}>
            {changePrefix}
            {numericChange}% compared to last 7 days
          </p>
        </article>
      );
    })}
  </section>
);

export default OrganizerStatsSection;
