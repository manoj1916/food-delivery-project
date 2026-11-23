# Food Delivery Platform – MERN Stack

A full-stack food delivery application built using the MERN stack (MongoDB, Express.js, React.js and Node.js). The platform supports customers, restaurant owners, delivery partners and administrators with role-based access control.

## Project Overview

The Food Delivery Platform provides a complete workflow for browsing restaurants, managing food menus, adding items to a cart, placing orders, processing simulated payments and tracking deliveries.

It includes separate dashboards and functionality for different user roles.

## Technology Stack

### Frontend
- React.js 19
- Vite
- React Router DOM
- Redux Toolkit
- Axios
- Lucide React
- CSS

### Backend
- Node.js
- Express.js 5
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- bcryptjs
- dotenv
- CORS

## User Roles

| Role | Responsibilities |
|---|---|
| Customer | Browse restaurants, view menus, manage cart, place orders, make simulated payments and view order history |
| Restaurant Owner | Manage restaurants, food categories, menu items and customer orders; assign delivery partners |
| Delivery Partner | View assigned deliveries and update delivery status |
| Admin | Manage users, restaurants, orders, delivery partners and role applications |

## Main Features

### Authentication and Authorization
- User registration and login
- Password hashing using bcryptjs
- JWT-based authentication
- Protected routes
- Role-based access control
- Restaurant owner and delivery partner role applications
- Admin approval and rejection of applications

### Customer Features
- Browse restaurants
- View restaurant details and menus
- Search food items
- Add items to cart
- Update item quantities
- Remove cart items
- Place orders
- Simulated payment processing
- View previous orders
- Track order status
- Receive notifications
- Submit restaurant reviews

### Restaurant Owner Features
- Create and manage restaurants
- Update restaurant information
- Add and delete menu categories
- Add, update and delete food items
- View restaurant orders
- Update order status
- View available delivery partners
- Assign delivery partners to orders

### Delivery Partner Features
- View assigned deliveries
- Update delivery status
- Manage delivery availability

### Admin Features
- Admin dashboard
- View and manage users
- Delete users
- View all orders
- View restaurant owner and delivery partner applications
- Approve or reject applications
- Manage restaurants
- View delivery partners

## Project Structure

```text
MERN/
│
├── food-delivery-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── food-delivery-platform/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   ├── createAdmin.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas account)
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project:

```bash
cd MERN
```

### 2. Setup the Backend

Navigate to the backend folder:

```bash
cd food-delivery-platform
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Replace the placeholder values with your actual MongoDB connection string and a strong, private JWT secret.

Start the backend development server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

Check the backend health endpoint:

```text
GET http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "Food Delivery Backend is running!"
}
```

### 3. Setup the Frontend

Open another terminal and navigate to the frontend folder:

```bash
cd MERN/food-delivery-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the frontend development server:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal, typically:

```text
http://localhost:5173
```

Open that URL in your browser.

## API Overview

All backend API routes use the `/api/v1` base path.

| Module | Base Endpoint | Purpose |
|---|---|---|
| Authentication | `/auth` | Registration, login and profile |
| Admin | `/admin` | Administrative operations |
| Restaurants | `/restaurants` | Restaurant management |
| Menu | `/restaurants` | Menu category and food item management |
| Food | `/search` | Food search and restaurant menu retrieval |
| Cart | `/cart` | Cart operations |
| Orders | `/orders` | Order creation and order history |
| Delivery | `/` | Delivery assignments and status updates |
| Payments | `/payments` | Simulated payment processing |
| Reviews | `/reviews` | Restaurant reviews |
| Notifications | `/notifications` | User notifications |

### Important API Endpoints

**Authentication**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile`

**Restaurants**
- `GET /api/v1/restaurants`
- `GET /api/v1/restaurants/:id`
- `POST /api/v1/restaurants`
- `PUT /api/v1/restaurants/:id`
- `DELETE /api/v1/restaurants/:id`

**Cart**
- `POST /api/v1/cart/items`
- `GET /api/v1/cart`
- `PUT /api/v1/cart/items/:foodItemId`
- `DELETE /api/v1/cart/items/:foodItemId`
- `DELETE /api/v1/cart`

**Orders**
- `POST /api/v1/orders`
- `GET /api/v1/orders/my-orders`
- `GET /api/v1/orders/:id`
- `DELETE /api/v1/orders/:id`

**Payments**
- `POST /api/v1/payments/:orderId/simulate`

**Reviews**
- `POST /api/v1/reviews`
- `GET /api/v1/reviews/restaurant/:restaurantId`

Note: Some endpoints require JWT authentication and specific user roles.

## Authentication Flow

1. A user registers with their details.
2. The backend validates the submitted information.
3. The password is hashed using bcryptjs.
4. User information is saved in MongoDB.
5. During login, the backend verifies the password.
6. A JWT is generated after successful authentication.
7. The frontend sends the token in the Authorization header for protected API requests.
8. Backend middleware verifies the token and checks user permissions.

## Database

MongoDB is used as the application's database, with Mongoose providing schema definitions, validation and database operations.

Main models include:

- User
- Restaurant
- Cart
- Order
- Review
- Notification

The application uses ObjectId references between related documents and embedded menu and order-item data where appropriate.

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm install` | Install backend dependencies |
| `npm run dev` | Start development server using Nodemon |
| `npm start` | Start backend server |

### Frontend

| Command | Description |
|---|---|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start Vite development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint |

## Environment Variables

Never commit actual environment variables or secrets to GitHub.

Backend `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Make sure both `.env` files are included in their respective `.gitignore` files.

## Future Improvements

- Integrate a real payment gateway.
- Add real-time order tracking.
- Implement email and SMS notifications.
- Add automated backend testing.
- Improve production security and token management.
- Deploy frontend and backend separately.

## Author

Developed as a full-stack MERN Stack Food Delivery Platform project.

**Technologies:** MongoDB | Express.js | React.js | Node.js
