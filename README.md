Linear regression is building a model that can estimate a linear relationship between one or more independent variables.

`
y = mx + b
`
where **m** is the slope of the line, **x** is the independent variable, **b** is the **y line** interceptor.
this will give **y** which is the dependent variable.

$$m = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{n}(x_i - \bar{x})^2}$$

$$b = \bar{y} - m\bar{x}$$

where $\bar{x}$ is the mean of x values and $\bar{y}$ is the mean of y values. 

This formula serves as the best fit line for the graph we want to create that approximates the values that we have, 
whenever we have a new value to predict.

So we have a dataset that will be used to training and testing the model.

The training data is used to calculate the predictions of the model and the slope. 
The testing data is used to test the model accuracy.

Common slipping is to use 80% of dataset for training and 20% for testing.
