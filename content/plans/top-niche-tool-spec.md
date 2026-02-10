# Micro-Tool Spec — Sales Call Intelligence Picker

## Purpose
Client-side interactive tool that maps buyer constraints to a short vendor shortlist and a recommended evaluation path.

## URL
`/tools/sales-call-intelligence-picker`

## Inputs
- Team size: 1-5, 6-20, 21-100, 100+
- CRM: HubSpot, Salesforce, Pipedrive, Other, None
- Primary goal: coaching quality, deal visibility, call QA, ramp speed
- Deployment tolerance: low, medium, high
- Budget preference: lean starter, balanced, premium

## Output
- Top 2-3 fit archetypes (not absolute claims)
- “Best fit if…” bullets
- “Avoid if…” bullets
- Suggested next-step page links (money pages)

## JS Behavior
- Static rule matrix in JSON (`src/data/tool-rules/sales-call-intelligence.json`)
- Deterministic scoring function, no external APIs
- On submit:
  - rank vendors/archetypes
  - render shortlist card + rationale
  - show CTA to matching comparison page

## Compliance Constraints
- Do not show prices.
- Do not make outcome guarantees.
- Keep language factual and criteria-based.

## QA Checklist
- Works with JS enabled (required), graceful fallback text if disabled.
- Mobile layout tested at 375px width.
- No console errors.
- Links route to existing pages only.
