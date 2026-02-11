# Overview

Project Wampus website frontend

# Dependencies

* npm
* React

# Quick start

Clone into the repo locally then:

## To run the frontend:

1. Run `cd project-wampus/pjw-frontend`
2. Run `npm install`
3. Run `npm run dev`

## To run the backend:

After creating a `.env` from `.env.example` and filling out the information:

1. Run `cd project-wampus/pjw-backend`
2. Run `npm install`
3. Run `npx prisma generate`
4. Run `npm run dev`

To update the prisma schema to reflect changes in the database:
1. Run `npx prisma db pull`
2. Run `npx prisma generate`