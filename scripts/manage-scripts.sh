#!/bin/bash
#
# manage-scripts.sh — Upload, delete, or list presentation scripts
#
# Scripts live in public/scripts/ and are served as static downloads
# from the presentation gallery. This tool handles the file operations
# and git commit/push so Vercel redeploys automatically.
#
# Usage:
#   ./scripts/manage-scripts.sh list
#       List all scripts currently in public/scripts/
#
#   ./scripts/manage-scripts.sh delete <filename>
#       Remove a script from the repo (e.g. delete pd-session-script.html)
#
#   ./scripts/manage-scripts.sh upload <source-file> [<filename>]
#       Copy a file into public/scripts/ and commit.
#       If filename is omitted, the source file's name is used.
#       (e.g. upload ~/Downloads/new-script.pdf pd-session-script.pdf)
#
#   ./scripts/manage-scripts.sh replace <source-file> <filename>
#       Delete an existing script and upload a new one in its place.
#       (e.g. replace ~/Downloads/updated-script.html pd-session-script.html)
#
# Examples:
#   ./scripts/manage-scripts.sh list
#   ./scripts/manage-scripts.sh delete pd-session-script.html
#   ./scripts/manage-scripts.sh upload ~/Documents/my-presentation-notes.pdf
#   ./scripts/manage-scripts.sh replace ~/Downloads/v2-script.html pd-session-script.html
#

set -euo pipefail

SCRIPTS_DIR="public/scripts"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo -e "${RED}Error: Not inside a git repository${NC}"
  exit 1
}

mkdir -p "$SCRIPTS_DIR"

show_help() {
  sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

list_scripts() {
  echo "Scripts in $SCRIPTS_DIR/:"
  echo ""
  if [ -z "$(ls -A "$SCRIPTS_DIR" 2>/dev/null)" ]; then
    echo "  (none)"
    return
  fi
  for f in "$SCRIPTS_DIR"/*; do
    [ -f "$f" ] || continue
    size=$(du -h "$f" | cut -f1)
    name=$(basename "$f")
    echo "  $name  ($size)"
  done
}

commit_and_push() {
  local msg="$1"
  git add "$SCRIPTS_DIR/"
  if git diff --cached --quiet; then
    echo -e "${YELLOW}No changes to commit.${NC}"
    return
  fi
  git commit -m "$msg" 
  git push origin HEAD
  echo -e "${GREEN}Pushed. Vercel will redeploy shortly.${NC}"
}

delete_script() {
  local filename="$1"
  local filepath="$SCRIPTS_DIR/$filename"
  if [ ! -f "$filepath" ]; then
    echo -e "${RED}Error: $filename not found in $SCRIPTS_DIR/${NC}"
    list_scripts
    exit 1
  fi
  git rm "$filepath"
  commit_and_push "chore: remove script $filename"
  echo -e "${GREEN}Deleted $filename${NC}"
  echo ""
  echo -e "${YELLOW}Reminder: update scriptUrl in src/pages/Gallery.jsx if needed.${NC}"
}

upload_script() {
  local source="$1"
  local filename="${2:-$(basename "$source")}"
  local dest="$SCRIPTS_DIR/$filename"

  if [ ! -f "$source" ]; then
    echo -e "${RED}Error: source file '$source' not found${NC}"
    exit 1
  fi

  cp "$source" "$dest"
  echo "Copied: $source -> $dest"
  commit_and_push "chore: add script $filename"
  echo -e "${GREEN}Uploaded $filename${NC}"
  echo ""
  echo -e "${YELLOW}Reminder: set scriptUrl to '/scripts/$filename' in src/pages/Gallery.jsx${NC}"
}

replace_script() {
  local source="$1"
  local filename="$2"
  local dest="$SCRIPTS_DIR/$filename"

  if [ ! -f "$source" ]; then
    echo -e "${RED}Error: source file '$source' not found${NC}"
    exit 1
  fi

  if [ -f "$dest" ]; then
    git rm "$dest" 2>/dev/null || rm -f "$dest"
  fi
  cp "$source" "$dest"
  commit_and_push "chore: replace script $filename"
  echo -e "${GREEN}Replaced $filename${NC}"
}

# --- Main ---
case "${1:-}" in
  list)
    list_scripts
    ;;
  delete)
    [ -z "${2:-}" ] && { echo "Usage: $0 delete <filename>"; exit 1; }
    delete_script "$2"
    ;;
  upload)
    [ -z "${2:-}" ] && { echo "Usage: $0 upload <source-file> [<filename>]"; exit 1; }
    upload_script "$2" "${3:-}"
    ;;
  replace)
    [ -z "${2:-}" ] || [ -z "${3:-}" ] && { echo "Usage: $0 replace <source-file> <filename>"; exit 1; }
    replace_script "$2" "$3"
    ;;
  ""|-h|--help|help)
    show_help
    ;;
  *)
    echo "Unknown command: $1"
    show_help
    exit 1
    ;;
esac
