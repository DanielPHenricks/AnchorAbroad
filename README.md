# AnchorAbroad

Anchor Abroad is a web application designed for prospective Vanderbilt study abroad students. It provides an interactive map of study abroad locations along with detailed information about each program, current student experiences, and activities. Additionally, it allows users to connect with program alumni, helping students make more informed decisions about where to study abroad.

## Setup instructions

### Backend:
1) `cd backend`
2) `python -m venv .venv`
3) `source .venv/bin/activate`
4) `pip install -r requirements.txt`
5) `python manage.py migrate`: creates the db migrations 
6) `python manage.py loadprograms`
7) `python manage.py runserver`

### Frontend: 
1) `cd frontend`
2) `npm i`
3) `npm start`

### How to create a superuser?
To create a superuser to test the admin page of Django, run the command:
```
python manage.py createsuperuser --username=[your username here] --email=[email]
```
Then navigate to `localhost:8000/backend` to see your changes!

## Code coverage

Backend: `coverage report --fail-under=50 --include="programs/*" --omit="programs/fixing.py,programs/scraper.py,programs/management/*,programs/test_*.py"`