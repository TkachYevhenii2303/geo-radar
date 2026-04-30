---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
allowed-tools: Read, Grep, Glop, Bash
model: sonnet
argument-hint: [optinal which language to use, default English]
keep-coding-instructions: true
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life, but also use technical explenation.
2. **Draw a diagram [OPTIONAL]**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens and how it works in $1
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
