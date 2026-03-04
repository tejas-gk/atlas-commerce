const text = `
hello world
this is ai
javascript is powerful
`

// Count transitions
const transitions = {}

for (let i = 0; i < text.length - 1; i++) {
    const current = text[i]
    const next = text[i + 1]

    if (!transitions[current]) {
        transitions[current] = {}
    }

    if (!transitions[current][next]) {
        transitions[current][next] = 0
    }

    transitions[current][next]++
}

// Convert counts → probabilities
const probabilities = {}

for (const char in transitions) {
    const total = Object.values(transitions[char])
        .reduce((a, b) => a + b, 0)

    probabilities[char] = {}

    for (const nextChar in transitions[char]) {
        probabilities[char][nextChar] =
            transitions[char][nextChar] / total
    }
}

// Random choice based on probability
function sample(probObj) {
    const r = Math.random()
    let cumulative = 0

    for (const char in probObj) {
        cumulative += probObj[char]
        if (r < cumulative) return char
    }
}

// Generate text
function generate(startChar, length = 100) {
    let result = startChar
    let current = startChar

    for (let i = 0; i < length; i++) {
        if (!probabilities[current]) break
        const next = sample(probabilities[current])
        result += next
        current = next
    }

    return result
}

console.log(generate("h", 200))