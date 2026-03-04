const text = `
hello world
this is ai
javascript is powerful
`

const transitions = {}

for (let i = 0; i < text.length - 2; i++) {
    const key = text[i] + text[i + 1]
    const next = text[i + 2]

    if (!transitions[key]) {
        transitions[key] = {}
    }

    if (!transitions[key][next]) {
        transitions[key][next] = 0
    }

    transitions[key][next]++
}

// Convert to probabilities
const probabilities = {}

for (const key in transitions) {
    const total = Object.values(transitions[key])
        .reduce((a, b) => a + b, 0)

    probabilities[key] = {}

    for (const nextChar in transitions[key]) {
        probabilities[key][nextChar] =
            transitions[key][nextChar] / total
    }
}

function sample(probObj) {
    const r = Math.random()
    let cumulative = 0

    for (const char in probObj) {
        cumulative += probObj[char]
        if (r < cumulative) return char
    }
}

function generate(start, length = 200) {
    let result = start
    let current = start

    for (let i = 0; i < length; i++) {
        if (!probabilities[current]) break
        const next = sample(probabilities[current])
        result += next
        current = result.slice(-2)
    }

    return result
}

console.log(generate("he", 200))