package multiple;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MultipleLinearRegressionTest {

    // matrix inversion accumulates floating-point drift, so we need a small tolerance
    static final double TOLERANCE = 1e-9;

    @Test
    void perfectTwoFeatures() {
        // y = 3 + 2*x1 + 5*x2
        double[][] X = {{1, 1}, {2, 1}, {1, 2}, {2, 2}, {3, 3}};
        double[] y = new double[X.length];
        for (int i = 0; i < X.length; i++) y[i] = 3 + 2 * X[i][0] + 5 * X[i][1];

        var model = MultipleLinearRegression.fit(X, y);

        double[] coeff = model.coefficients();
        assertEquals(3.0, coeff[0], TOLERANCE);  // intercept
        assertEquals(2.0, coeff[1], TOLERANCE);  // x1
        assertEquals(5.0, coeff[2], TOLERANCE);  // x2
        assertEquals(1.0, model.rSquared(X, y), TOLERANCE);
        assertEquals(0.0, model.mse(X, y), TOLERANCE);
    }

    @Test
    void singleFeatureMatchesSimple() {
        double[] xs = {1, 2, 3, 4, 5};
        double[] ys = {7, 9, 11, 13, 15};
        double[][] X = new double[xs.length][1];
        for (int i = 0; i < xs.length; i++) X[i][0] = xs[i];

        var multi = MultipleLinearRegression.fit(X, ys);
        var simpleModel = simple.LinearRegression.fit(xs, ys);

        assertEquals(simpleModel.intercept(), multi.intercept(), TOLERANCE);
        assertEquals(simpleModel.slope(), multi.coefficients()[1], TOLERANCE);
    }

    @Test
    void predictSingle() {
        // y = 1 + 2*x1 + 3*x2
        double[][] X = {{1, 0}, {0, 1}, {1, 1}, {2, 2}};
        double[] y = {3, 4, 6, 11};

        var model = MultipleLinearRegression.fit(X, y);

        assertEquals(6.0, model.predict(1, 1), TOLERANCE);
        assertEquals(1.0, model.predict(0, 0), TOLERANCE);
        assertEquals(16.0, model.predict(3, 3), TOLERANCE);
    }

    @Test
    void predictBatch() {
        double[][] X = {{1, 0}, {0, 1}, {1, 1}, {2, 2}};
        double[] y = {3, 4, 6, 11};

        var model = MultipleLinearRegression.fit(X, y);

        double[] preds = model.predict(new double[][]{{0, 0}, {1, 1}});
        assertEquals(1.0, preds[0], TOLERANCE);
        assertEquals(6.0, preds[1], TOLERANCE);
    }

    @Test
    void threeFeatures() {
        // y = 10 + 1*x1 - 2*x2 + 0.5*x3
        double[][] X = {
            {1, 2, 4}, {3, 1, 2}, {2, 3, 1}, {5, 0, 3},
            {4, 2, 5}, {1, 4, 2}, {6, 1, 1}, {2, 2, 3}
        };
        double[] y = new double[X.length];
        for (int i = 0; i < X.length; i++)
            y[i] = 10 + X[i][0] - 2 * X[i][1] + 0.5 * X[i][2];

        var model = MultipleLinearRegression.fit(X, y);

        double[] coeff = model.coefficients();
        assertEquals(10.0, coeff[0], TOLERANCE);
        assertEquals(1.0, coeff[1], TOLERANCE);
        assertEquals(-2.0, coeff[2], TOLERANCE);
        assertEquals(0.5, coeff[3], TOLERANCE);
    }

    @Test
    void noisyData() {
        double[][] X = {
            {50, 5}, {70, 10}, {80, 3}, {100, 20}, {120, 8},
            {60, 15}, {90, 7}, {110, 12}, {75, 2}, {130, 25}
        };
        double[] y = {195, 255, 289, 340, 406, 215, 316, 374, 274, 425};

        var model = MultipleLinearRegression.fit(X, y);

        assertTrue(model.rSquared(X, y) > 0.95);
        assertTrue(model.coefficients()[1] > 0, "sqm coefficient should be positive");
    }

    @Test
    void rSquaredConstantY() {
        double[][] X = {{1, 5}, {3, 1}, {5, 3}, {2, 4}};
        double[] y = {7, 7, 7, 7};

        assertEquals(1.0, MultipleLinearRegression.fit(X, y).rSquared(X, y));
    }

    @Test
    void differentFitsAreIndependent() {
        var first = MultipleLinearRegression.fit(new double[][]{{1}, {2}}, new double[]{10, 20});
        var second = MultipleLinearRegression.fit(new double[][]{{1}, {2}}, new double[]{100, 200});

        assertNotEquals(first.coefficients()[1], second.coefficients()[1]);
    }

    @Test
    void mismatchedRowsThrows() {
        assertThrows(IllegalArgumentException.class, () ->
            MultipleLinearRegression.fit(new double[][]{{1, 2}, {3, 4}}, new double[]{1})
        );
    }

    @Test
    void emptyDataThrows() {
        assertThrows(IllegalArgumentException.class, () ->
            MultipleLinearRegression.fit(new double[][]{}, new double[]{})
        );
    }

    @Test
    void wrongFeatureCountThrows() {
        var model = MultipleLinearRegression.fit(
            new double[][]{{1, 2}, {3, 4}, {5, 1}, {2, 3}}, new double[]{5, 6, 7, 8});

        assertThrows(IllegalArgumentException.class, () ->
            model.predict(1, 2, 3) // 3 features, expected 2
        );
    }

    @Test
    void metricsValidateArrays() {
        var model = MultipleLinearRegression.fit(new double[][]{{1}, {2}}, new double[]{1, 2});

        assertThrows(IllegalArgumentException.class, () ->
            model.rSquared(new double[][]{{1}}, new double[]{1, 2})
        );
        assertThrows(IllegalArgumentException.class, () ->
            model.mse(new double[][]{}, new double[]{})
        );
    }
}
