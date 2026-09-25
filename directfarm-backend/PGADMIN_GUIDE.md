# pgAdmin 4 & PostgreSQL Quick Start Guide for DirectFarm

This guide explains how to connect and use **pgAdmin 4** to view and manage the DirectFarm PostgreSQL database.

---

## 1. Database Connection Details

The DirectFarm backend is configured in `.env` with the following parameters:

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Host Name / Address** | `localhost` or `127.0.0.1` | Local server |
| **Port** | `5432` | Default PostgreSQL port |
| **Maintenance Database** | `postgres` | Default initial database |
| **Target Database** | `directfarm` | DirectFarm application database |
| **Username** | `postgres` | Superuser |
| **Password** | *(Your PostgreSQL password set during installation)* | Set in `.env` as `DB_PASSWORD` |

---

## 2. How to Open and Connect in pgAdmin 4

### Step 1: Open pgAdmin 4
1. Open Spotlight Search on your Mac (press `Cmd + Space`).
2. Type **pgAdmin 4** and press `Enter` to launch.
3. Enter your Master Password for pgAdmin 4 if prompted.

### Step 2: Register / Connect to PostgreSQL Server
1. In the left sidebar tree, right-click on **Servers** > **Register** > **Server...** (or click on the existing server `PostgreSQL 18` / `PostgreSQL 17`).
2. In the **General** tab:
   - **Name**: `DirectFarm Local` (or any label you prefer)
3. In the **Connection** tab:
   - **Host name/address**: `localhost`
   - **Port**: `5432`
   - **Maintenance database**: `postgres`
   - **Username**: `postgres`
   - **Password**: *(Enter your Postgres master password and check "Save password")*
4. Click **Save**.

---

## 3. Viewing the DirectFarm Database & Tables

Once connected in pgAdmin 4:

1. Expand **Servers** > **DirectFarm Local** (or your server name) > **Databases**.
2. Locate and click on the **`directfarm`** database.
3. Expand **`directfarm`** > **Schemas** > **`public`** > **Tables**.
4. You will see all 19 relational tables created by the backend:
   - 👤 `users`
   - 🌾 `farmers`
   - 🛒 `buyers`
   - 🥕 `products`
   - 📦 `orders`
   - 📋 `order_items`
   - 💬 `chat_rooms`
   - 📨 `messages`
   - 🤝 `negotiations`
   - 🔔 `notifications`
   - ⭐ `ratings`
   - 📝 `activity_logs`
   - 🔐 `login_logs`
   - 🚨 `complaints`
   - 💡 `feedbacks`
   - 📍 `locations`
   - ⏳ `pending_registrations`
   - 🌟 `success_stories`
   - 💳 `transactions`

---

## 4. Useful pgAdmin 4 Actions

### View Data in Any Table
- Right-click on any table (e.g. `products` or `users`) > **View/Edit Data** > **All Rows**.
- You will see the interactive data grid where you can view, sort, edit, and add records.

### View Database ER Diagram (Visual Schema)
- Right-click on the `directfarm` database or `public` schema > **ERD Tool** (or **Generate ERD**).
- pgAdmin 4 will generate an Entity Relationship Diagram showing all tables and foreign key relationships!

### Run Custom SQL Queries
- Select the `directfarm` database and click **Tools** > **Query Tool** (or press the database lightning icon).
- Run sample queries:
  ```sql
  -- View all active products with farmer information
  SELECT p.id, p.name, p.category, p.quantity, p."pricePerKg", u.name AS farmer_name, u.phone
  FROM products p
  JOIN users u ON p."farmerId" = u.id;

  -- View orders and total amounts
  SELECT o.id, o.status, o."totalAmount", u.name AS buyer_name, o."createdAt"
  FROM orders o
  JOIN users u ON o."buyerId" = u.id;
  ```

---

## 5. CLI Commands for Database Management

From the `directfarm-backend` directory:

- **Initialize Tables**:
  ```bash
  npm run db:init
  ```
- **Seed Sample Data (Admin, Farmers, Buyers, Products, Success Stories)**:
  ```bash
  npm run db:seed
  ```
- **Start Backend**:
  ```bash
  npm run dev
  ```
