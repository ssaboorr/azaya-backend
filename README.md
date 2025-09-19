# Azaya Backend API


## 🚀 Live API

**Base URL:** [https://azaya-backend.vercel.app](https://azaya-backend.vercel.app)

**GitHub Repository:** [https://github.com/ssaboorr/azaya-backend](https://github.com/ssaboorr/azaya-backend)


## 🛠️ Tech Stack & Dependencies

### Core Framework
- **Express.js** - Fast, unopinionated web framework for Node.js
- **TypeScript** - Type-safe JavaScript for better development experience
- **Node.js** - JavaScript runtime environment

### Database & ODM
- **MongoDB** - NoSQL database for flexible document storage
- **Mongoose** - MongoDB object modeling for Node.js with TypeScript support


## 🚀 Quick Start

### Prerequisites
- Node.js (>= 16.0.0)
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ssaboorr/azaya-backend.git
   cd azaya-backend/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=8000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_URL=your-cloudinary-url
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```


## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```



## 🚀 Deployment

This API is deployed on Vercel with the following configuration:
- **Platform**: Vercel
- **Runtime**: Node.js
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables (Production)
- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_URL` - Cloudinary configuration URL
- `FRONTEND_URL` - Frontend domain for CORS


**Live API**: [https://azaya-backend.vercel.app](https://azaya-backend.vercel.app)  
**Source Code**: [https://github.com/ssaboorr/azaya-backend](https://github.com/ssaboorr/azaya-backend)
