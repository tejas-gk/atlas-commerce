import torch
import torch.nn.functional as F

from model import GPT
from data import load_data, encode, decode
from config import *

from rag import build_index, search
from indexer import load_codebase

# tokenizer + model
train_data, _, vocab_size = load_data()

model = GPT(vocab_size).to(device)
model.load_state_dict(torch.load("model.pt", map_location=device))
model.eval()

# codebase indexing
docs = load_codebase("codebase")
docs_tokens, vectors, idf = build_index(docs)

def generate(idx, max_new_tokens=80):
    for _ in range(max_new_tokens):
        idx_cond = idx[:, -block_size:]

        logits, _ = model(idx_cond)
        logits = logits[:, -1, :]

        probs = F.softmax(logits, dim=-1)
        next_token = torch.multinomial(probs, 1)

        idx = torch.cat((idx, next_token), dim=1)

    return idx

print("🔥 Copilot Lite Ready\n")

while True:
    user = input("Code> ")

    results = search(user, docs, docs_tokens, vectors, idf)

    if results:
        print("\n💡 Best Match:\n", results[0], "\n")
    continue

    # 🔥 MAIN MAGIC: RETURN CODE DIRECTLY
    if context.strip():
        print("\n💡 Suggestion:\n", context, "\n")
        continue

    # fallback model
    prompt = f"User: {user}\nAssistant:"
    tokens = torch.tensor([encode(prompt)], dtype=torch.long).to(device)

    out = generate(tokens)
    result = decode(out[0].tolist())

    if "Assistant:" in result:
        result = result.split("Assistant:")[-1]

    print("\n🤖 AI:\n", result.strip(), "\n")