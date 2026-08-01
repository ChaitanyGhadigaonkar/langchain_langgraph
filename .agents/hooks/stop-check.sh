#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Read stdin into a variable
PAYLOAD=$(cat)
TERMINATION_REASON=$(echo "$PAYLOAD" | jq -r '.terminationReason // empty')
ERROR=$(echo "$PAYLOAD" | jq -r '.error // empty')

DECISION="allow"
REASON=""

# Only run checks if the agent thinks it has successfully completed the task
if [[ "$TERMINATION_REASON" == "model_stop" ]] && [[ "$ERROR" == "" || "$ERROR" == "null" ]]; then
  if [ -d "frontend" ]; then
    cd frontend || exit 0
    
    # Run lint and capture output in memory
    LINT_OUTPUT=$(npm run lint 2>&1)
    if [ $? -ne 0 ]; then
      DECISION="continue"
      # Grab the first few lines of the error to provide as reason
      ERROR_MSG=$(echo "$LINT_OUTPUT" | head -n 10 | tr '\n' ' ')
      REASON="Linting failed during task completion. Please fix these errors before stopping: $ERROR_MSG"
    else
      # Run format
      npm run format >/dev/null 2>&1
    fi
  fi
fi

jq -n --arg decision "$DECISION" --arg reason "$REASON" '{decision: $decision, reason: $reason}'
