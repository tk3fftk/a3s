---
description: "Pull Request Templateに合わせたPull Requestを作成します"
---

# Create Pull Request

Open Pull Request for current changes in GitHub Cloud.

- [MUST] Follow [Pull Request Template](/.github/PULL_REQUEST_TEMPLATE.md) that exists `{repository_root}/.github/PULL_REQUEST_TEMPLATE.md`
  - Add commit hash to each description in Japanese in `What does this PR do?` section.
    - Use `git log -p origin/main...{current_branch}` to obtain diffs and commit hashes.
- Read the checklist in the template and verify changes are fulfilled the checklist.
- Use `gh pr create --draft` command.
