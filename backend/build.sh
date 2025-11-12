#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate

# Load programs data (if command exists)
python manage.py loadprograms || echo "loadprograms command not found or failed"