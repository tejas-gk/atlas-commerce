let w = Math.random()
let b = Math.random()
const learningRate = 0.01
console.log("Initial w:", w)
console.log("Initial b:", b)
const data = [
    { x: 1, y: 50 }, // x is the number of hours studied, y is the score
    { x: 2, y: 55 },
    { x: 3, y: 65 },
    { x: 4, y: 70 },
    { x: 5, y: 80 }
]

function predict(x) {
    return w * x + b // w is the weight (slope) and b is the bias (intercept) x is the input (hours studied) and the output is the predicted score
}

function train() {
    for (let epoch = 0; epoch < 1000; epoch++) { // epochs are the number of times we go through the entire dataset
        let totalError = 0

        for (const point of data) {
            const yPred = predict(point.x)
            const error = yPred - point.y // error is the difference between the predicted value and the actual value

            totalError += error ** 2 // we use the squared error to ensure that we are always working with positive values and to penalize larger errors more than smaller ones

            // gradients
            const dw = error * point.x // dw is the gradient with respect to w, which tells us how much we need to adjust w to reduce the error. It is calculated as the error multiplied by the input x.
            const db = error

            // update
            w -= learningRate * dw // we update w by subtracting the product of the learning rate and the gradient dw. This moves w in the direction that reduces the error.
            b -= learningRate * db // we update b by subtracting the product of the learning rate and the gradient db. This moves b in the direction that reduces the error.
        }

        if (epoch % 100 === 0) {
            console.log(`Epoch ${epoch}, Error: ${totalError}`) // we log the error every 100 epochs to see how the model is improving over time. The total error should decrease as the model learns from the data.
        }
    }
}

train()

console.log("Final w:", w)
console.log("Final b:", b)