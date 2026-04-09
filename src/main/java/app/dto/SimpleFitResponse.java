package app.dto;

public record SimpleFitResponse(double slope, double intercept, double rSquared, double mse, double[] predictions) {}
