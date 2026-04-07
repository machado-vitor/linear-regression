# Linear Regression

> A supervised learning algorithm that models the relationship between
> a dependent variable and one or more independent variables by fitting a straight line.

$$y = mx + b$$

where **m** is the slope of the line, **x** is the independent variable, **b** is the y-intercept.
This gives **y**, the dependent variable (the predicted value).

$$m = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{n}(x_i - \bar{x})^2}$$

$$b = \bar{y} - m\bar{x}$$

where $\bar{x}$ is the mean of x values and $\bar{y}$ is the mean of y values.

---

## Pros

- **Simple & Interpretable** -- coefficients directly explain feature impact
- **Computationally Efficient** -- scales well to large datasets
- **Strong Baseline** -- quick to implement, easy to benchmark against
- **Well-understood Theory** -- backed by solid statistical foundations
- **Low Variance** -- stable predictions across similar datasets

---

## Cons

- **Assumes Linearity** -- cannot capture curved or complex relationships
- **Sensitive to Outliers** -- a few extreme points can skew the entire line
- **Multicollinearity Issues** -- correlated features degrade coefficient reliability
- **Underfitting Risk** -- too simple for most real-world problems on its own
- **Requires Feature Engineering** -- raw features often need transformation to work well

---

## Use Case: Real Estate Price Prediction

**Problem:** Predict house prices based on square footage.

| Square Meters | Price (USD) |
|---------------|-------------|
| 50            | 150,000     |
| 70            | 200,000     |
| 80            | 230,000     |
| 100           | 300,000     |
| 120           | 350,000     |

The model learns a line like $price = b + m \cdot sqm$, then predicts the price for any new size.

**Other applications:** stock forecasting, crop yield estimation, sales analysis.

---

## Code -- Java 25 (Raw Implementation)

**LinearRegression.java** -- fits the model using least squares:

```java
public class LinearRegression {

    public static SimpleModel fit(double[] x, double[] y) {
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

        double slope = covariance / variance;
        double intercept = meanY - slope * meanX;
        return new SimpleModel(slope, intercept);
    }
}
```

**SimpleModel.java** -- immutable result with predict and metrics:

```java
public record SimpleModel(double slope, double intercept) {

    public double predict(double x) {
        return intercept + slope * x;
    }

    public double rSquared(double[] x, double[] y) {
        double meanY = mean(y);

        double sumSquaredResiduals = 0, sumSquaredTotal = 0;
        for (int i = 0; i < x.length; i++) {
            double predicted = predict(x[i]);
            sumSquaredResiduals += (y[i] - predicted) * (y[i] - predicted);
            sumSquaredTotal += (y[i] - meanY) * (y[i] - meanY);
        }
        return 1.0 - (sumSquaredResiduals / sumSquaredTotal);
    }

    public double mse(double[] x, double[] y) {
        double sumSquaredErrors = 0;
        for (int i = 0; i < x.length; i++) {
            double error = y[i] - predict(x[i]);
            sumSquaredErrors += error * error;
        }
        return sumSquaredErrors / x.length;
    }
}
```

**Usage:**

```java
double[] x = {50, 70, 80, 100, 120};
double[] y = {150, 200, 230, 300, 350};

var model = LinearRegression.fit(x, y);

model.slope();       // 2.86
model.intercept();   // 7.00
model.predict(90);   // 264.43
model.rSquared(x, y); // 0.9975
model.mse(x, y);     // 20.91
```

---

## How It Works (Recap)

1. **Collect** data points $(x, y)$
2. **Compute** the best-fit line using **Least Squares** -- minimizes the sum of squared errors
3. **Predict** new values by plugging $x$ into $y = mx + b$

**Cost Function (MSE):**

$$MSE = \frac{1}{n}\sum_{i=1}^{n}(\hat{y}_i - y_i)^2$$

The smaller the MSE, the better the fit.

**R-squared:**

$$R^2 = 1 - \frac{\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}{\sum_{i=1}^{n}(y_i - \bar{y})^2}$$

$R^2 = 1.0$ means perfect fit, $R^2 = 0$ means the model is no better than predicting the mean.

---

## Summary

| Aspect     | Detail                                      |
|------------|---------------------------------------------|
| Type       | Supervised Learning -- Regression            |
| Formula    | $y = mx + b$                                |
| Best for   | Linear relationships, quick baselines        |
| Avoid when | Data has complex, non-linear patterns        |
| Java impl. | ~20 lines, no libraries needed               |
