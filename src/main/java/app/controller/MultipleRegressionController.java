package app.controller;

import app.dto.MultipleFitRequest;
import app.dto.MultipleFitResponse;
import app.dto.MultiplePredictRequest;
import app.dto.PredictResponse;
import multiple.MultipleLinearRegression;
import multiple.MultipleModel;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/multiple")
public class MultipleRegressionController {

    @PostMapping("/fit")
    public MultipleFitResponse fit(@RequestBody MultipleFitRequest request) {
        MultipleModel model = MultipleLinearRegression.fit(request.features(), request.y());

        return new MultipleFitResponse(
                model.coefficients(),
                model.rSquared(request.features(), request.y()),
                model.mse(request.features(), request.y()),
                request.featureNames(),
                model.predict(request.features())
        );
    }

    @PostMapping("/predict")
    public PredictResponse predict(@RequestBody MultiplePredictRequest request) {
        MultipleModel model = new MultipleModel(request.coefficients());
        return new PredictResponse(model.predict(request.features()));
    }
}
