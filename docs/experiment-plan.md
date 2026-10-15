# Experiment plan

Hypothesis: explaining the fixed-rate period and the post-fixed scenario before the CTA increases completed, informed proposal requests.

Variant A uses the headline “A próxima casa começa com contas claras.” Variant B uses “Uma prestação clara. Uma decisão informada.” Preview B with `?variant=b`. This is a deterministic preview selector, not a production randomization service.

Primary production outcome: backend-accepted proposal requests / eligible assigned visitors. Diagnostics: comparison completion and CTA preparation. Guardrails: invalid submission rate, qualified-lead rate, page performance and consent behavior. The local CTA is `proposal_request_prepared`, not `generate_lead`, because it creates no CRM record.

Before launch: implement stable random assignment, define the unit and eligibility window, obtain a baseline and perform a sample-size calculation for a chosen minimum detectable effect. Register duration and stopping rules; test sample-ratio mismatch. Do not claim uplift from this demo. Join campaign/CRM outcomes on an opaque event/lead ID, not browser financial inputs.
