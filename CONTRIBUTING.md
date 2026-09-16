# Contributing to TalentLens AI

We welcome contributions to improve explainability, skill ontology coverage, and algorithmic fairness!

## Guidelines
1. **Evidence-First Rule**: Any modification to the scoring or matching algorithms must produce traceable evidence. No feature may output an unexplained black-box percentage.
2. **Deterministic Fallbacks**: Server AI capabilities must support deterministic offline fallbacks so the app remains fully functional even in restricted environments.
3. **No Demographics in Scoring**: Strictly avoid introducing any demographic, age, geographic, or pedigree proxies into candidate matching logic.
