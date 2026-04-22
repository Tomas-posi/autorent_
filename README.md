## AutoRent
AutoRent is a full-stack vehicle rental management application designed to streamline the daily operations of a car rental business. It provides a web interface for managing employees, customers, vehicles, and rentals, backed by a modular REST API.

## Overview

This project was built to demonstrate practical full-stack development skills in:

- Frontend development with React and TypeScript
- Backend development with NestJS
- Relational data modeling with PostgreSQL
- Authentication and role-based access control
- CRUD workflows for business entities
- Clean separation between client and server applications
- Tech Stack
- Frontend
- React
- TypeScript
- Vite
- Backend
- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- Class Validator
- Main Features
- Employee authentication
- Role-based access control
- Vehicle management
- Customer management
- Rental management
- Admin employee registration
- Vehicle availability and status tracking
- Project Structure
- autorent-frontend → client-side application
- autorent-api → server-side API

This separation makes the project easier to maintain, scale, and deploy.

## Running the Project Locally
- Clone the repository
- git clone https://github.com/Tomas-posi/autorent_.git
- Install backend dependencies
- cd autorent_
- cd autorent-api
- npm install
- Install frontend dependencies
- cd ../autorent-frontend
- npm install
- Configure environment variables
- Create a .env file inside autorent-api and set the required database and JWT variables.
- Start the backend
- cd ../autorent-api
- npm run start:dev
- Start the frontend
- cd ../autorent-frontend
- npm run dev








