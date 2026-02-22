# Professional Node.js Project

A scalable and modular Node.js backend using Express, Mongoose, and a Repository-Service-Controller pattern.

## Prerequisites

- Node.js (v16+)
- MongoDB

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables:
   Copy `.env.example` to `.env` and fill in your details.
   ```bash
   cp .env.example .env
   ```

3. Run the application:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Folder Structure

- `src/config`: App configuration and database setup.
- `src/modules`: Domain-driven modular structure (User, Course).
- `src/middlewares`: Global and custom middlewares.
- `src/utils`: Reusable helper functions.
- `src/constants`: Application-wide constants.
- `src/routes`: API route definitions.
