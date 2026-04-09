import { useState, useRef, useEffect } from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Plotly from 'plotly.js-dist-min';
import type { MultipleFitResponse } from '../types';
import { fitMultiple, predictMultiple } from '../api';

const DEFAULT_FEATURE_NAMES = ['Size (sqft)', 'Bedrooms'];

const DEFAULT_DATA = [
  { features: ['1400', '3'], y: '245000' },
  { features: ['1600', '3'], y: '312000' },
  { features: ['1700', '4'], y: '279000' },
  { features: ['1875', '4'], y: '308000' },
  { features: ['2050', '5'], y: '375000' },
];

interface DataRow {
  features: string[];
  y: string;
}

function Plot3D({
  plotRef,
  rows,
  coefficients,
  featureNames,
}: {
  plotRef: React.RefObject<HTMLDivElement | null>;
  rows: DataRow[];
  coefficients: number[];
  featureNames: string[];
}) {
  useEffect(() => {
    if (!plotRef.current) return;

    const x1 = rows.map((r) => Number(r.features[0]));
    const x2 = rows.map((r) => Number(r.features[1]));
    const yVals = rows.map((r) => Number(r.y));

    const intercept = coefficients[0];
    const c1 = coefficients[1];
    const c2 = coefficients[2];

    const gridSize = 20;
    const pad1 = (Math.max(...x1) - Math.min(...x1)) * 0.1;
    const pad2 = (Math.max(...x2) - Math.min(...x2)) * 0.1;
    const x1Range = Array.from({ length: gridSize }, (_, i) =>
      Math.min(...x1) - pad1 + ((Math.max(...x1) - Math.min(...x1) + 2 * pad1) * i) / (gridSize - 1)
    );
    const x2Range = Array.from({ length: gridSize }, (_, i) =>
      Math.min(...x2) - pad2 + ((Math.max(...x2) - Math.min(...x2) + 2 * pad2) * i) / (gridSize - 1)
    );
    const zSurface = x2Range.map((v2) =>
      x1Range.map((v1) => intercept + c1 * v1 + c2 * v2)
    );

    const P = Plotly as { newPlot: (el: HTMLDivElement, data: unknown[], layout: unknown, config: unknown) => void };
    P.newPlot(
      plotRef.current,
      [
        {
          type: 'scatter3d',
          mode: 'markers',
          x: x1,
          y: x2,
          z: yVals,
          marker: { size: 5, color: '#4f46e5' },
          name: 'Data Points',
        },
        {
          type: 'surface',
          x: x1Range,
          y: x2Range,
          z: zSurface,
          opacity: 0.5,
          colorscale: [
            [0, 'rgba(239,68,68,0.4)'],
            [1, 'rgba(239,68,68,0.8)'],
          ],
          showscale: false,
          name: 'Regression Plane',
        },
      ],
      {
        height: 500,
        margin: { l: 0, r: 0, b: 0, t: 0 },
        scene: {
          xaxis: { title: featureNames[0] },
          yaxis: { title: featureNames[1] },
          zaxis: { title: 'Y (Target)' },
        },
        legend: { x: 0, y: 1 },
      },
      { responsive: true }
    );
  }, [plotRef, rows, coefficients, featureNames]);

  return <div ref={plotRef} style={{ width: '100%' }} />;
}

