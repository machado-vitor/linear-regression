export interface SimpleFitRequest {
  x: number[];
  y: number[];
}

export interface SimpleFitResponse {
  slope: number;
  intercept: number;
  rSquared: number;
  mse: number;
  predictions: number[];
}

export interface MultipleFitRequest {
  features: number[][];
  y: number[];
  featureNames: string[];
}

export interface MultipleFitResponse {
  coefficients: number[];
  rSquared: number;
  mse: number;
  featureNames: string[];
  predictions: number[];
}

export interface PredictResponse {
  prediction: number;
}
