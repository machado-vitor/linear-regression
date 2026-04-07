package simple;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class LinearRegressionTest {

    @Test
    void perfectLine() {
        // y = 2x + 5, zero noise
        double[] x = {1, 2, 3, 4, 5};
        double[] y = {7, 9, 11, 13, 15};

        var model = LinearRegression.fit(x, y);

        assertEquals(2.0, model.slope());
        assertEquals(5.0, model.intercept());
        assertEquals(1.0, model.rSquared(x, y));
        assertEquals(0.0, model.mse(x, y));
    }

    @Test
    void predictSingle() {
        var model = LinearRegression.fit(new double[]{0, 1, 2}, new double[]{1, 3, 5});

        assertEquals(21.0, model.predict(10));
        assertEquals(1.0, model.predict(0));
        assertEquals(-1.0, model.predict(-1));
    }

    @Test
    void predictMultipleValues() {
        var model = LinearRegression.fit(new double[]{0, 1, 2}, new double[]{1, 3, 5});

        assertEquals(1.0, model.predict(0));
        assertEquals(3.0, model.predict(1));
        assertEquals(21.0, model.predict(10));
    }

    @Test
    void noisyData() {
        double[] x = {50, 65, 70, 80, 90, 100, 110, 120, 135, 150};
        double[] y = {150, 185, 200, 230, 260, 300, 320, 350, 395, 450};

        var model = LinearRegression.fit(x, y);

        assertTrue(model.slope() > 0);
        assertTrue(model.rSquared(x, y) > 0.99);
        assertTrue(model.mse(x, y) < 50);
    }

    @Test
    void horizontalLine() {
        var model = LinearRegression.fit(new double[]{1, 2, 3, 4}, new double[]{5, 5, 5, 5});

        assertEquals(0.0, model.slope());
        assertEquals(5.0, model.intercept());
        assertEquals(5.0, model.predict(999));
    }

    @Test
    void horizontalLineRSquared() {
        double[] x = {1, 2, 3, 4};
        double[] y = {5, 5, 5, 5};

        assertEquals(1.0, LinearRegression.fit(x, y).rSquared(x, y));
    }

    @Test
    void negativeSlope() {
        var model = LinearRegression.fit(new double[]{1, 2, 3, 4}, new double[]{10, 8, 6, 4});

        assertEquals(-2.0, model.slope());
        assertEquals(12.0, model.intercept());
    }

    @Test
    void twoPoints() {
        var model = LinearRegression.fit(new double[]{0, 10}, new double[]{0, 100});

        assertEquals(10.0, model.slope());
        assertEquals(0.0, model.intercept());
    }

    @Test
    void largeValues() {
        var model = LinearRegression.fit(new double[]{1e6, 2e6, 3e6}, new double[]{2e6, 4e6, 6e6});

        assertEquals(2.0, model.slope());
        assertEquals(0.0, model.intercept());
    }

    @Test
    void differentFitsAreIndependent() {
        var first = LinearRegression.fit(new double[]{0, 1}, new double[]{0, 10});
        var second = LinearRegression.fit(new double[]{0, 1}, new double[]{0, 5});

        assertEquals(10.0, first.slope());
        assertEquals(5.0, second.slope());
    }

    @Test
    void mismatchedArraysThrows() {
        assertThrows(IllegalArgumentException.class, () ->
            LinearRegression.fit(new double[]{1, 2}, new double[]{1})
        );
    }

    @Test
    void emptyArraysThrows() {
        assertThrows(IllegalArgumentException.class, () ->
            LinearRegression.fit(new double[]{}, new double[]{})
        );
    }

    @Test
    void zeroVarianceThrows() {
        assertThrows(ArithmeticException.class, () ->
            LinearRegression.fit(new double[]{3, 3, 3}, new double[]{1, 2, 3})
        );
    }

    @Test
    void mseAndRSquaredValidateArrays() {
        var model = LinearRegression.fit(new double[]{0, 1}, new double[]{0, 1});

        assertThrows(IllegalArgumentException.class, () ->
            model.rSquared(new double[]{1}, new double[]{1, 2})
        );
        assertThrows(IllegalArgumentException.class, () ->
            model.mse(new double[]{}, new double[]{})
        );
    }
}
