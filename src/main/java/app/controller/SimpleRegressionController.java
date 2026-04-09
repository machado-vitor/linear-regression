package app.controller;

import app.dto.PredictRequest;
import app.dto.PredictResponse;
import app.dto.SimpleFitRequest;
import app.dto.SimpleFitResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import simple.LinearRegression;
import simple.SimpleModel;

@RestController
@RequestMapping("/api/simple")
public class SimpleRegressionController {

    @PostMapping("/fit")
    public SimpleFitResponse fit(@RequestBody SimpleFitRequest request) {
        SimpleModel model = LinearRegression.fit(request.x(), request.y());

        double[] predictions = new double[request.x().length];
        for (int i = 0; i < request.x().length; i++) {
            predictions[i] = model.predict(request.x()[i]);
        }

        return new SimpleFitResponse(
                model.slope(),
                model.intercept(),
                model.rSquared(request.x(), request.y()),
                model.mse(request.x(), request.y()),
                predictions
        );
    }

    @PostMapping("/predict")
    public PredictResponse predict(@RequestBody PredictRequest request) {
        SimpleModel model = new SimpleModel(request.slope(), request.intercept());
        return new PredictResponse(model.predict(request.x()));
    }
}
