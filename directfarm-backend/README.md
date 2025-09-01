# DirectFarm Backend API

A comprehensive backend server for DirectFarm - connecting farmers with buyers through a digital marketplace.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based authentication with role-based access
- **Product Management** - CRUD operations for agricultural products
- **Order Management** - Complete order lifecycle with status tracking
- **Farmer & Buyer Dashboards** - Analytics and statistics
- **Search & Filtering** - Advanced product search with multiple filters
- **Pagination** - Efficient data loading for large datasets
- **Input Validation** - Comprehensive request validation
- **Security** - Rate limiting, CORS, and security headers

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd directfarm-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/directfarm

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**

   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "farmer",
  "address": {
    "street": "123 Main St",
    "city": "Patna",
    "state": "Bihar",
    "pincode": "800001"
  }
}
```

#### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile

```
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products

```
GET /api/products?page=1&limit=10&category=vegetables&search=tomato
```

#### Get Single Product

```
GET /api/products/:id
```

#### Create Product (Farmers only)

```
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Fresh Tomatoes",
  "description": "Organic red tomatoes",
  "category": "vegetables",
  "price": 40,
  "quantity": 100,
  "unit": "kg",
  "images": ["image1.jpg", "image2.jpg"],
  "isOrganic": true
}
```

### Order Endpoints

#### Create Order (Buyers only)

```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 5
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Patna",
    "state": "Bihar",
    "pincode": "800001",
    "phone": "9876543210"
  }
}
```

#### Get Orders

```
GET /api/orders?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

### Farmer Endpoints

#### Get All Farmers

```
GET /api/farmers?page=1&limit=10
```

#### Get Farmer Profile

```
GET /api/farmers/:id
```

#### Get Farmer Dashboard

```
GET /api/farmers/:id/dashboard
Authorization: Bearer <token>
```

### Buyer Endpoints

#### Get Buyer Orders

```
GET /api/buyers/:id/orders
Authorization: Bearer <token>
```

#### Get Buyer Dashboard

```
GET /api/buyers/:id/dashboard
Authorization: Bearer <token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **farmer** - Can create products, manage inventory, view orders
- **buyer** - Can browse products, place orders, view order history
- **admin** - Full access to all endpoints

## 📊 Database Models

### User

- Basic profile information
- Role-based access control
- Address and contact details

### Product

- Product details and pricing
- Inventory management
- Category and specifications

### Order

- Order tracking and status
- Payment information
- Shipping details

## 🔧 Development

### Project Structure

```
directfarm-backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── config/          # Configuration files
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # Documentation
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🚀 Deployment

1. **Set environment variables** for production
2. **Install dependencies**: `npm install --production`
3. **Start the server**: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@directfarm.com or create an issue in the repository.
