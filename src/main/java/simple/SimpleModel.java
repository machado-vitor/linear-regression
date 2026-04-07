package simple;

public record SimpleModel(double slope, double intercept) {

    public double predict(double x) {
        return intercept + slope * x;
    }

    public double rSquared(double[] x, double[] y) {
        validatePair(x.length, y.length);
        double meanY = mean(y);

        double sumSquaredResiduals = 0, sumSquaredTotal = 0;
        for (int i = 0; i < x.length; i++) {
            double predicted = predict(x[i]);
            sumSquaredResiduals += (y[i] - predicted) * (y[i] - predicted);
            sumSquaredTotal += (y[i] - meanY) * (y[i] - meanY);
        }
        if (sumSquaredTotal < 1e-15) return sumSquaredResiduals < 1e-15 ? 1.0 : 0.0;
        return 1.0 - (sumSquaredResiduals / sumSquaredTotal);
    }

    public double mse(double[] x, double[] y) {
        validatePair(x.length, y.length);
        double sumSquaredErrors = 0;
        for (int i = 0; i < x.length; i++) {
            double error = y[i] - predict(x[i]);
            sumSquaredErrors += error * error;
        }
        return sumSquaredErrors / x.length;
    }

    private static double mean(double[] values) {
        double sum = 0;
        for (double v : values) sum += v;
        return sum / values.length;
    }

    private static void validatePair(int xLength, int yLength) {
        if (xLength != yLength) throw new IllegalArgumentException("mismatched arrays");
        if (xLength == 0) throw new IllegalArgumentException("empty arrays");
    }
}
