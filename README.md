# CRO Landing Page — Mortgage Scenario Lab

Vue 3, Vite and Tailwind CSS landing page with an accessible mortgage scenario comparator. It extends the portfolio with the requested JSON-backed offer model. **Bank names, rates and limits are fictitious demonstration fixtures.**

```sh
npm install
npm test
npm run build
npm run dev
```

Node.js 22.12+ or a compatible newer release. Open the printed local URL (normally http://127.0.0.1:4175). No bank, Supabase, advertising or CRM credentials are needed.

## Implemented behavior

- Reactive comparison of three JSON scenarios, sorted by unrounded initial payment.
- Per-offer LTV and DSTI, including existing debt and a post-fixed-rate scenario.
- Remaining-principal amortization and a new payment for the remaining term; zero-interest and fully fixed term boundaries handled explicitly.
- Editable Euribor **assumption**, clearly distinguished from a current market rate or forecast.
- Local proposal-summary dialog and text download. No contact collection, external submission or approval decision.
- Analytics consent disabled by default. Only allowlisted interaction/experiment fields can enter dataLayer; income, debt and property/loan values do not.
- Headline variants, responsive layout, semantic forms, keyboard focus and an accessible native dialog.

## Rate data and verification

[market-rates.json](datasets/market-rates.json) contains the three illustrative rates from the brief under fictitious bank labels. The Bankinter example was described as fixed for one year while using a mixed-rate type; the fixture consistently models a mixed rate with a one-year fixed phase.

`VITE_MARKET_DATA_MODE=demo` is the default. In `verified` mode, synthetic rows are excluded and each row needs HTTPS provenance, a verification time no more than seven days old, validity and representative TAEG/MTIC values. These metadata gates are project policy, not a certification of an offer's correctness. A production adapter must also associate the representative example and all relevant conditions with the correct scenario. No current Portuguese bank offers have been verified by this project.

The comparator orders **initial principal-and-interest payments**, not the overall cheapest credit. TAEG/MTIC cannot be calculated from TAN alone. No scores, approvals or claims of “best offers in the market” are produced. The supplied LTV/DSTI caps are only demo constraints; bank underwriting requires additional criteria and authorized review.

## Calculation

For monthly interest rate `r`, principal `P` and total months `n`, the installment is `P × r / (1 − (1+r)^−n)`, with `P/n` at zero interest. For mixed rates, this estimates the starting installment under standard constant-payment amortization. After the fixed phase, the code computes the outstanding balance and recalculates over the remaining term using the editable Euribor assumption plus spread.

Insurance, fees, tax, bonuses, stress-test rules and subsequent variable-rate revisions are outside that estimate. Display rounding never drives the calculations or filters.

[Experiment plan](docs/experiment-plan.md) · [Automated offer review pipeline](https://github.com/ninjaDX27/ai-workflow-automation) · [Portfolio](https://github.com/ninjaDX27/ninjaDX27)

Primary reference: [Banco de Portugal — mortgage interest rates](https://clientebancario.bportugal.pt/pt-pt/taxas-de-juro-no-credito-habitacao), including mixed-rate phases, TAEG, MTIC and the FINE. This repository implements a mathematical demonstration, not an actual banking offer.
