# Tablet Endpoints Documentation

This document describes all **tablet-specific endpoints** for kitchen/service staff tablets. These endpoints require authentication with a tablet account and a valid JWT token.

**Base URL:** `http://localhost:3030` (or your production URL)

**Note:** All endpoints in this document require tablet authentication. Tablets are devices used by kitchen staff, service staff, or counter staff to manage orders and payments.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Order Management](#order-management)
3. [Payment Confirmation](#payment-confirmation)
4. [Complete Workflow](#complete-workflow)
5. [Error Handling](#error-handling)

---

## Authentication

All tablet endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Register Tablet Account

**Note:** Tablet accounts are typically created by admins via `POST /admin/tablets`. However, tablets can also self-register using this endpoint.

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Kitchen Tablet 1",
  "email": "kitchen1@restaurant.com",
  "password": "password123",
  "isActive": true
}
```

**Request Fields:**
- `name` (required, string): Name/identifier for the tablet (e.g., "Kitchen Tablet 1", "Counter Tablet 2")
- `email` (required, string): Unique email address for the tablet
- `password` (required, string): Password (minimum 6 characters)
- `isActive` (optional, boolean): Whether the tablet account is active (default: true)

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "email": "kitchen1@restaurant.com",
    "name": "Kitchen Tablet 1",
    "role": "tablet"
  }
}
```

**Error Responses:**
- `409 Conflict`: Tablet with this email already exists
- `400 Bad Request`: Validation error (invalid email, password too short, etc.)

**Use Case:** Self-registration for tablets. Usually, admins create tablet accounts, but this endpoint allows tablets to register themselves.

---

### Tablet Login

Login to authenticate and receive an access token.

```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "kitchen1@restaurant.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "email": "kitchen1@restaurant.com",
    "name": "Kitchen Tablet 1",
    "role": "tablet"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials or tablet account is deactivated

**Note:** The `lastSeen` timestamp is automatically updated on successful login.

**Use Case:** Initial authentication when the tablet app starts or when the token expires.

---

### Get Current Tablet Information

Get information about the currently authenticated tablet.

```http
GET /auth/me
Authorization: Bearer <your-tablet-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "email": "kitchen1@restaurant.com",
  "name": "Kitchen Tablet 1",
  "role": "tablet"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

**Use Case:** Verify authentication status and get tablet information for display in the app.

---

### Refresh Access Token

Refresh the access token to extend the session without re-logging in.

```http
POST /auth/refresh
Authorization: Bearer <your-tablet-token>
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

**Use Case:** Extend the session before the token expires (default expiration: 7 days).

---

### Tablet Logout

Logout the current tablet session.

```http
POST /auth/logout
Authorization: Bearer <your-tablet-token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Use Case:** End the tablet session when staff finishes their shift.

---

## Order Management

### Get All Orders (Tablet View)

Retrieve all orders that the tablet can view and manage. This typically shows all pending and active orders.

```http
GET /orders/tablet/orders
Authorization: Bearer <your-tablet-token>
```

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174008",
    "orderNumber": "ORD-20250101-001",
    "tableId": "123e4567-e89b-12d3-a456-426614174002",
    "table": {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "tableNumber": "1",
      "location": "Main Hall"
    },
    "status": "pending",
    "totalAmount": 29.97,
    "paymentMethod": "cash",
    "paymentStatus": "pending_cash",
    "assignedTabletId": null,
    "specialInstructions": "Please deliver quickly",
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174009",
        "menuItemId": "123e4567-e89b-12d3-a456-426614174004",
        "menuItem": {
          "id": "123e4567-e89b-12d3-a456-426614174004",
          "name": "Spring Rolls",
          "price": 5.99
        },
        "quantity": 2,
        "price": 5.99,
        "subtotal": 11.98,
        "specialInstructions": "No onions"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174010",
        "menuItemId": "123e4567-e89b-12d3-a456-426614174007",
        "menuItem": {
          "id": "123e4567-e89b-12d3-a456-426614174007",
          "name": "Grilled Salmon",
          "price": 18.99
        },
        "quantity": 1,
        "price": 18.99,
        "subtotal": 18.99,
        "specialInstructions": "Well done"
      }
    ],
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
]
```

**Order Status Values:**
- `pending`: Order just created, awaiting acceptance
- `accepted`: Order accepted by tablet
- `rejected`: Order rejected (e.g., item unavailable)
- `preparing`: Order being prepared
- `ready`: Order ready for pickup/delivery
- `completed`: Order completed

**Payment Status Values:**
- `pending`: Payment not yet initiated
- `pending_cash`: Cash payment pending confirmation
- `pending_pos`: POS/card payment pending confirmation
- `pending_transfer`: Bank transfer payment pending confirmation/receipt
- `paid`: Payment confirmed

**Use Case:** Display all orders on the tablet dashboard for kitchen/service staff to view and manage.

---

### Accept Order

Accept an order and assign it to the current tablet. This changes the order status from `pending` to `accepted` and assigns the tablet ID.

```http
PUT /orders/tablet/orders/{orderId}/accept
Authorization: Bearer <your-tablet-token>
```

**Parameters:**
- `orderId` (path, required): UUID of the order to accept

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174008",
  "orderNumber": "ORD-20250101-001",
  "status": "accepted",
  "assignedTabletId": "123e4567-e89b-12d3-a456-426614174001",
  "updatedAt": "2025-01-01T12:05:00.000Z",
  ...
}
```

