# DirectFarm Project Documentation

## 1. Project Overview
DirectFarm is a web-based platform designed to connect farmers directly with buyers, eliminating middlemen and ensuring fair prices. The application features role-based access for Farmers, Buyers, and Admins, facilitating product listing, ordering, negotiation, and real-time communication.

## 2. Technology Stack

### Frontend
- **Framework**: React.js
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Styling**: CSS (Custom styles, App.css, index.css)
- **Notifications**: React Toastify
- **HTTP Client**: Axios (inferred)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

### External Services
- **Geocoding**: External Geocoding API (likely Google Maps or OpenStreetMap via `node-geocoder`)

## 3. System Architecture
The application follows a standard Client-Server architecture:
- **Client**: React Single Page Application (SPA) that consumes RESTful APIs.
- **Server**: Node.js/Express REST API that handles business logic and database operations.
- **Database**: MongoDB for persistent data storage.

## 4. Backend Modules

### 4.1 Database Models (Mongoose Schemas)
The database is structured around the following key models:

- **User**: Base schema for all users.
    - Fields: `name`, `email`, `password` (hashed), `phone`, `role` (farmer/buyer/admin), `address`, `location` (GeoJSON Point).
    - Features: Password hashing (bcrypt), Geocoding on save.
- **Farmer**: Extended profile for farmers (likely linked to User).
- **Buyer**: Extended profile for buyers (likely linked to User).
- **Product**: Represents agricultural produce listed by farmers.
    - Fields: `name`, `category`, `price`, `quantity`, `farmer` (ref), `images`, `description`.
- **Order**: Represents a purchase transaction.
    - Fields: `buyer` (ref), `products` (array), `totalAmount`, `status` (pending/shipped/delivered), `paymentStatus`.
- **Negotiation**: Handles price negotiation between buyer and farmer.
    - Fields: `product` (ref), `buyer` (ref), `farmer` (ref), `originalPrice`, `offeredPrice`, `status` (pending/accepted/rejected).
- **Chat/Message**: Real-time communication messages.
- **Notification**: System notifications for users.
- **Analytics**: Data for dashboard charts and reports.
- **Location**: Stores specific location data if separate from User.
- **SuccessStory**: Content for the success stories page.

### 4.2 API Routes
The backend exposes the following RESTful endpoints (prefixed with `/api`):

- **Auth** (`/api/auth`): Login, Register, Logout, Refresh Token.
- **Users** (`/api/users`): Profile management, User details.
- **Products** (`/api/products`): CRUD operations for products, Search, Filter.
- **Orders** (`/api/orders`): Place order, View order history, Update order status.
- **Farmers** (`/api/farmers`): Farmer-specific actions, Dashboard data.
- **Buyers** (`/api/buyers`): Buyer-specific actions, Dashboard data.
- **Negotiations** (`/api/negotiations`): Create offer, Accept/Reject offer, View history.
- **Chat** (`/api/chat`): Send/Receive messages, Chat history.
- **Admin** (`/api/admin`): System-wide management and analytics.
- **Analytics** (`/api/analytics`): Aggregated data for charts.
- **Locations** (`/api/locations`): Location-based services.

## 5. Frontend Modules

### 5.1 Public Pages
Accessible to all visitors:
- **Home**: Landing page with hero section and overview.
- **About / Features / Business Model**: Informational pages.
- **Login / Register**: Authentication pages with role selection.

### 5.2 Protected Dashboards
Accessible only after login, based on role:

#### Farmer Dashboard (`/farmer-dashboard`)
- **Overview**: Sales summary, active listings.
- **Manage Products**: Add, edit, delete crops.
- **Orders**: View and manage incoming orders.
- **Negotiations**: Respond to buyer offers.
- **Analytics**: View sales performance and crop history.

#### Buyer Dashboard (`/buyer-dashboard`)
- **Marketplace**: Browse and search products.
- **Cart & Checkout**: Purchase flow.
- **Orders**: View order history and status.
- **Negotiations**: Make offers and track status.
- **Analytics**: Spending analysis.

#### Admin Dashboard (`/admin-dashboard`)
- **User Management**: View and manage farmers/buyers.
- **System Analytics**: Platform-wide statistics.

### 5.3 Key Components
- **Navbar**: Responsive navigation bar with dynamic links based on auth state.
- **ProtectedRoute**: Higher-order component to restrict access based on login status and role.
- **GuestRoute**: Restricts access to Login/Register if already logged in.
- **ChatHistory**: Interface for messaging.
- **Profile**: User profile settings.

## 6. Key Features & Workflows

### 6.1 Authentication Flow
1. User registers as Farmer or Buyer.
2. Backend hashes password and creates User record.
3. User logs in -> Backend verifies credentials -> Issues JWT.
4. Frontend stores JWT and includes it in subsequent API requests.

### 6.2 Product Listing & Purchasing
1. **Farmer** lists a product (Crop) via Dashboard.
2. **Buyer** browses products (filtered by location/category).
3. **Buyer** adds to cart -> Checkout -> Order created.
4. **Farmer** receives order notification -> Updates status (Shipped/Delivered).

### 6.3 Negotiation System
1. **Buyer** sees a product and proposes a lower price.
2. **Negotiation** record created with status 'pending'.
3. **Farmer** receives notification -> Accepts or Rejects.
4. If Accepted, Buyer can proceed to purchase at the agreed price.

### 6.4 Location Services
- Users provide address during registration.
- Backend geocodes address to Latitude/Longitude.
- Products can be filtered by proximity to the buyer (e.g., "Within 50km").

## 7. Folder Structure

### Backend
```
directfarm-backend/
├── models/         # Database schemas
├── routes/         # API route definitions
├── middleware/     # Auth, Error handling, etc.
├── utils/          # Helper functions (Geocoder, etc.)
├── server.js       # Entry point
└── .env            # Environment variables
```

### Frontend
```
directfarm-react/
├── src/
│   ├── components/
│   │   ├── auth/       # Login, Register
│   │   ├── dashboard/  # Role-based dashboards
│   │   ├── pages/      # Public pages
│   │   ├── common/     # Navbar, Footer, Profile
│   │   └── ...
│   ├── App.js          # Main component & Routing
│   └── ...
└── public/
```
