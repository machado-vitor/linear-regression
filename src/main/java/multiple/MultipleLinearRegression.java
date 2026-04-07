package multiple;

// Multiple linear regression via normal equation: β = (XᵀX)⁻¹Xᵀy
// Adds intercept column automatically.
public class MultipleLinearRegression {

    public static MultipleModel fit(double[][] features, double[] y) {
        if (features.length != y.length) throw new IllegalArgumentException("mismatched rows");
        if (features.length == 0) throw new IllegalArgumentException("empty data");
        int sampleCount = features.length;
        int featureCount = features[0].length;

        // prepend a column of 1s for the intercept
        double[][] withIntercept = new double[sampleCount][featureCount + 1];
        for (int i = 0; i < sampleCount; i++) {
            withIntercept[i][0] = 1.0;
            System.arraycopy(features[i], 0, withIntercept[i], 1, featureCount);
        }

        // normal equation: β = (XᵀX)⁻¹Xᵀy
        double[][] transposed = transpose(withIntercept);
        double[][] gramMatrix = multiply(transposed, withIntercept);       // XᵀX
        double[][] gramInverse = invert(gramMatrix);                       // (XᵀX)⁻¹
        double[][] projectionMatrix = multiply(gramInverse, transposed);   // (XᵀX)⁻¹Xᵀ

        double[] coefficients = new double[featureCount + 1];
        for (int j = 0; j < coefficients.length; j++) {
            double sum = 0;
            for (int i = 0; i < sampleCount; i++) sum += projectionMatrix[j][i] * y[i];
            coefficients[j] = sum;
        }
        return new MultipleModel(coefficients);
    }

    // --- matrix math ---

    private static double[][] transpose(double[][] m) {
        int rows = m.length, cols = m[0].length;
        double[][] t = new double[cols][rows];
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++)
                t[j][i] = m[i][j];
        return t;
    }

    private static double[][] multiply(double[][] left, double[][] right) {
        int rows = left.length, cols = right[0].length, shared = left[0].length;
        double[][] result = new double[rows][cols];
        for (int row = 0; row < rows; row++)
            for (int col = 0; col < cols; col++)
                for (int k = 0; k < shared; k++)
                    result[row][col] += left[row][k] * right[k][col];
        return result;
    }

    // Gauss-Jordan elimination — builds [matrix | identity] then row-reduces
    private static double[][] invert(double[][] matrix) {
        int size = matrix.length;
        double[][] augmented = new double[size][2 * size];

        // set up [matrix | identity]
        for (int i = 0; i < size; i++) {
            System.arraycopy(matrix[i], 0, augmented[i], 0, size);
            augmented[i][i + size] = 1.0;
        }

        for (int col = 0; col < size; col++) {
            // partial pivot — swap in the row with the largest value in this column
            int bestRow = col;
            for (int row = col + 1; row < size; row++)
                if (Math.abs(augmented[row][col]) > Math.abs(augmented[bestRow][col])) bestRow = row;

            double[] swapTemp = augmented[col];
            augmented[col] = augmented[bestRow];
            augmented[bestRow] = swapTemp;

            double pivotValue = augmented[col][col];
            if (Math.abs(pivotValue) < 1e-15)
                throw new ArithmeticException("singular matrix — features may be linearly dependent");

            // scale pivot row so pivot becomes 1
            for (int j = 0; j < 2 * size; j++) augmented[col][j] /= pivotValue;

            // eliminate this column in all other rows
            for (int row = 0; row < size; row++) {
                if (row == col) continue;
                double scale = augmented[row][col];
                for (int j = 0; j < 2 * size; j++) augmented[row][j] -= scale * augmented[col][j];
            }
        }

        // extract the right half — that's the inverse
        double[][] inverse = new double[size][size];
        for (int i = 0; i < size; i++) System.arraycopy(augmented[i], size, inverse[i], 0, size);
        return inverse;
    }
}