**Error Responses:**
- `404 Not Found`: Order not found
- `400 Bad Request`: Order cannot be accepted (already accepted, rejected, or completed)

**Use Case:** Kitchen staff accepts an order to start preparing it. The order is now assigned to this tablet.

---

### Reject Order

Reject an order (e.g., if an item is unavailable). This changes the order status to `rejected`.

```http
PUT /orders/tablet/orders/{orderId}/reject
Authorization: Bearer <your-tablet-token>
```

**Parameters:**
- `orderId` (path, required): UUID of the order to reject

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174008",
  "orderNumber": "ORD-20250101-001",
  "status": "rejected",
  "updatedAt": "2025-01-01T12:05:00.000Z",
  ...
}
```

**Error Responses:**
- `404 Not Found`: Order not found
- `400 Bad Request`: Order cannot be rejected (already rejected or completed)

**Use Case:** Reject an order when items are unavailable or the order cannot be fulfilled.

---

### Update Order Status

Update the status of an order (e.g., from `accepted` to `preparing`, then to `ready`).

```http
PUT /orders/tablet/orders/{orderId}/status
Authorization: Bearer <your-tablet-token>
Content-Type: application/json
```

**Parameters:**
- `orderId` (path, required): UUID of the order to update

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Valid Status Values:**
- `pending`
- `accepted`
- `rejected`
- `preparing`
- `ready`
- `completed`

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174008",
  "orderNumber": "ORD-20250101-001",
  "status": "preparing",
  "updatedAt": "2025-01-01T12:10:00.000Z",
  ...
}
```

**Error Responses:**
- `404 Not Found`: Order not found
- `400 Bad Request`: Invalid status value or status transition not allowed

**Use Case:** Update order status as it progresses through the kitchen/service workflow:
1. Accept order → `accepted`
2. Start preparing → `preparing`
3. Order ready → `ready`
4. Order delivered → `completed`

---

## Payment Confirmation

Tablets can confirm payments for orders. This is used when customers pay at the counter or when payment receipts are verified.

### Confirm Cash Payment

Confirm that cash payment has been received for an order.

```http
PUT /tablet/payments/{paymentId}/confirm-cash
Authorization: Bearer <your-tablet-token>
```

**Parameters:**
- `paymentId` (path, required): UUID of the payment record

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174014",
  "orderId": "123e4567-e89b-12d3-a456-426614174008",
  "paymentMethod": "cash",
  "status": "confirmed",
  "amount": 29.97,
  "confirmedByTabletId": "123e4567-e89b-12d3-a456-426614174001",
  "confirmedAt": "2025-01-01T12:15:00.000Z",
  "createdAt": "2025-01-01T12:10:00.000Z",
  "updatedAt": "2025-01-01T12:15:00.000Z"
}
```

**Note:** This also updates the order's `paymentStatus` to `paid`.

**Error Responses:**
- `404 Not Found`: Payment not found
- `400 Bad Request`: Payment cannot be confirmed (already confirmed or invalid payment method)

**Use Case:** Staff receives cash payment from customer and confirms it on the tablet.

---

### Confirm POS/Card Payment

Confirm that POS/card payment has been processed successfully.

```http
PUT /tablet/payments/{paymentId}/confirm-pos
Authorization: Bearer <your-tablet-token>
```

**Parameters:**
- `paymentId` (path, required): UUID of the payment record

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174014",
  "orderId": "123e4567-e89b-12d3-a456-426614174008",
  "paymentMethod": "pos",
  "status": "confirmed",
  "amount": 29.97,
  "confirmedByTabletId": "123e4567-e89b-12d3-a456-426614174001",
  "confirmedAt": "2025-01-01T12:15:00.000Z",
  "createdAt": "2025-01-01T12:10:00.000Z",
  "updatedAt": "2025-01-01T12:15:00.000Z"
}
```

