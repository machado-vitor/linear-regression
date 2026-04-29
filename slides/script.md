# Presentation Script — Linear Regression (5 min)

Total budget **5:00**. Each section has a time cap. If you go long on one, cut a sentence from the next.

---

## 1. Title — 15s

> "Linear regression. The simplest model that actually does something useful — and it fits in one equation: **y = m·x + b**. Pick a slope and an intercept, predict a number. I'm Vitor."

*(advance)*

---

## 2. Use Case — Real Estate — 20s

> "The motivating problem: predict house price from square meters. Five houses, 50 to 120 m², prices from 150K to 350K. The model learns **price = m · sqm + b**. Once we have those two numbers, we can price *any* new house."

*(advance)*

---

## 3. Finding the line — 30s

> "How do we find the line? We pick m and b that **minimize the sum of squared errors** — the gap between each prediction and the actual value, squared, summed.
>
> The closed-form answer: **slope is covariance over variance** — how x and y move together, normalized by how x spreads. **Intercept anchors the line through the means**."

*(advance)*

---

## 4. Worked Example — 50s

> "Let's actually compute it. Means are **84** square meters and **246** thousand dollars.
>
> *[point at table]* For each point we take the deviation from the mean. This column is x-deviation times y-deviation, this one is x-deviation squared. Sum them: **8,580** and **2,920**.
>
> Plug in: slope is 8,580 over 2,920 — about **2.94**. Intercept is 246 minus 2.94 times 84 — about **−0.82**.
>
> Our model: **price = 2.94 · sqm − 0.82**."

*(advance — skip Step 1 explanation, just say the means)*

---

## 5. Code Walkthrough — 40s

> "In code, this is the entire fit logic.
>
> Compute the two means. Loop through the points, take the deviation from the mean of x — the **x_i minus x-bar** from the formula. Add into the running covariance and variance.
>
> At the end, **slope is covariance over variance** — exactly the formula. **Intercept anchors through the mean**. Ten lines."

*(advance)*

---

## 6. Evaluating the fit — 30s

> "How do we know the fit is any good? Two numbers.
>
> **MSE** — mean squared error. Smaller is better. No fixed scale.
>
> **R-squared** — goes 0 to 1. **One** is perfect. **Zero** means the model is no better than just guessing the average. This is the one to watch."

*(advance — go straight into demo)*

---

## 7. Live Demo — 60s ★

**Pre-demo state:** browser open, real-estate dataset loaded, line at the optimal fit. MSE and R² panel visible.

> **[0–10s] The optimal fit.**
> "Here's the optimal fit on the real-estate data. R-squared is [~0.99] — almost perfect — MSE is low. This is the line the math gave us."
>
> **[10–25s] Make the slope too steep.**
> *[drag slope up]*
> "Now I'll tilt the line steeper than it should be. Watch — **MSE jumps**, **R² drops**. The line is just visibly worse."
>
> **[25–40s] Make the slope too shallow.**
> *[drag slope down past optimal]*
> "Same thing the other way — too shallow. **MSE up, R² down**. There's exactly one slope that minimises both, and the formulas find it directly."
>
> **[40–55s] Add an outlier.**
> *[reset line, then add an extreme point — e.g., a 200 m² house priced at 50K]*
> "Here's the kicker. Add one bad data point — and the optimal line *bends* to chase it. One outlier wrecks the fit. We'll see that on the cons slide."
>
> **[55–60s] Reset.**
> *[reset to clean dataset + optimal line — leave it on screen as you advance]*

*(advance)*

---

## 8. Pros — 25s

> "Why use it.
> **Interpretable** — every coefficient has a literal meaning. Required in finance, medicine, anywhere regulated.
> **Trains in milliseconds** — closed form, no GPU.
> **It's the baseline everything must beat** — if your fancy model barely wins, the complexity isn't justified."

*(advance)*

---

## 9. Cons — 25s

> "Why not.
> **Assumes linearity** — if the truth curves, no amount of data fixes the bias.
> **Outliers dominate** — you just saw it.
> **Extrapolation fails silently** — predict a 5,000 m² house, you get a confident, totally wrong number, with no warning."

*(advance)*

---

## 10. Takeaway — 15s

> "Always try linear first. Use **R²** and **MSE** to judge the fit. Reach for something richer only when the data is clearly non-linear.
>
> Thanks."

---

## Rehearsal notes

- **Time-test once with a stopwatch.** This script lands at ~5:00 if you don't pause for breath between sentences. Real delivery adds 5–10%. **First rehearsal target: 4:45.**
- **Demo prep:** open the browser tab, load the dataset, position the line at optimal *before* you start talking on slide 6. The transition from slide 6 → 7 should be *immediate*.
- **Pre-decide the three demo gestures** (steep / shallow / outlier). Don't browse, don't experiment live.
- **If you're over time:** drop the Pros line about regulated domains, drop the Cons line about extrapolation, or compress the Worked Example to "we get m ≈ 2.94, b ≈ −0.82" without walking the table.
- **Slide 4 trick:** skip Step 1 verbally — just say the two means. The slide shows the work; you don't need to.
