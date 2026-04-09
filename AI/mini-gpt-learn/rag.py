import math
from collections import Counter

def tokenize(text):
    return text.lower().split()

def compute_tf(tokens):
    tf = Counter(tokens)
    total = len(tokens)
    return {w: c/total for w,c in tf.items()}

def compute_idf(docs_tokens):
    N = len(docs_tokens)
    idf = {}

    words = set(w for doc in docs_tokens for w in doc)

    for w in words:
        count = sum(1 for doc in docs_tokens if w in doc)
        idf[w] = math.log((N+1)/(count+1)) + 1

    return idf

def compute_tfidf(tf, idf):
    return {w: tf[w]*idf.get(w,0) for w in tf}

def cosine(v1, v2):
    common = set(v1) & set(v2)
    dot = sum(v1[w]*v2[w] for w in common)

    n1 = math.sqrt(sum(v*v for v in v1.values()))
    n2 = math.sqrt(sum(v*v for v in v2.values()))

    if n1 == 0 or n2 == 0:
        return 0

    return dot/(n1*n2)

def build_index(docs):
    docs_tokens = [tokenize(d) for d in docs]
    idf = compute_idf(docs_tokens)

    vectors = []
    for tokens in docs_tokens:
        tf = compute_tf(tokens)
        vectors.append(compute_tfidf(tf, idf))

    return docs_tokens, vectors, idf

def search(query, docs, docs_tokens, vectors, idf, top_k=3):
    q_tokens = tokenize(query)
    q_tf = compute_tf(q_tokens)
    q_vec = compute_tfidf(q_tf, idf)

    scores = []
    for i, vec in enumerate(vectors):
        score = cosine(q_vec, vec)
        scores.append((score, docs[i]))

    scores.sort(reverse=True)

    return [doc for score, doc in scores[:top_k] if score > 0]