**Note:** This also updates the order's `paymentStatus` to `paid`.

**Error Responses:**
- `404 Not Found`: Payment not found
- `400 Bad Request`: Payment cannot be confirmed (already confirmed or invalid payment method)

**Use Case:** Staff processes card payment through POS terminal and confirms it on the tablet.

---

### Confirm Transfer Payment

Confirm that bank transfer payment has been received and verified (after customer uploads receipt).

```http
PUT /tablet/payments/{paymentId}/confirm-transfer
Authorization: Bearer <your-tablet-token>
```

**Parameters:**
- `paymentId` (path, required): UUID of the payment record

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174014",
  "orderId": "123e4567-e89b-12d3-a456-426614174008",
  "paymentMethod": "transfer",
  "status": "confirmed",
  "amount": 29.97,
  "receiptImageUrl": "https://res.cloudinary.com/...",
  "confirmedByTabletId": "123e4567-e89b-12d3-a456-426614174001",
  "confirmedAt": "2025-01-01T12:20:00.000Z",
  "createdAt": "2025-01-01T12:10:00.000Z",
  "updatedAt": "2025-01-01T12:20:00.000Z"
}
```

**Note:** 
- This also updates the order's `paymentStatus` to `paid`.
- The payment should have a `receiptImageUrl` uploaded by the customer before confirmation.

**Error Responses:**
- `404 Not Found`: Payment not found
- `400 Bad Request`: Payment cannot be confirmed (already confirmed, invalid payment method, or receipt not uploaded)

**Use Case:** Staff verifies the bank transfer receipt uploaded by the customer and confirms the payment.

---

## Complete Workflow

Here's a typical workflow for tablet staff managing orders and payments:

### Step 1: Tablet Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "kitchen1@restaurant.com",
  "password": "password123"
}
```
**Save the `access_token`** - you'll need it for all subsequent requests.

---

### Step 2: View All Orders
```http
GET /orders/tablet/orders
Authorization: Bearer <tablet-token>
```
Tablet displays all pending and active orders.

---

### Step 3: Accept an Order
```http
PUT /orders/tablet/orders/{orderId}/accept
Authorization: Bearer <tablet-token>
```
Kitchen staff accepts the order to start preparing it.

---

### Step 4: Update Order Status as It Progresses
```http
PUT /orders/tablet/orders/{orderId}/status
Authorization: Bearer <tablet-token>
Content-Type: application/json

{
  "status": "preparing"
}
```

Then when ready:
```http
PUT /orders/tablet/orders/{orderId}/status
Authorization: Bearer <tablet-token>
Content-Type: application/json

{
  "status": "ready"
}
```

---

### Step 5: Complete Order
```http
PUT /orders/tablet/orders/{orderId}/status
Authorization: Bearer <tablet-token>
Content-Type: application/json

{
  "status": "completed"
}
```

---

### Step 6: Confirm Payment (if customer pays at counter)

**For Cash Payment:**
```http
PUT /tablet/payments/{paymentId}/confirm-cash
Authorization: Bearer <tablet-token>
```

**For POS/Card Payment:**
```http
PUT /tablet/payments/{paymentId}/confirm-pos
Authorization: Bearer <tablet-token>
```

**For Transfer Payment (after customer uploads receipt):**
```http
PUT /tablet/payments/{paymentId}/confirm-transfer
Authorization: Bearer <tablet-token>
```

---

## Order Status Flow

The typical order status progression:

```
pending → accepted → preparing → ready → completed
   ↓
rejected (if order cannot be fulfilled)
```

**Status Transitions:**
- `pending` → `accepted` (via `/accept` endpoint)
- `pending` → `rejected` (via `/reject` endpoint)
- `accepted` → `preparing` (via `/status` endpoint)
- `preparing` → `ready` (via `/status` endpoint)
- `ready` → `completed` (via `/status` endpoint)

