# Store Rating Platform

## 🚀 Project Description
This is a comprehensive full-stack web application designed as a platform for users to rate and review stores. The application features a robust, role-based access control system, providing distinct functionalities for three types of users: System Administrators, Normal Users, and Store Owners.

Built with a modern tech stack, this project demonstrates best practices in both frontend and backend development, including secure authentication, RESTful API design, and a dynamic, component-based user interface.

## ✨ Key Features
## 👤 User Roles & Permissions
* System Administrator: The superuser with full control over the platform.
* Normal User: The standard user who can register, log in, and rate stores.
* Store Owner: A user linked to a specific store, with access to its performance data.

## ✅ Implemented Functionalities
### System Administrator

* Full-featured dashboard with statistics on total users, stores, and ratings.
* Ability to add new users with any role (Admin, Normal User, or Store Owner).
* Ability to add new stores to the platform.
* View complete, filterable lists of all users and stores with all required details.
* Secure logout functionality.

### Normal User
* Public registration and secure login.
* Ability to update their own password after logging in via a settings modal.
* A dedicated dashboard to view a list of all registered stores.
* Search functionality to filter stores by name or address.
* A dynamic 5-star rating system to submit and modify ratings for stores.
* Clear display of a store's overall rating and the user's own submitted rating.
* Secure logout functionality.

### Store Owner
* Secure login and ability to update their own password.
* A dedicated dashboard showing key metrics for their specific store.
* View their store's current average rating.
* View a detailed list of all ratings their store has received, including which user submitted them.
* Secure logout functionality.

## 🛠️ Tech Stack
* Frontend: React.js
* Backend: Node.js with Express.js
* Database: PostgreSQL
* Authentication: JSON Web Tokens (JWT)
* Password Hashing: bcrypt

## 🏁 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

- 1. Prerequisites
Before you begin, ensure you have the following installed on your system:

Node.js and npm (LTS version recommended)

### PostgreSQL

- 2. Database Setup
Open pgAdmin (or your preferred PostgreSQL client).

Create a new database and name it store_ratings.

Open the Query Tool for your new database.

Copy and paste the entire content of the schema.sql script below and execute it. This will create all the necessary tables and types.

- 3. Backend Setup
Navigate to the backend directory in your terminal:

```
cd backend

Install the required npm packages:

npm install
```

Create a new file named .env in the root of the backend folder. This file will hold your secret credentials. Copy the content of .env.example into it and fill in your details:

.env.example
```
# PostgreSQL Database Connection
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=store_ratings
DB_PASSWORD=your_database_password
DB_PORT=5432
```

- 4. Frontend Setup
Open a new terminal and navigate to the frontend directory:

```
cd frontend

Install the required npm packages:

npm install
```

## 🖥️ Running the Application
You need to have two terminals open simultaneously to run the full stack.

Start the Backend Server:
In your backend terminal, run:
```
npm run dev
```

The server should start on http://localhost:3001. You will see a message confirming the database connection.

Start the Frontend Application:
In your frontend terminal, run:
```
npm start
```

This will automatically open your default web browser to http://localhost:3000.

## Made By
Yash Kumar
