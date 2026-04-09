import torch
from model import GPT
from data import load_data, get_batch
from config import *

train_data, val_data, vocab_size = load_data()

model = GPT(vocab_size).to(device)
opt = torch.optim.AdamW(model.parameters(), lr=learning_rate)

for step in range(max_iters):

    xb, yb = get_batch(train_data)
    xb, yb = xb.to(device), yb.to(device)

    _, loss = model(xb, yb)

    opt.zero_grad()
    loss.backward()
    opt.step()

    if step % 100 == 0:
        print("loss:", loss.item())

torch.save(model.state_dict(), "model.pt")
print("✅ model saved")