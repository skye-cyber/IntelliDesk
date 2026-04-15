#!/usr/bin/env sh

# If not running under bash/zsh, re-execute with bash
if [ -z "$BASH_VERSION" ] && [ -z "$ZSH_VERSION" ]; then
    exec bash "$0" "$@"
fi

# Create directories of not found
echo "* Prep directories ..."
# mkdir -p ~/.IntelliDesk/{.store,.config,.cache,locks,sessions,skills}
mkdir -p ~/.IntelliDesk/.store
mkdir -p ~/.IntelliDesk/.config
mkdir -p ~/.IntelliDesk/.cache
mkdir -p ~/.IntelliDesk/locks
mkdir -p ~/.IntelliDesk/sessions
mkdir -p ~/.IntelliDesk/skills

# Copy buit-in skills user base dir
echo "* Copy skills"
cp -r ./src/core/Skills ~/.IntelliDesk/skills/ >> /dev/null

echo "✔️ Bone"
