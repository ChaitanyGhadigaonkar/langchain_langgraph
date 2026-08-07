#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Read stdin into a variable
PAYLOAD=$(cat)

# Extract TargetFile using jq (works for write_to_file, replace_file_content, multi_replace_file_content)
TARGET_FILE=$(echo "$PAYLOAD" | jq -r '.toolCall.args.TargetFile // empty')

if [ -n "$TARGET_FILE" ] && [[ "$TARGET_FILE" == *"/frontend/"* ]]; then
  # We are in the root directory (where hooks.json is)
  cd frontend || exit 0
  
  # Check if the file still exists (wasn't deleted)
  if [ -f "$TARGET_FILE" ]; then
    # Run prettier
    pnpm exec prettier --write "$TARGET_FILE" >/dev/null 2>&1
    # Run eslint
    pnpm exec eslint --fix "$TARGET_FILE" >/dev/null 2>&1
  fi
fi

# PostToolUse contract requires empty JSON object on stdout
echo "{}"
