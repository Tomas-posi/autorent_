# AutoRent

AutoRent is a full-stack vehicle rental management application designed to streamline the daily operations of a car rental business.  
It provides a clean web interface for managing employees, customers, vehicles, and rentals, backed by a modular REST API.

## Overview

This project was built to demonstrate practical full-stack development skills in:

- Frontend development with React and TypeScript
- Backend development with NestJS
- Relational data modeling with PostgreSQL
- Authentication and role-based access control
- CRUD workflows for business entities
- Clean separation between client and server applications

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router

### Backend
- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- Class Validator

## Main Features

- Employee authentication
- Role-based access control
- Vehicle management
- Customer management
- Rental management
- Admin employee registration
- Vehicle availability and status tracking
- Vehicle document management
- Vehicle history tracking

## Business Modules

### Authentication
Employees can sign in securely and access protected routes based on their role.

### Employees
The system supports employee records and role assignment, including administrative users.

### Vehicles
Users can create, edit, list, and delete vehicles.  
Vehicle records include key details such as plate number, brand, model, year, VIN, fuel type, status, and daily rental price.

### Customers
Users can manage customer information, including personal and contact details.

### Rentals
The application allows users to register rentals by linking a customer to a vehicle, defining start and end dates, and tracking rental status.

## Architecture

This repository is organized into two main applications:

- `autorent-frontend` → client-side application
- `autorent-api` → server-side API

This separation makes the project easier to maintain, scale, and deploy.

## Running the Project Locally

## 1. Clone the repository
  ```bash
  git clone https://github.com/Tomas-posi/autorent_.git
## 2. Install backend dependencies
  cd autorent_
  cd autorent-api
  npm install
## 3. Install Frontend dependencies
  cd ../autorent-frontend
  npm install
## 4. Configure environment variables
Create the required .env files for the backend with your PostgreSQL credentials and application settings.
## 5. Start the backend
cd ../autorent-api
npm run start:dev
## 6. Start the frontend
cd ../autorent-frontend
npm run dev









