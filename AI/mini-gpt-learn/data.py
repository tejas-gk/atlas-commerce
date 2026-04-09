import json
import torch
from config import block_size, batch_size

chars, stoi, itos = [], {}, {}

def build_tokenizer(text):
    global chars, stoi, itos
    chars = sorted(set(text))
    stoi = {c:i for i,c in enumerate(chars)}
    itos = {i:c for c,i in stoi.items()}

def encode(s):
    return [stoi.get(c, 0) for c in s]

def decode(l):
    return ''.join([itos[i] for i in l])

def load_data():
    with open("dataset.json") as f:
        dataset = json.load(f)

    base = "User:\nAssistant:\nContext:\n"

    text = base
    for item in dataset:
        text += f"User: {item['input']}\nAssistant: {item['output']}\n"

    build_tokenizer(text)

    tokens = torch.tensor(encode(text), dtype=torch.long)

    split = int(0.9 * len(tokens))
    return tokens[:split], tokens[split:], len(chars)

def get_batch(data):
    bs = min(block_size, len(data)-1)

    ix = torch.randint(0, len(data)-bs, (batch_size,))
    x = torch.stack([data[i:i+bs] for i in ix])
    y = torch.stack([data[i+1:i+bs+1] for i in ix])

    return x, y