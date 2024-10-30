# ECOMMERCE APP

A React Native mobile application with a Node.js/PostgreSQL backend.

## Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- PostgreSQL
- Git

## Installation

### Backend Setup

1. Clone the backend repository:

```bash
git clone <your-backend-repo-url>
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend root directory with the following variables:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_database_name
DB_PASSWORD=your_db_password
DB_PORT=5432
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. Start the backend server:

```bash
npm start
```

### Frontend Setup (React Native)

1. Open a new terminal and navigate to frontend directory:

```bash
cd frontend-RN
```

2. Install dependencies:

```bash
npm install
```

3. Update the base URL:
   Navigate to `frontend-RN/services/api.ts` and update the base URL to match your backend server:

```typescript
// Change this to your backend server URL
baseURL: "http://your-backend-url:5000";
```

4. Start the Expo development server:

```bash
npx expo start
```

5. Run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app on your mobile device

## Environment Setup

### Backend (.env)

- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT authentication
- `DB_USER`: PostgreSQL database username
- `DB_HOST`: Database host address
- `DB_NAME`: Database name
- `DB_PASSWORD`: Database password
- `DB_PORT`: Database port (default: 5432)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

## Technologies Used

- React Native
- Expo
- Node.js
- PostgreSQL
- Cloudinary
- JWT Authentication
