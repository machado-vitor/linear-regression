import { useState, useEffect, useRef } from 'react';
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
import type { SimpleFitResponse } from '../types';
import { fitSimple, predictSimple } from '../api';

interface DataRow {
  x: string;
  y: string;
}

const DEFAULT_ROWS: DataRow[] = [
  { x: '1', y: '7' },
  { x: '2', y: '9' },
  { x: '3', y: '11' },
  { x: '4', y: '13' },
  { x: '5', y: '15' },
];

function SimpleRegression() {
  const [rows, setRows] = useState<DataRow[]>(DEFAULT_ROWS);
  const [result, setResult] = useState<SimpleFitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [predictX, setPredictX] = useState('');
  const [predictResult, setPredictResult] = useState<number | null>(null);
  const [predicting, setPredicting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-fit whenever rows change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const xVals = rows.map((r) => Number(r.x));
    const yVals = rows.map((r) => Number(r.y));

    if (rows.length < 2 || xVals.some(isNaN) || yVals.some(isNaN) || rows.some((r) => r.x === '' || r.y === '')) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fitSimple({ x: xVals, y: yVals });
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
  }, [rows]);

  const updateRow = (idx: number, field: 'x' | 'y', value: string) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, { x: '', y: '' }]);

  const removeRow = (idx: number) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePredict = async () => {
    if (!result) return;
    setPredictResult(null);
    const xVal = Number(predictX);
    if (isNaN(xVal)) {
      setError('Enter a valid number for X.');
      return;
    }
    setError(null);
    setPredicting(true);
    try {
      const res = await predictSimple(result.slope, result.intercept, xVal);
      setPredictResult(res.prediction);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  const chartData = () => {
    if (!result) return [];

    const xVals = rows.map((r) => Number(r.x));
    const yVals = rows.map((r) => Number(r.y));

    const scatterPoints = xVals.map((x, i) => ({
      x,
      y: yVals[i],
      lineY: null as number | null,
    }));

    const maxX = Math.max(...xVals);
    const pad = (maxX - Math.min(...xVals)) * 0.05;
    const lineStart = 0;
    const lineEnd = maxX + pad;
    const steps = 100;

    const linePoints = Array.from({ length: steps + 1 }, (_, i) => {
      const x = lineStart + ((lineEnd - lineStart) * i) / steps;
      return {
        x,
        y: null as number | null,
        lineY: result.slope * x + result.intercept,
      };
    });

    return [...scatterPoints, ...linePoints].sort((a, b) => a.x - b.x);
  };

  const fmt = (n: number, decimals = 2) => parseFloat(n.toFixed(decimals)).toString();

  return (
    <>
      {/* Data input */}
      <div className="card">
        <h2>Training Data</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}>#</th>
              <th>X</th>
              <th>Y</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="row-num">{i + 1}</td>
                <td>
                  <input
                    type="number"
                    value={row.x}
                    onChange={(e) => updateRow(i, 'x', e.target.value)}
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.y}
                    onChange={(e) => updateRow(i, 'y', e.target.value)}
                    placeholder="0"
                  />
                </td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeRow(i)}
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

            <div className="equation">
              <div className="eq-label">Regression Equation</div>
              <div className="eq-text">
                y = {fmt(result.slope, 4)}x + {fmt(result.intercept, 2)}
              </div>
            </div>

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
              <div className="metric-card">
                <div className="label">Slope</div>
                <div className="value">{fmt(result.slope, 4)}</div>
              </div>
              <div className="metric-card">
                <div className="label">Intercept</div>
                <div className="value">{fmt(result.intercept, 2)}</div>
              </div>
            </div>

            {/* Chart */}
            <h3>Scatter Plot with Regression Line</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={chartData()} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[0, 'dataMax']}
                    label={{ value: 'X', position: 'insideBottomRight', offset: -5 }}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                    allowDataOverflow
                    interval={0}
                    ticks={(() => {
                      const allX = rows.map(r => Number(r.x)).filter(v => !isNaN(v));
                      const max = Math.max(...allX);
                      const range = Math.ceil(max);
                      const step = range <= 20 ? 1 : range <= 50 ? 5 : range <= 200 ? 10 : Math.ceil(range / 20);
                      const ticks: number[] = [];
                      for (let v = 0; v <= Math.ceil(max); v += step) ticks.push(v);
                      return ticks;
                    })()}
                  />
                  <YAxis
                    type="number"
                    domain={[
                      (min: number) => min >= 0 ? 0 : Math.floor(min * 1.1),
                      (max: number) => Math.ceil(max),
                    ]}
                    label={{ value: 'Y', angle: -90, position: 'insideLeft', offset: -5 }}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                    interval={0}
                    ticks={(() => {
                      const allY = rows.map(r => Number(r.y)).filter(v => !isNaN(v));
                      const lineY0 = result.intercept;
                      const lineYMax = result.slope * Math.max(...rows.map(r => Number(r.x))) + result.intercept;
                      const min = Math.min(0, ...allY, lineY0, lineYMax);
                      const max = Math.max(...allY, lineY0, lineYMax);
                      const range = Math.ceil(max) - Math.floor(min);
                      const step = range <= 20 ? 1 : range <= 50 ? 5 : range <= 200 ? 10 : Math.ceil(range / 20);
                      const start = Math.floor(min / step) * step;
                      const end = Math.ceil(max / step) * step;
                      const ticks: number[] = [];
                      for (let v = start; v <= end; v += step) ticks.push(v);
                      return ticks;
                    })()}
                  />
                  <Tooltip
                    formatter={(val) => fmt(Number(val), 2)}
                    labelFormatter={(val) => `X: ${val}`}
                  />
                  <Scatter
                    name="Data Points"
                    dataKey="y"
                    fill="#4f46e5"
                    r={5}
                  />
                  <Line
                    name="Regression Line"
                    dataKey="lineY"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    type="linear"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prediction */}
          <div className="card">
            <h2>Predict</h2>
            <div className="predict-section">
              <div className="field">
                <label>X Value</label>
                <input
                  type="number"
                  value={predictX}
                  onChange={(e) => setPredictX(e.target.value)}
                  placeholder="e.g. 90"
                />
              </div>
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

export default SimpleRegression;
