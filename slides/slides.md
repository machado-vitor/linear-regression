---
marp: true
theme: default
paginate: true
size: 16:9
math: katex
style: |
  section {
    font-size: 28px;
    padding: 60px;
  }
  h1 {
    color: #1a365d;
  }
  h2 {
    color: #2c5282;
    border-bottom: 2px solid #2c5282;
    padding-bottom: 8px;
  }
  .formula {
    text-align: center;
    font-size: 48px;
    margin: 40px 0;
  }
  .small {
    font-size: 22px;
    color: #666;
  }
  table {
    margin: 0 auto;
  }
---

<!-- _class: lead -->
<!-- _paginate: false -->

# Linear Regression

### Fit a straight line. Predict a number.

<div class="formula">

$y = m \cdot x + b$

</div>

<span class="small">**y** prediction · **m** slope · **x** input · **b** intercept</span>

<br>

<span class="small">Vitor Machado</span>

---

## Use Case — Real Estate Pricing

**Problem:** predict house price from square meters.

| Square Meters | Price (USD) |
|:-------------:|:-----------:|
|      50       |   150,000   |
|      70       |   200,000   |
|      80       |   230,000   |
|     100       |   300,000   |
|     120       |   350,000   |

The model learns:

$$\underbrace{price}_{y} = m \cdot \underbrace{sqm}_{x} + b$$

<span class="small">Other applications: sales forecasting, crop yield estimation, stock trends.</span>

---

## Finding the line

**Goal:** pick $m$ (slope) and $b$ (intercept) that minimize the sum of squared errors.

<br>

$$\underbrace{m}_{\text{slope}} = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{n}(x_i - \bar{x})^2} \qquad \underbrace{b}_{\text{intercept}} = \bar{y} - m \cdot \bar{x}$$

<br>

<span class="small">**Slope** = covariance(x, y) / variance(x) — how steeply the line rises.
**Intercept** = where the line crosses the y-axis; anchors it through the means $(\bar{x}, \bar{y})$.</span>

---

<style scoped>
section { font-size: 22px; padding: 40px 60px; }
section p { margin: 8px 0; }
table { font-size: 18px; margin: 8px auto; }
h2 { margin-bottom: 12px; }
</style>

## Worked Example

**Step 1 — compute the means** ($\bar{x}$, $\bar{y}$ are the averages of x and y):

$\bar{x} = (50+70+80+100+120)/5 = 84 \qquad \bar{y} = (150+200+230+300+350)/5 = 246$

**Step 2 — build the sums:**

|   | $x_i$ | $y_i$ | $x_i - \bar{x}$ | $y_i - \bar{y}$ | $(x_i-\bar{x})(y_i-\bar{y})$ | $(x_i-\bar{x})^2$ |
|:-:|:-----:|:-----:|:---------------:|:---------------:|:----------------------------:|:-----------------:|
|   |  50   |  150  |      −34        |       −96       |            3,264             |       1,156       |
|   |  70   |  200  |      −14        |       −46       |              644             |         196       |
|   |  80   |  230  |       −4        |       −16       |               64             |          16       |
|   | 100   |  300  |       16        |        54       |              864             |         256       |
|   | 120   |  350  |       36        |       104       |            3,744             |       1,296       |
| **Σ** |   |   |                 |                 |          **8,580**           |     **2,920**     |

**Step 3 — plug into the formulas:**

$m = 8{,}580 \,/\, 2{,}920 \approx 2.94 \qquad b = 246 - 2.94 \times 84 \approx -0.82$

---

## Code Walkthrough

<style scoped>
section { font-size: 22px; padding: 40px 60px; }
pre { font-size: 18px; line-height: 1.35; }
</style>

```java
double meanX = sumX / sampleCount;
double meanY = sumY / sampleCount;

double covariance = 0, variance = 0;
for (int i = 0; i < sampleCount; i++) {
    double xDeviation = x[i] - meanX;            // (x_i - x̄)
    covariance += xDeviation * (y[i] - meanY);
    variance  += xDeviation * xDeviation;
}

double slope     = covariance / variance;        // covariance(x,y) / variance(x)
double intercept = meanY - slope * meanX;        // anchor through (x̄, ȳ)
```

<span class="small">The formulas from slide 3 → these 10 lines.</span>

---

## Evaluating the fit

$$MSE = \frac{1}{n}\sum_{i=1}^{n}(\hat{y}_i - y_i)^2$$

<span class="small">Average squared error. Smaller is better.</span>

<br>

$$R^2 = 1 - \frac{\sum(y_i - \hat{y}_i)^2}{\sum(y_i - \bar{y})^2}$$

<span class="small">$R^2 = 1.0$ is perfect, $0$ means no better than predicting the mean.</span>

---

<!-- _class: lead -->

# Live Demo

### Watch the line fit in real time

---

## Pros

- **Interpretable by design** — each coefficient has a literal meaning; required in regulated domains
- **Trains in milliseconds** — closed-form solution, no GPU, millions of rows on a laptop
- **The baseline everything must beat** — if a complex model barely wins, the complexity isn't justified

---

## Cons

- **Assumes a linear relationship** — if the truth curves, the bias is structural; no amount of data fixes it
- **Outliers dominate the fit** — squared loss lets one extreme point pull the entire line
- **Extrapolation fails silently** — predicts confidently far outside the training range, with no warning

---

<!-- _class: lead -->

## Takeaway

### Always try linear first.

Use **$R^2$** and **MSE** to judge the fit.
Reach for something richer only when the data is clearly non-linear.
