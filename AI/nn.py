import numpy as np

# -----------------------
# Data
# -----------------------
X = np.array([[1], [2], [3], [4]])
y = np.array([[2], [4], [6], [8]])

# -----------------------
# Initialize weights
# -----------------------
np.random.seed(0)
w1 = np.random.randn(1, 3)  # input → hidden (1 → 3)
b1 = np.zeros((1, 3))

w2 = np.random.randn(3, 1)  # hidden → output (3 → 1)
b2 = np.zeros((1, 1))

lr = 0.01

# -----------------------
# Activation function
# -----------------------
def relu(x):
    return np.maximum(0, x)

def relu_derivative(x):
    return (x > 0).astype(float)

# -----------------------
# Training loop
# -----------------------
for epoch in range(1000):

    # ---- Forward ----
    z1 = X.dot(w1) + b1
    a1 = relu(z1)

    z2 = a1.dot(w2) + b2
    y_pred = z2

    # ---- Loss ----
    loss = np.mean((y - y_pred) ** 2)

    # ---- Backward ----
    dloss = 2 * (y_pred - y) / y.shape[0]

    dw2 = a1.T.dot(dloss)
    db2 = np.sum(dloss, axis=0, keepdims=True)

    da1 = dloss.dot(w2.T)
    dz1 = da1 * relu_derivative(z1)

    dw1 = X.T.dot(dz1)
    db1 = np.sum(dz1, axis=0, keepdims=True)

    # ---- Update ----
    w2 -= lr * dw2
    b2 -= lr * db2

    w1 -= lr * dw1
    b1 -= lr * db1

    if epoch % 100 == 0:
        print(f"Epoch {epoch}, Loss: {loss:.4f}")

# -----------------------
# Test
# -----------------------
print("\nPredictions:")
print(y_pred)