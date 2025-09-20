 # School Payment Backend API

A robust NestJS-based REST API for managing school payments and transactions with MongoDB integration, JWT authentication, and webhook support.

## Features

- JWT Authentication & Authorization
- Payment Gateway Integration
- Transaction Management
- Webhook Processing
- Data Pagination & Filtering
- Advanced Search & Sorting
- Comprehensive Logging
- Data Validation

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **HTTP Client**: Axios
- **Password Hashing**: bcryptjs

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/AyeshaKODER/school-payment-backend.git)
cd school-payment-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-payments

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Payment Gateway
PG_KEY=edvtest01
API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2LCJpYXQiOjE3MTE2MjIyNzAsImV4cCI6MTc0MzE3OTg3MH0.Rye77Dp59GGxwCmwWekJHRj6edXWJnff9finjMhxKuw
SCHOOL_ID=65b0e6293e9f76a9694d84b4
PAYMENT_API_URL=https://api.paymentgateway.com

# Server
PORT=3000
```

### 4. Seed Sample Data

```bash
npm run seed
```

### 5. Start the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@schoolpay.com",
  "password": "password123"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Payment Management

#### Create Payment

```http
POST /payment/create-payment
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "trustee_id": "65b0e552dd31950a9b41c5ba",
  "student_info": {
    "name": "John Doe",
    "id": "STU001",
    "email": "john.doe@school.edu"
  },
  "gateway_name": "PhonePe",
  "order_amount": 2000,
  "payment_mode": "upi"
}
```

**Response:**

```json
{
  "success": true,
  "custom_order_id": "ORD_1234567890_abc123",
  "payment_url": "https://api.paymentgateway.com/payment/ORD_1234567890_abc123",
  "order_id": "60f1234567890123456789ab",
  "message": "Payment request created successfully"
}
```

### Transaction Management

#### Get All Transactions

```http
GET /transactions?page=1&limit=10&sort=payment_time&order=desc&status=success&schoolId=65b0e6293e9f76a9694d84b4&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field (payment_time, status, transaction_amount)
- `order` (optional): Sort order (asc, desc)
- `status` (optional): Filter by status (success, failed, pending, processing)
- `schoolId` (optional): Filter by school ID
- `dateFrom` (optional): Filter transactions from date (YYYY-MM-DD)
- `dateTo` (optional): Filter transactions to date (YYYY-MM-DD)

**Response:**

```json
{
  "transactions": [
    {
      "collect_id": "60f1234567890123456789ab",
      "school_id": "65b0e6293e9f76a9694d84b4",
      "gateway": "PhonePe",
      "order_amount": 2000,
      "transaction_amount": 2200,
      "status": "success",
      "custom_order_id": "ORD_1234567890_abc123",
      "student_info": {
        "name": "John Doe",
        "id": "STU001",
        "email": "john.doe@school.edu"
      },
      "payment_time": "2024-01-15T10:30:00.000Z",
      "payment_mode": "upi",
      "bank_reference": "PHONPE1234"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Transactions by School

```http
GET /transactions/school/65b0e6293e9f76a9694d84b4?page=1&limit=10
Authorization: Bearer <access_token>
```

#### Check Transaction Status

```http
GET /transaction-status/ORD_1234567890_abc123
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "custom_order_id": "ORD_1234567890_abc123",
  "collect_id": "60f1234567890123456789ab",
  "status": "success",
  "order_amount": 2000,
  "transaction_amount": 2200,
  "payment_mode": "upi",
  "payment_time": "2024-01-15T10:30:00.000Z",
  "payment_message": "Payment successful",
  "bank_reference": "PHONPE1234",
  "student_info": {
    "name": "John Doe",
    "id": "STU001",
    "email": "john.doe@school.edu"
  }
}
```

### Webhook Integration

#### Process Webhook

```http
POST /webhook
Content-Type: application/json

{
  "status": 200,
  "order_info": {
    "order_id": "ORD_1234567890_abc123",
    "order_amount": 2000,
    "transaction_amount": 2200,
    "gateway": "PhonePe",
    "bank_reference": "PHONPE1234",
    "status": "success",
    "payment_mode": "upi",
    "payemnt_details": "success@phonepe",
    "Payment_message": "payment success",
    "payment_time": "2024-01-15T10:30:00.000Z",
    "error_message": "NA"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "webhook_id": "WH_1234567890_xyz789",
  "order_id": "ORD_1234567890_abc123",
  "updated_status": "success"
}
```

## Database Schemas

### Order Schema

```javascript
{
  _id: ObjectId,
  school_id: ObjectId,
  trustee_id: ObjectId,
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String,
  custom_order_id: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Status Schema

```javascript
{
  _id: ObjectId,
  collect_id: ObjectId, // Reference to Order
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String, // 'pending', 'success', 'failed', 'processing'
  error_message: String,
  payment_time: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Webhook Log Schema

```javascript
{
  _id: ObjectId,
  webhook_id: String,
  event_type: String,
  payload: Object,
  status: String,
  error_message: String,
  processed_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing with Postman

### 1. Import Environment Variables

Create a Postman environment with:

- `baseUrl`: `http://localhost:3000`
- `accessToken`: (Set after login)

### 2. Authentication Flow

1. Register or login to get access token
2. Set the token in your environment variables
3. Use `{{accessToken}}` in Authorization headers

### 3. Test Webhook

Use Postman to simulate webhook calls to `/webhook` endpoint with the provided payload format.

## Deployment

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/school-payments-prod
JWT_SECRET=your-super-secure-production-jwt-secret
NODE_ENV=production
```

### Build Commands

```bash
npm run build
npm run start:prod
```

## Security Features

- ✅ JWT Authentication on all protected routes
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment-based configuration
- ✅ Error handling and logging

## Performance Optimizations

- ✅ MongoDB indexes on frequently queried fields
- ✅ Pagination for large datasets
- ✅ Aggregation pipelines for complex queries
- ✅ Query optimization with proper filtering

## Error Handling

The API returns consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Logging

- Webhook events are logged to `webhook_logs` collection
- Failed transactions are logged for debugging
- Application logs are available in console

## Sample Data

After running `npm run seed`, you'll have:

- 1 admin user (username: `admin`, password: `password123`)
- 50 sample transactions across 3 schools
- Various payment statuses and modes

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB Atlas connection string
   - Check network access and IP whitelist

2. **JWT Token Issues**
   - Ensure JWT_SECRET is set in environment
   - Check token expiration

3. **Webhook Processing Errors**
   - Verify payload format matches schema
   - Check order existence in database

### Support

For issues and questions, please check the logs and verify your environment configuration.
