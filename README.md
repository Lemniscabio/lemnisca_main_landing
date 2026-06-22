# Lemnisca — main landing & site repo

This repository holds Lemnisca's website(s) and related customer data. The **current,
live site lives in [`landing_v3_next/`](landing_v3_next/)** — everything else at the root
is either preserved history or customer data.

> ## 📖 Read the Repo Guide first
>
> The full architecture, route map, decision log, and playbooks (reports extraction,
> Torch/Thrust landing merges, CSS isolation contract, conventions) are documented in
> **[`landing_v3_next/docs/REPO_GUIDE.md`](landing_v3_next/docs/REPO_GUIDE.md)**.
>
> **Read it in full before making any non-trivial change.** It is the single source of
> truth for what this repo is and how to extend it safely.

## What's in this repo

| Path | What it is |
|---|---|
| **[`landing_v3_next/`](landing_v3_next/)** | **The current Next.js app**, deployed at `lemnisca.bio`. Serves the marketing homepage, product landing pages (`/tune`, `/thrust`, `/torch`), and the gated reports dashboard (`/reports`). This is where all active work happens — see its [`docs/REPO_GUIDE.md`](landing_v3_next/docs/REPO_GUIDE.md). |
| `landing_v1/` | The **first-ever Lemnisca website**. Preserved for posterity only — not maintained, not deployed. |
| `jananom_data/` | **Jananom (JNM) customer data** — their raw fermentation data (CSV exports), plus the Python toolkit (`fermentation_toolkit.py`) and analysis notebook (`JNM_Fermentation_Analysis.ipynb`) used to process it into the Jananom report. |

## Notes

- The gated `/reports` product (auth, customer data, AVIRA chat) currently lives inside
  `landing_v3_next/` but is slated to be **extracted into its own repo** — see
  REPO_GUIDE.md §9.
- Internal-only report **PDF export** tooling lives on the branch
  `internal/report-pdf-export` and **must not be merged** — see REPO_GUIDE.md §8.
