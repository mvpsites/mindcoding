# Card artwork

All card art lives HERE, inside the repo — self-hosted, never hot-linked
from external CDNs (those links expire and break the live site).

Workflow:
1. Generate artwork using /docs/artwork-prompts.md
2. Save as art/<card-id>.jpg (e.g. art/fool.jpg), ~800px wide is plenty
3. In src/data/cards.js set:  art: "art/fool.jpg"
The placeholder engraved sigil is replaced automatically.