function MultipleRegression() {
  const plotRef = useRef<HTMLDivElement>(null);
  const [featureCount, setFeatureCount] = useState(2);
  const [featureNames, setFeatureNames] = useState<string[]>(DEFAULT_FEATURE_NAMES);
  const [rows, setRows] = useState<DataRow[]>(DEFAULT_DATA);

  const [result, setResult] = useState<MultipleFitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [predictInputs, setPredictInputs] = useState<string[]>(
    Array(featureCount).fill('')
  );
  const [predictResult, setPredictResult] = useState<number | null>(null);
  const [predicting, setPredicting] = useState(false);

  const applyFeatureCount = (count: number) => {
    if (count < 1 || count > 20) return;
    const oldCount = featureCount;
    setFeatureCount(count);

    setFeatureNames((prev) => {
      const next = [...prev];
      if (count > oldCount) {
        for (let i = oldCount; i < count; i++) {
          next.push(`Feature ${i + 1}`);
        }
      } else {
        next.length = count;
      }
      return next;
    });

    setRows((prev) =>
      prev.map((row) => {
        const feats = [...row.features];
        if (count > oldCount) {
          for (let i = oldCount; i < count; i++) feats.push('');
        } else {
          feats.length = count;
        }
        return { ...row, features: feats };
      })
    );

    setPredictInputs((prev) => {
      const next = [...prev];
      if (count > oldCount) {
        for (let i = oldCount; i < count; i++) next.push('');
      } else {
        next.length = count;
      }
      return next;
    });

    setResult(null);
    setPredictResult(null);
  };

  const updateFeatureName = (idx: number, value: string) => {
    setFeatureNames((prev) => prev.map((n, i) => (i === idx ? value : n)));
  };

  const updateRow = (rowIdx: number, field: 'y' | number, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIdx) return row;
        if (field === 'y') return { ...row, y: value };
        const feats = [...row.features];
        feats[field as number] = value;
        return { ...row, features: feats };
      })
    );
  };

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { features: Array(featureCount).fill(''), y: '' },
    ]);

  const removeRow = (idx: number) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-fit whenever rows change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const yVals = rows.map((r) => Number(r.y));
    if (rows.length < 2 || yVals.some(isNaN) || rows.some((r) => r.y === '')) return;

    const featureMatrix: number[][] = [];
    let valid = true;
    for (const row of rows) {
      if (row.features.some((f) => f === '')) { valid = false; break; }
      const vals = row.features.map((v) => Number(v));
      if (vals.some(isNaN)) { valid = false; break; }
      featureMatrix.push(vals);
    }

    if (!valid) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fitMultiple({
          features: featureMatrix,
          y: yVals,
          featureNames,
        });
        setResult(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to train model.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rows, featureNames]);

  const handlePredict = async () => {
    if (!result) return;
    setPredictResult(null);

    const feats = predictInputs.map((v) => Number(v));
    if (feats.some(isNaN)) {
      setError('All feature inputs must be valid numbers.');
      return;
    }

    setError(null);
    setPredicting(true);
    try {
      const res = await predictMultiple(result.coefficients, feats);
      setPredictResult(res.prediction);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  const updatePredictInput = (idx: number, value: string) => {
    setPredictInputs((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const fmt = (n: number, decimals = 2) => parseFloat(n.toFixed(decimals)).toString();

  return (
    <>
      {/* Feature configuration */}
      <div className="card">
        <h2>Feature Configuration</h2>
        <div className="feature-config">
          <div className="field">
            <label>Number of Features</label>
            <input
              type="number"
              min={1}
              max={20}
              value={featureCount}
              onChange={(e) => applyFeatureCount(Number(e.target.value))}
            />
          </div>
        </div>
        <h3>Feature Names</h3>
        <div className="feature-names">
          {featureNames.map((name, i) => (
            <input
              key={i}
              type="text"
              value={name}
              onChange={(e) => updateFeatureName(i, e.target.value)}
              placeholder={`Feature ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Data input */}
      <div className="card">
        <h2>Training Data</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                {featureNames.map((name, i) => (
                  <th key={i}>{name}</th>
                ))}
                <th>Y (Target)</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  <td className="row-num">{ri + 1}</td>
                  {row.features.map((val, fi) => (
                    <td key={fi}>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => updateRow(ri, fi, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      type="number"
                      value={row.y}
                      onChange={(e) => updateRow(ri, 'y', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeRow(ri)}
                      title="Remove row"
                      disabled={rows.length <= 2}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" onClick={addRow}>
            + Add Row
          </button>
          {loading && <span className="loading-text">Fitting...</span>}
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Results */}
      {result && (
        <>
          <div className="card">
            <h2>Model Results</h2>

            <div className="metrics">
              <div className="metric-card">
                <div className="label">R-Squared</div>
                <div className={`value ${result.rSquared >= 0.8 ? 'good' : ''}`}>
                  {fmt(result.rSquared, 4)}
                </div>
              </div>
              <div className="metric-card">
                <div className="label">Mean Squared Error</div>
                <div className="value">{fmt(result.mse, 2)}</div>
              </div>
            </div>

            <h3>Coefficients</h3>
            <ul className="coeff-list">
              {result.coefficients.map((coeff, i) => {
                const isIntercept = i === result.coefficients.length - 1;
                const name = isIntercept
                  ? 'Intercept'
                  : result.featureNames[i] || `Feature ${i + 1}`;
                return (
                  <li key={i}>
                    <span className="coeff-name">{name}</span>
                    <span className="coeff-value">{fmt(coeff, 4)}</span>
                  </li>
                );
              })}
            </ul>

            {/* Chart */}
            {featureCount === 2 ? (
              <>
                <h3>3D Regression Plane</h3>
                <Plot3D
                  plotRef={plotRef}
                  rows={rows}
                  coefficients={result.coefficients}
                  featureNames={featureNames}
                />
              </>
            ) : (
              <>
                <h3>Actual vs Predicted</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={360}>
                    <ComposedChart
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                      data={(() => {
                        const yVals = rows.map((r) => Number(r.y));
                        const all = yVals.concat(result.predictions);
                        const min = Math.min(...all);
                        const max = Math.max(...all);
                        const pad = (max - min) * 0.05;
                        const points = yVals.map((actual, i) => ({
                          actual,
                          predicted: result.predictions[i],
                          perfect: null as number | null,
                        }));
                        const perfect = [
                          { actual: min - pad, predicted: null as number | null, perfect: min - pad },
                          { actual: max + pad, predicted: null as number | null, perfect: max + pad },
                        ];
                        return [...points, ...perfect].sort((a, b) => a.actual - b.actual);
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="actual"
                        type="number"
                        domain={['auto', 'auto']}
                        label={{ value: 'Actual', position: 'insideBottomRight', offset: -5 }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        type="number"
                        domain={['auto', 'auto']}
                        label={{ value: 'Predicted', angle: -90, position: 'insideLeft', offset: -5 }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(val) => fmt(Number(val), 2)}
                        labelFormatter={(val) => `Actual: ${val}`}
                      />
                      <Scatter
                        name="Predictions"
                        dataKey="predicted"
                        fill="#4f46e5"
                        r={5}
                      />
                      <Line
                        name="Perfect Fit"
                        dataKey="perfect"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        dot={false}
                        connectNulls
                        type="linear"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          {/* Prediction */}
          <div className="card">
            <h2>Predict</h2>
            <div className="predict-section">
              {featureNames.map((name, i) => (
                <div className="field" key={i}>
                  <label>{name}</label>
                  <input
                    type="number"
                    value={predictInputs[i] || ''}
                    onChange={(e) => updatePredictInput(i, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
              <button
                className="btn btn-primary"
                onClick={handlePredict}
                disabled={predicting}
              >
                {predicting ? 'Predicting...' : 'Predict'}
              </button>
            </div>
            {predictResult !== null && (
              <div className="predict-result">
                Predicted Y: {fmt(predictResult, 2)}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default MultipleRegression;
