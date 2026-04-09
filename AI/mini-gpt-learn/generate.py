# generate.py
import torch
import torch.nn.functional as F
from model import GPT
from tokenizer import encode, decode
from config import *

vocab_size = 50257

model = GPT(vocab_size).to(device)
model.load_state_dict(torch.load("model.pt", map_location=device))
model.eval()

def generate(idx, max_new_tokens=100):
    for _ in range(max_new_tokens):
        idx_cond = idx[:, -block_size:]

        logits, _ = model(idx_cond)
        logits = logits[:, -1, :]

        probs = F.softmax(logits, dim=-1)
        next_token = torch.multinomial(probs, 1)

        idx = torch.cat((idx, next_token), dim=1)

    return idx

while True:
    user = input("You: ")
    prompt = f"User: {user}\nAssistant:"
    tokens = torch.tensor([encode(prompt)]).to(device)

    out = generate(tokens)
    print("AI:", decode(out[0].tolist()))