---

## Payment Workflow

### Cash Payment Flow:
1. Customer places order with `paymentMethod: "cash"`
2. Order is prepared and ready
3. Customer pays cash at counter
4. Tablet confirms: `PUT /tablet/payments/{paymentId}/confirm-cash`
5. Payment status → `confirmed`, Order payment status → `paid`

### POS/Card Payment Flow:
1. Customer places order with `paymentMethod: "pos"`
2. Order is prepared and ready
3. Customer pays via card at POS terminal
4. Tablet confirms: `PUT /tablet/payments/{paymentId}/confirm-pos`
5. Payment status → `confirmed`, Order payment status → `paid`

### Transfer Payment Flow:
1. Customer places order with `paymentMethod: "transfer"`
2. Customer uploads transfer receipt: `POST /payments/transfer/upload`
3. Order is prepared and ready
4. Staff verifies receipt on tablet
5. Tablet confirms: `PUT /tablet/payments/{paymentId}/confirm-transfer`
6. Payment status → `confirmed`, Order payment status → `paid`

---

## Error Handling

All endpoints follow standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or invalid operation
- `401 Unauthorized`: Invalid or expired token, or invalid credentials
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., duplicate email)
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## Authentication Token Management

### Token Expiration
- Default token expiration: **7 days**
- Use `POST /auth/refresh` to extend the session before expiration

### Token Usage
Include the token in the `Authorization` header for all protected endpoints:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Handling Token Expiration
When a token expires (401 Unauthorized):
1. Prompt user to login again
2. Or implement automatic token refresh using `POST /auth/refresh`

---

## Best Practices

### 1. Order Management
- **Accept orders promptly** to prevent customer waiting
- **Update status regularly** so customers can track their order progress
- **Reject orders only when necessary** (item unavailable, etc.)
- **Complete orders** when delivered to customer

### 2. Payment Confirmation
- **Verify payment before confirming** (check cash amount, POS receipt, transfer receipt)
- **Confirm payments immediately** after receiving payment
- **Double-check transfer receipts** before confirming transfer payments

### 3. Tablet Account Management
- **Use descriptive names** for tablets (e.g., "Kitchen Tablet 1", "Counter Tablet 2")
- **Keep tablets active** during service hours
- **Logout when shift ends** to prevent unauthorized access

### 4. Real-time Updates
- **Poll orders regularly** (e.g., every 5-10 seconds) to see new orders
- **Use WebSocket connections** (if implemented) for real-time order updates
- **Update order status promptly** to keep customers informed

---

## Notes

1. **Tablet Accounts**: Tablet accounts are typically created by admins via `POST /admin/tablets`, but tablets can also self-register using `POST /auth/register`.

2. **Order Assignment**: When a tablet accepts an order, it becomes assigned to that tablet (`assignedTabletId`). This helps track which staff member is handling which order.

3. **Payment Confirmation**: Only tablets can confirm payments. This ensures that payments are verified by staff before being marked as paid.

4. **Status Updates**: Order status updates are visible to customers through the public `GET /orders/{id}` endpoint, allowing real-time order tracking.

5. **Last Seen Tracking**: The system automatically updates the `lastSeen` timestamp when tablets login or use authenticated endpoints, helping admins track tablet activity.

6. **Multiple Tablets**: Multiple tablets can view all orders, but only one tablet can accept a specific order. Once accepted, the order is assigned to that tablet.

---

## Support

For issues or questions about these endpoints, contact the restaurant management team or refer to the Swagger documentation at:
```
http://localhost:3030/api
```

---

## Quick Reference

### Authentication
- `POST /auth/register` - Register tablet
- `POST /auth/login` - Login tablet
- `GET /auth/me` - Get current tablet info
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Orders
- `GET /orders/tablet/orders` - Get all orders
- `PUT /orders/tablet/orders/{id}/accept` - Accept order
- `PUT /orders/tablet/orders/{id}/reject` - Reject order
- `PUT /orders/tablet/orders/{id}/status` - Update order status

### Payments
- `PUT /tablet/payments/{id}/confirm-cash` - Confirm cash payment
- `PUT /tablet/payments/{id}/confirm-pos` - Confirm POS payment
- `PUT /tablet/payments/{id}/confirm-transfer` - Confirm transfer payment

