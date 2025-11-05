#!/bin/bash

# Helper script for running TheGuild batch attestation script
# Usage: ./run_batch_attestations.sh <csv_file> [dry_run]

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <csv_file> [dry_run]"
    echo "  csv_file: Path to CSV file with attestations"
    echo "  dry_run: Set to 'true' for dry run (default: false)"
    exit 1
fi

CSV_FILE="$1"
DRY_RUN="${2:-false}"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: CSV file '$CSV_FILE' not found"
    exit 1
fi

# Load CSV data into environment variable
export CSV_DATA=$(cat "$CSV_FILE")

# Set dry run mode
if [ "$DRY_RUN" = "true" ]; then
    export DRY_RUN=true
    echo "Running in DRY RUN mode..."
else
    unset DRY_RUN
    echo "Running in PRODUCTION mode..."
fi

# Check for required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable not set"
    exit 1
fi

if [ -z "$RPC_URL" ]; then
    echo "Error: RPC_URL environment variable not set"
    exit 1
fi

# Run the script
if [ "$DRY_RUN" = "true" ]; then
    forge script script/EmitAttestationsCsv.s.sol:EmitAttestationsCsv \
        --rpc-url "$RPC_URL"
else
    forge script script/EmitAttestationsCsv.s.sol:EmitAttestationsCsv \
        --rpc-url "$RPC_URL" \
        --broadcast
fi