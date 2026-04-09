import torch
import torch.nn as nn
import torch.nn.functional as F

# -----------------------
# Dataset
# -----------------------
text = """
User: write python function to add two numbers
Assistant: def add(a, b): return a + b

User: write python function to multiply numbers
Assistant: def mul(a, b): return a * b

User: reverse a string in python
Assistant: def reverse(s): return s[::-1]

User: check even number python
Assistant: def is_even(n): return n % 2 == 0

User: sum of list python
Assistant: def sum_list(lst): return sum(lst)
"""

chars = sorted(list(set(text)))
vocab_size = len(chars)

stoi = {ch: i for i, ch in enumerate(chars)}
itos = {i: ch for ch, i in stoi.items()}

def encode(s): return [stoi[c] for c in s]
def decode(l): return ''.join([itos[i] for i in l])

data = torch.tensor(encode(text), dtype=torch.long)

# -----------------------
# Hyperparameters
# -----------------------
block_size = 64
batch_size = 8
n_embd = 64
n_head = 4
n_layer = 2

# -----------------------
# Batch
# -----------------------
def get_batch():
    ix = torch.randint(len(data) - block_size, (batch_size,))
    x = torch.stack([data[i:i+block_size] for i in ix])
    y = torch.stack([data[i+1:i+block_size+1] for i in ix])
    return x, y

# -----------------------
# Attention Head
# -----------------------
class Head(nn.Module):
    def __init__(self, head_size):
        super().__init__()
        self.key = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)
        self.register_buffer("tril", torch.tril(torch.ones(block_size, block_size)))

    def forward(self, x):
        B,T,C = x.shape
        k = self.key(x)
        q = self.query(x)

        wei = q @ k.transpose(-2,-1) * (C ** -0.5)
        wei = wei.masked_fill(self.tril[:T,:T] == 0, float('-inf'))
        wei = F.softmax(wei, dim=-1)

        v = self.value(x)
        return wei @ v

# -----------------------
# MultiHead
# -----------------------
class MultiHead(nn.Module):
    def __init__(self):
        super().__init__()
        head_size = n_embd // n_head
        self.heads = nn.ModuleList([Head(head_size) for _ in range(n_head)])
        self.proj = nn.Linear(n_embd, n_embd)

    def forward(self, x):
        return self.proj(torch.cat([h(x) for h in self.heads], dim=-1))

# -----------------------
# FeedForward
# -----------------------
class FeedForward(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4*n_embd),
            nn.ReLU(),
            nn.Linear(4*n_embd, n_embd)
        )

    def forward(self, x):
        return self.net(x)

# -----------------------
# Block
# -----------------------
class Block(nn.Module):
    def __init__(self):
        super().__init__()
        self.sa = MultiHead()
        self.ff = FeedForward()
        self.ln1 = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)

    def forward(self, x):
        x = x + self.sa(self.ln1(x))
        x = x + self.ff(self.ln2(x))
        return x

# -----------------------
# GPT Model
# -----------------------
class GPT(nn.Module):
    def __init__(self):
        super().__init__()
        self.token_emb = nn.Embedding(vocab_size, n_embd)
        self.pos_emb = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[Block() for _ in range(n_layer)])
        self.ln_f = nn.LayerNorm(n_embd)
        self.head = nn.Linear(n_embd, vocab_size)

    def forward(self, idx, targets=None):
        B,T = idx.shape

        tok = self.token_emb(idx)
        pos = self.pos_emb(torch.arange(T))
        x = tok + pos

        x = self.blocks(x)
        x = self.ln_f(x)

        logits = self.head(x)

        if targets is None:
            return logits, None

        loss = F.cross_entropy(logits.view(-1, vocab_size), targets.view(-1))
        return logits, loss

    def generate(self, idx, max_new_tokens=100):
        for _ in range(max_new_tokens):
            idx_cond = idx[:, -block_size:]
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :]
            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, 1)
            idx = torch.cat((idx, next_token), dim=1)
        return idx

# -----------------------
# Train
# -----------------------
model = GPT()
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)

for step in range(3000):
    xb, yb = get_batch()
    _, loss = model(xb, yb)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if step % 300 == 0:
        print("loss:", loss.item())

# -----------------------
# Chat
# -----------------------
while True:
    prompt = input("You: ")
    context = torch.tensor([encode("User: " + prompt + "\nAssistant: ")])
    out = model.generate(context, 100)
    print("AI:", decode(out[0].tolist()))