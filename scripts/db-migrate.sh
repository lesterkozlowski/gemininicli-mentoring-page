#!/bin/bash

# Check if LOCAL_DEV is set to true in .env
if [ -f ".env" ] && grep -q "LOCAL_DEV=true" .env; then
    wrangler d1 migrations apply mentoring-db --local
else
    wrangler d1 migrations apply mentoring-db
fi