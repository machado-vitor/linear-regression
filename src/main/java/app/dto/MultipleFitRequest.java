package app.dto;

public record MultipleFitRequest(double[][] features, double[] y, String[] featureNames) {}
