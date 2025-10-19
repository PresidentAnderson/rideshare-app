# RideShare API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "rider" // or "driver"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "rider"
    }
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "rider",
      "profile": { ... }
    },
    "token": "jwt_token_here"
  }
}
```

## Ride Endpoints

### Request a Ride
```http
POST /rides/request
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "pickupAddress": "123 Main St, City",
  "dropoffAddress": "456 Oak Ave, City",
  "pickupLat": 40.7128,
  "pickupLng": -74.0060,
  "dropoffLat": 40.7614,
  "dropoffLng": -73.9776,
  "passengerCount": 1,
  "vehicleType": "sedan",
  "specialInstructions": "Please call when you arrive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride requested successfully",
  "data": {
    "ride": {
      "id": "ride_uuid",
      "status": "requested",
      "pickup_address": "123 Main St, City",
      "dropoff_address": "456 Oak Ave, City",
      "fare_total": 15.50,
      "estimated_distance_km": 8.5,
      "estimated_duration_minutes": 22
    },
    "nearbyDriversCount": 3
  }
}
```

### Get User's Rides
```http
GET /rides?status=completed&limit=10&offset=0
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by ride status
- `limit` (optional): Number of rides to return (default: 20)
- `offset` (optional): Number of rides to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": "ride_uuid",
        "status": "completed",
        "pickup_address": "123 Main St",
        "dropoff_address": "456 Oak Ave",
        "fare_total": 15.50,
        "created_at": "2024-01-01T12:00:00Z",
        "rider": {
          "first_name": "John",
          "last_name": "Doe"
        },
        "driver": {
          "first_name": "Jane",
          "last_name": "Smith"
        }
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Accept Ride (Driver Only)
```http
POST /rides/:rideId/accept
```

**Headers:**
```
Authorization: Bearer <driver_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Ride accepted successfully",
  "data": {
    "ride": {
      "id": "ride_uuid",
      "status": "accepted",
      "driver_id": "driver_uuid",
      "accepted_at": "2024-01-01T12:05:00Z"
    },
    "rider": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Update Ride Status (Driver Only)
```http
PUT /rides/:rideId/status
```

**Headers:**
```
Authorization: Bearer <driver_token>
```

**Request Body:**
```json
{
  "status": "in_progress" // or "driver_en_route", "completed"
}
```

### Cancel Ride
```http
POST /rides/:rideId/cancel
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

## Driver Endpoints

### Register as Driver
```http
POST /drivers/register
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "licenseNumber": "DL123456789",
  "licenseExpiry": "2025-12-31",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2020,
  "vehicleColor": "Silver",
  "vehiclePlate": "ABC123",
  "vehicleType": "sedan",
  "insurancePolicy": "INS123456",
  "insuranceExpiry": "2025-06-30"
}
```

### Update Driver Status
```http
PUT /drivers/status
```

**Headers:**
```
Authorization: Bearer <driver_token>
```

**Request Body:**
```json
{
  "status": "available" // or "offline", "busy", "on_break"
}
```

### Update Driver Location
```http
PUT /drivers/location
```

**Headers:**
```
Authorization: Bearer <driver_token>
```

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "heading": 45.5,
  "speed": 25.0,
  "accuracy": 5.0
}
```

### Get Driver Earnings
```http
GET /drivers/earnings?period=today
```

**Headers:**
```
Authorization: Bearer <driver_token>
```

**Query Parameters:**
- `period`: "today", "week", "month", or "year"

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "today",
    "totalEarnings": "125.50",
    "rideCount": 8,
    "averagePerRide": "15.69"
  }
}
```

## User Profile Endpoints

### Get User Profile
```http
GET /users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+0987654321"
}
```

## Payment Endpoints

### Process Payment
```http
POST /payments/process
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rideId": "ride_uuid",
  "paymentMethod": "credit_card",
  "amount": 15.50
}
```

## Admin Endpoints

### Get Dashboard Statistics
```http
GET /admin/dashboard
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalDrivers": 85,
    "totalRides": 3421,
    "activeRides": 23,
    "pendingDrivers": 5,
    "totalRevenue": "125432.50"
  }
}
```

### Get Pending Driver Verifications
```http
GET /admin/drivers/pending
```

### Verify Driver
```http
PUT /admin/drivers/:driverId/verify
```

**Request Body:**
```json
{
  "status": "approved", // or "rejected"
  "notes": "All documents verified"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Ride requests: 10 requests per hour

When rate limit is exceeded, the API returns a `429` status with headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-01T13:00:00Z
Retry-After: 900
```

## WebSocket Events

The application uses Socket.IO for real-time communication. Connect to the socket server and listen for these events:

### Client to Server Events
- `authenticate` - Authenticate socket connection
- `driver_location_update` - Driver sends location update
- `join_ride` - Join a specific ride room
- `send_message` - Send message in ride

### Server to Client Events
- `new_ride_request` - New ride request (sent to drivers)
- `ride_accepted` - Ride was accepted (sent to rider)
- `ride_status_updated` - Ride status changed
- `ride_cancelled` - Ride was cancelled
- `driver_location` - Driver location update
- `new_message` - New message in ride

## Webhooks

### Stripe Webhooks
Configure Stripe webhooks to receive payment events:

**Endpoint:** `/webhooks/stripe`
**Events:** `payment_intent.succeeded`, `payment_intent.payment_failed`