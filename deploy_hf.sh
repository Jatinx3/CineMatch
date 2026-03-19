#!/bin/bash
# 🚀 CineMatch Hugging Face Deployer
# This script injects the HF frontmatter temporarily ONLY for the push,
# keeping your GitHub README 100% clean and beautiful!

# 1. Create a backup of your clean README
cp README.md /tmp/README_bak.md

# 2. Create the temporary deploy template
cat << 'EOF' > README.md
---
title: CineMatch API
emoji: 🎬
colorFrom: blue
colorTo: indigo
sdk: docker
---

EOF

# 4. Append original README text
cat /tmp/README_bak.md >> README.md

echo "Adding temporary metadata to Git index..."
git checkout -b hf-build-node 2>/dev/null || git checkout hf-build-node
git add README.md
git commit -m "Deploying to Hugging Face with SDK weights"

echo "Pushing build-node to Hugging Face Spaces..."
git push -f hf hf-build-node:main

# 5. Revert back to and restore clean branch
echo "Cleaning up local workspace..."
git checkout main
git branch -D hf-build-node
mv /tmp/README_bak.md README.md

echo "✅ Deployed successfully! Your GitHub README remains untouched."
