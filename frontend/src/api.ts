import type {
  SimpleFitRequest,
  SimpleFitResponse,
  MultipleFitRequest,
  MultipleFitResponse,
  PredictResponse,
} from './types';

const BASE_URL = 'http://localhost:8080/api';

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function fitSimple(req: SimpleFitRequest): Promise<SimpleFitResponse> {
  return request<SimpleFitResponse>('/simple/fit', req);
}

export function predictSimple(
  slope: number,
  intercept: number,
  x: number
): Promise<PredictResponse> {
  return request<PredictResponse>('/simple/predict', {
    slope,
    intercept,
    x,
  });
}

export function fitMultiple(req: MultipleFitRequest): Promise<MultipleFitResponse> {
  return request<MultipleFitResponse>('/multiple/fit', req);
}

export function predictMultiple(
  coefficients: number[],
  features: number[]
): Promise<PredictResponse> {
  return request<PredictResponse>('/multiple/predict', {
    coefficients,
    features,
  });
}
