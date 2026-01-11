# Event Management Ticketing System

A **full-stack Event Management and Ticketing System** built with:

- **Backend:** AWS Lambda (simulated locally with LocalStack), Node.js, Express  
- **Database:** DynamoDB  
- **Storage:** S3  
- **Frontend:** Next.js  

Users can **register/login**, **manage events**, **buy tickets**, and **view analytics**. Admins can manage users, and organizers can manage events. The backend is fully **serverless-ready** and deployable to AWS.

---

## Features

- User authentication: register, login, forgot/reset password  
- User profile management: view/update profile  
- Event CRUD (Create, Read, Update, Delete)  
- Event status updates (active, draft, cancelled)  
- Bulk operations on events (status update & deletion)  
- Event & ticket tracking  
- Analytics & statistics  
- File uploads to S3 via pre-signed URLs  
- Admin dashboard to list users  
- Fully serverless-ready backend simulated via Express + LocalStack  

---

## Technologies Used

- **Frontend:** Next.js, React, TypeScript  
- **Backend:** Node.js, Express, AWS Lambda (simulated locally)  
- **Database:** DynamoDB (via LocalStack)  
- **Storage:** Amazon S3 (via LocalStack)  
- **Local Dev Tools:** Docker Desktop, LocalStack, AWS SDK  

---

## Getting Started

Follow these steps to run the project locally safely.

### 1. Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) v18+  
- [npm](https://www.npmjs.com/) (comes with Node.js)  
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (required for LocalStack)  
- [Git](https://git-scm.com/)  

> **Note:** LocalStack requires Docker Desktop to be running.

---

### 2. Clone the repository

```bash
git clone https://github.com/your-username/event-management-ticketing.git
cd event-management-ticketing


# Install dependencies
## Backend dependencies
cd backend
npm install

## Frontend dependencies
cd ../frontend
npm install

4. Start LocalStack

From the project root:

docker-compose up -d localstack


Alternative without docker-compose:

docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack

5. Configure environment variables

Copy .env.example to .env in both backend and frontend folders:

AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:4566
DYNAMODB_ENDPOINT=http://localhost:4566
S3_ENDPOINT=http://localhost:4566

## Initialize DynamoDB tables and test data

Run the automated setup script from the backend:

cd backend/functions/src/utils
node init-localstack.ts


This script will:

Create Users, Events, and Tickets tables

Insert sample users, events, and tickets

Verify password hashes securely using bcrypt

Test Login Credentials (all passwords: password123)

Admin: admin@events.com

Organizer: organizer@events.com

Attendee 1: john.doe@example.com

Attendee 2: jane.smith@example.com

7. Run the Backend
cd backend
npm run dev


Backend will run on: http://localhost:3001

8. Run the Frontend
cd frontend
npm run dev


Frontend will run on: http://localhost:3000