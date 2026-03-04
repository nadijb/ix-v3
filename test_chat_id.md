# AI Chat — Frontend Test Guide

Make sure the frontend is running (`npm run dev`) and the n8n `IX v3 - AI Chat` workflow is active.

---

## How to use

1. Open the app in the browser
2. The baseline screen loads automatically (6 IX elements)
3. Type a message in the chat bar at the bottom and press Enter
4. The chat panel expands above the input showing your message + the AI reply
5. If the AI returns an element, it slides into an **AI Suggested** section below the main screen

---

## Test messages

| Type what you want | Expected result |
|---|---|
| `"What is my dental benefit limit?"` | Text bubble — mentions SAR 8,000 |
| `"How much will I pay out of pocket for medicine?"` | Element 7 — Co-Insurance Rules table |
| `"Do I have a co-pay for hospital visits?"` | Element 7 — Co-Insurance Rules table |
| `"Find me a dentist near me"` | Element 8 — Provider Finder with 3 providers |
| `"Which hospitals accept my insurance?"` | Element 8 — Provider Finder |
| `"What is the status of my claim?"` | Element 9 — Claims Tracker (CLM-2024-00891) |
| `"When will I get my reimbursement?"` | Element 9 — Claims Tracker |
| `"Do I need pre-approval for my root canal?"` | Text bubble — explains the SAR 1,000 threshold |

---

## What to verify

- **Text response** → bubble appears in the chat panel, no element added to screen
- **Element response** → bubble appears + a chip shows `🛡️ Co-Insurance Rules · added below ↓` (or 📍 / 📋) + the element renders in the **AI Suggested** section
- **Same element twice** → the element refreshes in place (re-animates) instead of duplicating
- **Minimize** → tap the `—` button to collapse the panel; a pill shows the message count and lets you reopen
- **Session continuity** → ask a follow-up like `"And how much is left?"` — the AI references the previous answer

---

## Quick multi-turn script

```
1. "How much of my dental benefit have I used?"   → text
2. "Find me a dentist"                            → Provider Finder appears on screen
3. "What about my co-pay for medicine?"           → Co-Insurance Rules appears on screen
4. "Check my claim"                               → Claims Tracker appears on screen
5. "Find me a dentist again"                      → Provider Finder refreshes (re-animates, no duplicate)
```

After step 4 you should see 3 elements in the AI Suggested section below the 6 IX elements.
