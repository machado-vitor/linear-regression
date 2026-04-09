package app.dto;

public record MultipleFitResponse(double[] coefficients, double rSquared, double mse, String[] featureNames, double[] predictions) {}
