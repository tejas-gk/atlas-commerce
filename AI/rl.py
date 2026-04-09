import numpy as np
import random

# -----------------------
# Environment
# -----------------------
states = 4  # positions: 0 → 3
actions = ["left", "right"]

def step(state, action):
    if action == "right":
        next_state = min(state + 1, states - 1)
    else:
        next_state = max(state - 1, 0)

    reward = 1 if next_state == 3 else 0
    done = next_state == 3

    return next_state, reward, done

# -----------------------
# Q Table
# -----------------------
Q = np.zeros((states, len(actions)))

# -----------------------
# Hyperparameters
# -----------------------
alpha = 0.1   # learning rate
gamma = 0.9   # discount factor
epsilon = 0.2 # exploration

# -----------------------
# Training Loop
# -----------------------
episodes = 500

for episode in range(episodes):
    state = 0  # start position

    while True:
        # ε-greedy policy
        if random.uniform(0, 1) < epsilon:
            action_idx = random.randint(0, 1)
        else:
            action_idx = np.argmax(Q[state])

        action = actions[action_idx]

        # Take step
        next_state, reward, done = step(state, action)

        # Q-learning update
        Q[state, action_idx] += alpha * (
            reward + gamma * np.max(Q[next_state]) - Q[state, action_idx]
        )

        state = next_state

        if done:
            break

# -----------------------
# Test Agent
# -----------------------
state = 0
path = [state]

while state != 3:
    action_idx = np.argmax(Q[state])
    action = actions[action_idx]
    state, _, _ = step(state, action)
    path.append(state)

print("Learned Path:", path)
print("Q Table:\n", Q)