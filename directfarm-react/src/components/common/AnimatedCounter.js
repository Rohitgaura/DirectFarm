import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/AnimatedCounter.css';

/**
 * AnimatedCounter — A reusable count-up component that animates when scrolled into view.
 *
 * Props:
 *  - end        {number}  Target value to count up to
 *  - duration   {number}  Animation duration in ms (default: 2000)
 *  - prefix     {string}  Text before the number, e.g. "₹" (default: "")
 *  - suffix     {string}  Text after the number, e.g. "+" or "%" (default: "")
 *  - decimals   {number}  Decimal places (default: 0)
 *  - separator  {string}  Thousands separator (default: ",")
 *  - className  {string}  Optional extra class names
 */
const AnimatedCounter = ({
  end = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  className = '',
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  // Ease-out cubic for a satisfying deceleration curve
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const formatNumber = useCallback(
    (num) => {
      const fixed = num.toFixed(decimals);
      if (!separator) return fixed;

      const [intPart, decPart] = fixed.split('.');
      const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
    },
    [decimals, separator]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            const currentValue = easedProgress * end;

            setCount(currentValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span
      ref={ref}
      className={`animated-counter ${hasAnimated ? 'animated-counter--visible' : ''} ${className}`}
    >
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;
