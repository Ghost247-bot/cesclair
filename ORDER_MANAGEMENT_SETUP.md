# 📦 Complete Order Management Setup Guide

This guide covers the complete order management system setup, including database, APIs, admin functions, and customer features.

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Order Flow Overview](#order-flow-overview)
3. [API Endpoints](#api-endpoints)
4. [Admin Features](#admin-features)
5. [Customer Features](#customer-features)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🗄️ Database Setup

### Prerequisites

1. **Database Schema**: Orders and order_items tables are defined in `src/db/schema.ts`
2. **Migrations**: Check if migrations have been applied

### Verify Database Tables

Run this query to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items', 'cart_items');
```

### Required Tables

#### 1. `orders` Table
- `id` (serial, primary key)
- `order_number` (text, unique, not null)
- `user_id` (text, references user.id)
- `email` (text, not null)
- `status` (text, default 'pending')
- `subtotal`, `shipping`, `tax`, `discount`, `total` (text)
- Shipping address fields
- `payment_method`, `payment_intent_id`
- `tracking_number`
- `shipped_at`, `delivered_at` (timestamps)
- `created_at`, `updated_at` (timestamps)

#### 2. `order_items` Table
- `id` (serial, primary key)
- `order_id` (integer, references orders.id)
- `product_id` (integer, references products.id)
- `product_name`, `product_image`, `price` (text)
- `quantity` (integer)
- `size`, `color`, `sku` (text, nullable)
- `created_at` (timestamp)

#### 3. `cart_items` Table (for order creation)
- Used to create orders from cart

### Run Migrations

If tables don't exist, run migrations:

```bash
# Option 1: Use Drizzle Kit (Recommended)
npm run db:push

# Option 2: Check database connection first
npm run db:check

# Option 3: Run specific migration
# The orders table is created in: drizzle/0002_cheerful_blink.sql
```

---

## 🔄 Order Flow Overview

### Order Lifecycle

```
Pending → Processing → Shipped → Delivered
   ↓                      ↓
Cancelled            (can cancel before shipped)
```

### Status Definitions

- **pending**: Order placed, awaiting confirmation
- **processing**: Order confirmed, being prepared
- **shipped**: Order shipped with tracking number
- **delivered**: Order delivered to customer
- **cancelled**: Order cancelled (can't be restored)

---

## 🔌 API Endpoints

### Customer-Facing APIs

#### 1. Create Order
- **Endpoint**: `POST /api/orders`
- **Auth**: Optional (guest checkout supported)
- **Body**:
  ```json
  {
    "email": "customer@example.com",
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States",
      "phone": "+1234567890"
    },
    "paymentMethod": "card",
    "paymentIntentId": null,
    "items": [/* optional cart items as fallback */]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "order": { /* order object */ },
    "orderNumber": "ORD-1234567890-ABC123",
    "orderId": 1
  }
  ```

#### 2. Get User Orders
- **Endpoint**: `GET /api/account/orders`
- **Auth**: Required (session-based)
- **Response**:
  ```json
  {
    "orders": [
      {
        "id": 1,
        "orderNumber": "ORD-1234567890-ABC123",
        "status": "processing",
        "total": "99.99",
        "items": [/* order items */],
        ...
      }
    ]
  }
  ```

#### 3. Get Order by Order Number
- **Endpoint**: `GET /api/orders/status/[orderNumber]`
- **Auth**: Not required (public)
- **Use Case**: Track order without logging in
- **Response**:
  ```json
  {
    "id": 1,
    "orderNumber": "ORD-1234567890-ABC123",
    "status": "shipped",
    "trackingNumber": "TRACK123",
    "items": [/* order items */],
    ...
  }
  ```

### Admin APIs

#### 1. List All Orders
- **Endpoint**: `GET /api/admin/orders`
- **Auth**: Admin only
- **Query Params**:
  - `status` (optional): Filter by status
  - `limit` (optional, default: 100)
  - `offset` (optional, default: 0)
- **Response**:
  ```json
  {
    "orders": [/* array of orders with items */],
    "total": 50,
    "limit": 100,
    "offset": 0
  }
  ```

#### 2. Get Order by ID
- **Endpoint**: `GET /api/admin/orders/[id]`
- **Auth**: Admin only
- **Response**: Order object with items

#### 3. Update Order Status
- **Endpoint**: `PUT /api/admin/orders/[id]`
- **Auth**: Admin only
- **Body**:
  ```json
  {
    "status": "shipped",
    "trackingNumber": "TRACK123"  // optional
  }
  ```
- **Valid Status Values**:
  - `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- **Response**:
  ```json
  {
    "success": true,
    "order": { /* updated order */ }
  }
  ```

---

## 👨‍💼 Admin Features

### Admin Dashboard - Orders Tab

**Location**: `/admin` → Orders tab

### Features Available:

1. **View All Orders**
   - Search by order number, email, name, city, or tracking number
   - Filter by status (All, Pending, Processing, Shipped, Delivered, Cancelled)
   - See order details including items, shipping info, and totals

2. **Confirm Order**
   - **Action**: Click "Confirm" button on pending orders
   - **Result**: Status changes from `pending` → `processing`
   - **When Available**: Only on orders with status `pending`

3. **Ship Order**
   - **Action**: Click "Ship" button on processing/pending orders
   - **Result**: Status changes to `shipped`, prompts for tracking number
   - **Features**: 
     - Optionally enter tracking number
     - Automatically sets `shippedAt` timestamp
   - **When Available**: Orders with status `processing` or `pending`

4. **Mark as Delivered**
   - **Action**: Click "Mark Delivered" button on shipped orders
   - **Result**: Status changes from `shipped` → `delivered`
   - **Features**: Automatically sets `deliveredAt` timestamp
   - **When Available**: Only on orders with status `shipped`

5. **Cancel Order**
   - **Action**: Click "Cancel" button
   - **Result**: Status changes to `cancelled`
   - **Warning**: Confirmation dialog required (action cannot be undone)
   - **When Available**: Orders with status `pending` or `processing`

### Order Display Information:

- Order number and status badge (color-coded)
- Customer email and shipping address
- Order date and time
- Tracking number (if shipped)
- Ship date (if shipped)
- List of order items with quantities, sizes, and colors
- Order totals (subtotal, shipping, tax, discount, total)

---

## 👤 Customer Features

### 1. View My Orders

**Location**: `/account/orders`

**Features**:
- View all orders (authenticated users)
- See order status with color-coded badges
- View order details including items
- See tracking information (if shipped)
- View shipping address
- See order totals

**Access**: Requires authentication (redirects to login if not logged in)

### 2. Track Order by Order Number

**Location**: `/orders/status?orderNumber=ORD-XXX-XXX`

**Features**:
- **Public Access**: No login required
- Enter order number to track
- See complete order details
- View order timeline/status history
- See tracking information
- View shipping address and order summary

**Use Cases**:
- Guest customers can track orders
- Email order confirmations can link to this page
- Share order status with others

### 3. Order Status Timeline

The order status page shows a visual timeline:
- ✅ Order Placed
- ✅ Order Processing (if status is processing/shipped/delivered)
- 🚚 Order Shipped (if status is shipped/delivered)
- ✅ Order Delivered (if status is delivered)
- ❌ Order Cancelled (if status is cancelled)

---

## ✅ Testing Checklist

### Database Setup
- [ ] Verify `orders` table exists
- [ ] Verify `order_items` table exists
- [ ] Verify `cart_items` table exists
- [ ] Check that foreign key constraints are set up correctly
- [ ] Verify unique constraint on `order_number`

### Order Creation
- [ ] Test creating order as authenticated user
- [ ] Test creating order as guest (with session ID)
- [ ] Verify order number is generated correctly (format: `ORD-{timestamp}-{nanoid}`)
- [ ] Verify order items are created correctly
- [ ] Verify cart is cleared after order creation
- [ ] Test with empty cart (should fail gracefully)
- [ ] Test with missing shipping address (should fail gracefully)

### Admin Features
- [ ] Login as admin user
- [ ] Access `/admin` dashboard
- [ ] Navigate to Orders tab
- [ ] Verify orders list loads correctly
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Test "Confirm" action on pending order
- [ ] Test "Ship" action (with and without tracking number)
- [ ] Test "Mark Delivered" action
- [ ] Test "Cancel" action
- [ ] Verify status updates reflect immediately in UI
- [ ] Verify `shippedAt` timestamp is set when shipping
- [ ] Verify `deliveredAt` timestamp is set when marking delivered

### Customer Features
- [ ] Login as regular user
- [ ] Access `/account/orders`
- [ ] Verify orders list shows user's orders
- [ ] Verify order details display correctly
- [ ] Test order status page: `/orders/status`
- [ ] Enter order number and verify it loads
- [ ] Verify order timeline displays correctly
- [ ] Test tracking number display
- [ ] Test as guest user (without login)

### Order Status Flow
- [ ] Create order → verify status is `pending`
- [ ] Admin confirms → verify status changes to `processing`
- [ ] Admin ships with tracking → verify status changes to `shipped` and tracking is saved
- [ ] Admin marks delivered → verify status changes to `delivered`
- [ ] Test cancelling pending order
- [ ] Test cancelling processing order
- [ ] Verify cancelled orders show correct status

### Error Handling
- [ ] Test invalid order number lookup (should show error)
- [ ] Test unauthorized admin access (should return 401)
- [ ] Test order creation with invalid data (should fail gracefully)
- [ ] Test updating order to invalid status (should fail gracefully)

---

## 🔧 Troubleshooting

### Orders Not Saving to Database

**Symptoms**: Order appears created but not in database

**Solutions**:
1. Check database connection: `npm run db:check`
2. Verify tables exist (see Database Setup section)
3. Check server logs for database errors
4. Verify `DATABASE_URL` environment variable is set correctly
5. Check that order creation API is receiving proper data
6. Verify session ID or user ID is being passed correctly

### Order Numbers Not Generated

**Symptoms**: Order created but no order number returned

**Solutions**:
1. Verify `nanoid` package is installed: `npm list nanoid`
2. Check server logs for errors during order number generation
3. Verify database insert is successful (check returned order)
4. Check API response includes `orderNumber` field

### Admin Can't Access Orders

**Symptoms**: 401 Unauthorized when accessing `/api/admin/orders`

**Solutions**:
1. Verify user role is `admin` in database
2. Check session is valid
3. Verify `checkAdminAccess` function in API route
4. Check that user is logged in with admin account

### Orders Not Appearing in Admin Dashboard

**Symptoms**: Orders exist in database but not showing in admin UI

**Solutions**:
1. Check browser console for errors
2. Verify API endpoint returns orders: `GET /api/admin/orders`
3. Check status filter (might be filtering out orders)
4. Verify search query isn't filtering out all orders
5. Check network tab for failed API requests

### Customer Can't View Orders

**Symptoms**: `/account/orders` shows no orders or error

**Solutions**:
1. Verify user is logged in
2. Check that orders have matching `userId` or `email`
3. Verify API endpoint: `GET /api/account/orders`
4. Check browser console for errors
5. Verify session is valid

### Order Status Not Updating

**Symptoms**: Admin updates status but UI doesn't reflect change

**Solutions**:
1. Refresh admin dashboard after status update
2. Check API response after status update
3. Verify database update was successful
4. Check for JavaScript errors in browser console
5. Verify status value is valid (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)

---

## 📝 Important Notes

### Order Number Format

Order numbers follow this format: `ORD-{timestamp}-{6-character-nanoid}`

Example: `ORD-1735689600000-A1B2C3`

- `ORD-` prefix
- Unix timestamp (milliseconds)
- 6-character uppercase alphanumeric ID (for uniqueness)

### Guest Orders

- Guest orders are linked by `email` and `sessionId`
- When a guest user creates an account, their orders are linked via `email` matching
- Use `/api/orders/link-guest-orders` to link guest orders to new user account

### Session ID Handling

- Guest checkout uses `sessionId` from `localStorage.getItem('cart_session_id')`
- Session ID is stored when items are added to cart
- Session ID is passed in `x-session-id` header for API requests

### Status Transitions

Valid status transitions:
- `pending` → `processing` (Confirm)
- `pending` → `shipped` (Ship - skips processing)
- `pending` → `cancelled` (Cancel)
- `processing` → `shipped` (Ship)
- `processing` → `cancelled` (Cancel)
- `shipped` → `delivered` (Mark Delivered)

**Note**: Once cancelled or delivered, status cannot be changed.

### Tracking Numbers

- Tracking numbers are optional when shipping
- Can be added later by updating order status
- Displayed to customers on order status page and account orders page

---

## 🚀 Quick Start

1. **Verify Database**:
   ```bash
   npm run db:check
   ```

2. **Run Migrations** (if needed):
   ```bash
   npm run db:push
   ```

3. **Test Order Creation**:
   - Add items to cart
   - Go through checkout
   - Verify order is created

4. **Test Admin Features**:
   - Login as admin
   - Go to `/admin` → Orders tab
   - Test status updates

5. **Test Customer Features**:
   - Login as user
   - Go to `/account/orders`
   - Test order tracking at `/orders/status`

---

## 📚 Related Documentation

- `src/db/schema.ts` - Database schema definitions
- `src/app/api/orders/route.ts` - Order creation API
- `src/app/api/admin/orders/route.ts` - Admin order management API
- `src/app/admin/page.tsx` - Admin dashboard with orders tab
- `src/app/account/orders/page.tsx` - Customer orders page
- `src/app/orders/status/page.tsx` - Order tracking page

---

## ✅ Setup Complete

Once all items in the testing checklist pass, your order management system is fully set up and ready for production use!

For issues or questions, refer to the Troubleshooting section or check server logs for detailed error messages.

