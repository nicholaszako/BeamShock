#!/usr/bin/env bash

# Colors
RED="\033[31m"
NC="\033[0m"

cd bridge

# No venv > first-time setup
if ! [ -e ".venv/bin/activate" ]; then
    echo "venv not found. Running setup."

    # Check for python
    if [ -x "$(command -v python3)" ]; then
        python=($(command -v python3))
    elif [ -x "$(command -v python)" ]; then
        python=($(command -v python))
    else
        echo -e "{$RED}Python not found!{$NC}" >&2
        exit 1
    fi

    $python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi

source .venv/bin/activate
python -m main
