function sigmoid(x) {
    return 1 / (1 + Math.exp(-x))
}

function sigmoidDerivative(x) {
    return x * (1 - x)
}

// Training data (XOR)
const X = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1]
]

const y = [[0], [1], [1], [0]]

// Initialize weights randomly
let weights1 = [
    [Math.random(), Math.random()],
    [Math.random(), Math.random()]
]

let weights2 = [
    [Math.random()],
    [Math.random()]
]

const learningRate = 0.5

function dot(a, b) {
    return a.map(row =>
        b[0].map((_, colIndex) =>
            row.reduce((sum, value, rowIndex) =>
                sum + value * b[rowIndex][colIndex], 0)
        )
    )
}

function transpose(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]))
}

function subtract(a, b) {
    return a.map((row, i) =>
        row.map((val, j) => val - b[i][j])
    )
}

function multiply(a, b) {
    return a.map((row, i) =>
        row.map((val, j) => val * b[i][j])
    )
}

function scalarMultiply(matrix, scalar) {
    return matrix.map(row =>
        row.map(val => val * scalar)
    )
}

function apply(matrix, fn) {
    return matrix.map(row =>
        row.map(val => fn(val))
    )
}

// Training loop
for (let epoch = 0; epoch < 100000; epoch++) {
    // Forward pass
    let hidden = apply(dot(X, weights1), sigmoid)
    let output = apply(dot(hidden, weights2), sigmoid)

    // Error
    let error = subtract(y, output)

    // Backprop
    let dOutput = multiply(error, apply(output, sigmoidDerivative))
    let dHidden = multiply(
        dot(dOutput, transpose(weights2)),
        apply(hidden, sigmoidDerivative)
    )

    // Update weights
    weights2 = subtract(
        weights2,
        scalarMultiply(dot(transpose(hidden), dOutput), -learningRate)
    )

    weights1 = subtract(
        weights1,
        scalarMultiply(dot(transpose(X), dHidden), -learningRate)
    )
}

// Test
let hidden = apply(dot(X, weights1), sigmoid)
let output = apply(dot(hidden, weights2), sigmoid)

console.log("Final Output:")
console.log(output)