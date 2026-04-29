package simple;

public class LinearRegression {

    public static SimpleModel fit(double[] x, double[] y) {
        if (x.length != y.length) throw new IllegalArgumentException("mismatched arrays");
        if (x.length == 0) throw new IllegalArgumentException("empty arrays");
        int sampleCount = x.length; // n

        double sumX = 0;
        double sumY = 0;

        for (int i = 0; i < sampleCount; i++) {
            sumX += x[i];
            sumY += y[i];
        }

        double meanX = sumX / sampleCount;
        double meanY = sumY / sampleCount;

        double covariance = 0, variance = 0;
        for (int i = 0; i < sampleCount; i++) {
            double xDeviation = x[i] - meanX;   // (x_i - x̄)
            covariance += xDeviation * (y[i] - meanY);
            variance  += xDeviation * xDeviation;
        }

        double slope     = covariance / variance;   // covariance(x,y) / variance(x)
        double intercept = meanY - slope * meanX;   // anchor through (x̄, ȳ)
        return new SimpleModel(slope, intercept);
    }
}
