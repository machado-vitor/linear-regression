package multiple;

public record MultipleModel(double[] coefficients) {

    public double intercept() { return coefficients[0]; }

    public int featureCount() { return coefficients.length - 1; }

    public double predict(double... features) {
        if (features.length != featureCount())
            throw new IllegalArgumentException("expected " + featureCount() + " features, got " + features.length);
        double result = coefficients[0];
        for (int i = 0; i < features.length; i++) result += coefficients[i + 1] * features[i];
        return result;
    }

    public double[] predict(double[][] samples) {
        double[] predictions = new double[samples.length];
        for (int i = 0; i < samples.length; i++) predictions[i] = predict(samples[i]);
        return predictions;
    }

    public double rSquared(double[][] samples, double[] y) {
        validatePair(samples.length, y.length);
        double meanY = mean(y);

        double sumSquaredResiduals = 0, sumSquaredTotal = 0;
        for (int i = 0; i < samples.length; i++) {
            double predicted = predict(samples[i]);
            sumSquaredResiduals += (y[i] - predicted) * (y[i] - predicted);
            sumSquaredTotal += (y[i] - meanY) * (y[i] - meanY);
        }
        if (sumSquaredTotal < 1e-15) return sumSquaredResiduals < 1e-15 ? 1.0 : 0.0;
        return 1.0 - (sumSquaredResiduals / sumSquaredTotal);
    }

    public double mse(double[][] samples, double[] y) {
        validatePair(samples.length, y.length);
        double sumSquaredErrors = 0;
        for (int i = 0; i < samples.length; i++) {
            double error = y[i] - predict(samples[i]);
            sumSquaredErrors += error * error;
        }
        return sumSquaredErrors / samples.length;
    }

    private static double mean(double[] values) {
        double sum = 0;
        for (double v : values) sum += v;
        return sum / values.length;
    }

    private static void validatePair(int samplesLength, int yLength) {
        if (samplesLength != yLength) throw new IllegalArgumentException("mismatched arrays");
        if (samplesLength == 0) throw new IllegalArgumentException("empty arrays");
    }
}
