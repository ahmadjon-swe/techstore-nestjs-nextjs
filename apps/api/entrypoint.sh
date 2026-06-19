#!/bin/sh
set -e
/app/packages/db/node_modules/.bin/prisma migrate deploy
exec "$@"
