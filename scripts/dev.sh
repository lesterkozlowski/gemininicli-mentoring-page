#!/bin/bash

# Check if LOCAL_DEV is set to true in .env
if [ -f ".env" ] && grep -q "LOCAL_DEV=true" .env; then
    wrangler pages dev --compatibility-date=2024-01-01 --local -- vite
else
    wrangler pages dev --compatibility-date=2024-01-01 -- vite
fi