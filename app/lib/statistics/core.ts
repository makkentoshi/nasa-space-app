/**
 * Statistical analysis utilities for climatological data
 * TypeScript implementation of core statistical functions
 */

/**
 * Calculate basic statistics (mean, median, std, percentiles)
 */
export function calculateBasicStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;

  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const median = sorted[Math.floor(n / 2)];
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const std = Math.sqrt(variance);

  const percentiles = {
    p10: getPercentile(sorted, 0.10),
    p25: getPercentile(sorted, 0.25),
    p50: getPercentile(sorted, 0.50),
    p75: getPercentile(sorted, 0.75),
    p90: getPercentile(sorted, 0.90),
    p95: getPercentile(sorted, 0.95),
  };

  return { mean, median, std, percentiles, n };
}

/**
 * Calculate percentile value from sorted array
 */
function getPercentile(sorted: number[], p: number): number {
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sorted[lower];
  }
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate probability of exceeding threshold
 */
export function calculateExceedanceProbability(
  values: number[],
  threshold: number
): number {
  const exceedances = values.filter(v => v > threshold).length;
  return exceedances / values.length;
}

/**
 * Bootstrap confidence interval for probability estimate
 * Uses resampling with replacement
 */
export function bootstrapCI(
  values: number[],
  threshold: number,
  iterations: number = 1000,
  confidenceLevel: number = 0.95
): [number, number] {
  const bootstrapProbs: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Resample with replacement
    const sample = Array.from({ length: values.length }, () => 
      values[Math.floor(Math.random() * values.length)]
    );
    
    const prob = calculateExceedanceProbability(sample, threshold);
    bootstrapProbs.push(prob);
  }
  
  // Sort and get confidence interval
  bootstrapProbs.sort((a, b) => a - b);
  const alpha = 1 - confidenceLevel;
  const lowerIndex = Math.floor(bootstrapProbs.length * (alpha / 2));
  const upperIndex = Math.floor(bootstrapProbs.length * (1 - alpha / 2));
  
  return [bootstrapProbs[lowerIndex], bootstrapProbs[upperIndex]];
}

/**
 * Mann-Kendall trend test
 * Returns test statistic, p-value, and trend direction
 */
export function mannKendallTest(timeSeries: Array<{ year: number; value: number }>) {
  const n = timeSeries.length;
  const values = timeSeries.map(d => d.value);
  
  // Calculate S statistic
  let S = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      S += Math.sign(values[j] - values[i]);
    }
  }
  
  // Calculate variance
  const varS = (n * (n - 1) * (2 * n + 5)) / 18;
  
  // Calculate Z statistic
  let Z: number;
  if (S > 0) {
    Z = (S - 1) / Math.sqrt(varS);
  } else if (S < 0) {
    Z = (S + 1) / Math.sqrt(varS);
  } else {
    Z = 0;
  }
  
  // Calculate p-value (two-tailed test)
  // Using approximation for normal distribution
  const pValue = 2 * (1 - normalCDF(Math.abs(Z)));
  
  return {
    statistic: S,
    zScore: Z,
    pValue,
    trend: S > 0 ? 'increasing' : S < 0 ? 'decreasing' : 'no trend',
  };
}

/**
 * Sen's slope estimator
 * Robust non-parametric estimate of linear trend
 */
export function sensSlope(timeSeries: Array<{ year: number; value: number }>): number {
  const n = timeSeries.length;
  const slopes: number[] = [];
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const slope = (timeSeries[j].value - timeSeries[i].value) / 
                    (timeSeries[j].year - timeSeries[i].year);
      slopes.push(slope);
    }
  }
  
  // Return median of all slopes
  slopes.sort((a, b) => a - b);
  return slopes[Math.floor(slopes.length / 2)];
}

/**
 * Normal cumulative distribution function (approximation)
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return z > 0 ? 1 - prob : prob;
}

/**
 * Compare two periods (baseline vs recent)
 */
export function comparePeriods(
  baselineValues: number[],
  recentValues: number[],
  threshold: number
) {
  const pExceedBaseline = calculateExceedanceProbability(baselineValues, threshold);
  const pExceedRecent = calculateExceedanceProbability(recentValues, threshold);
  
  const deltaPercent = ((pExceedRecent - pExceedBaseline) / pExceedBaseline) * 100;
  
  return {
    p_exceed_baseline: pExceedBaseline,
    p_exceed_recent: pExceedRecent,
    delta_percent: deltaPercent,
  };
}
