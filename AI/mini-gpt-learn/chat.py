# chat.py
import torch
import torch.nn.functional as F

from model import GPT
from data import load_data, encode, decode
from config import *
from rag import load_knowledge, build_index, search

train_data, val_data, vocab_size = load_data()

model = GPT(vocab_size).to(device)
model.load_state_dict(torch.load("model.pt", map_location=device))
model.eval()

docs = load_knowledge()
docs_tokens, vectors, idf = build_index(docs)

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

    results = search(user, docs, docs_tokens, vectors, idf)
    context = "\n".join(results)

    prompt = f"Context:\n{context}\n\nUser: {user}\nAssistant:"

    tokens = torch.tensor([encode(prompt)], dtype=torch.long).to(device)

    out = generate(tokens, 120)
    result = decode(out[0].tolist())

    if "Assistant:" in result:
        result = result.split("Assistant:")[-1]

    print("AI:", result.strip(), "\n")