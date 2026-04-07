package simple;

public class LinearRegression {

    public static SimpleModel fit(double[] x, double[] y) {
        if (x.length != y.length) throw new IllegalArgumentException("mismatched arrays");
        if (x.length == 0) throw new IllegalArgumentException("empty arrays");
        int sampleCount = x.length;

        double sumX = 0;
        double sumY = 0;

        for (int i = 0; i < sampleCount; i++) {
            sumX += x[i];
            sumY += y[i];
        }

        double meanX = sumX / sampleCount;
        double meanY = sumY / sampleCount;

        // least squares: slope = covariance(x,y) / variance(x)
        double covariance = 0;
        double variance = 0;

        for (int i = 0; i < sampleCount; i++) {
            double distanceFromMeanX = x[i] - meanX;
            covariance += distanceFromMeanX * (y[i] - meanY);
            variance += distanceFromMeanX * distanceFromMeanX;
        }

        if (variance < 1e-15) throw new ArithmeticException("zero variance in x — can't fit a line to that");
        // 1e-15 is a near-zero threshold instead of checking == 0 exactly.
        //  Floating-point math accumulates tiny rounding errors.

        double slope = covariance / variance;
        double intercept = meanY - slope * meanX;
        return new SimpleModel(slope, intercept);
    }
}
