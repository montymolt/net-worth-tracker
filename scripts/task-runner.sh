#!/usr/bin/env bash
# Simple task runner: runs tasks in tasks.json sequentially
set -e
DIR=$(cd "$(dirname "$0")/.." && pwd)
TASKS_FILE="$DIR/tasks.json"
jq -c '.[]' "$TASKS_FILE" | while read -r task; do
  id=$(echo "$task" | jq -r '.id')
  script=$(echo "$task" | jq -r '.script')
  desc=$(echo "$task" | jq -r '.description')
  echo "Running $id - $desc"
  if [ -x "$DIR/$script" ]; then
    (cd "$DIR" && "$DIR/$script")
  else
    echo "No executable script $script — skipping (create it to run)"
  fi
done

echo "All tasks processed."
