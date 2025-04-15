# 🚚 DriveSync

**DriveSync** is a web-based platform that streamlines logistics by connecting businesses with available drivers in real-time. It enables businesses to post shipment needs and allows drivers to manage, view, and accept those shipments with ease.

---

## ✨ Features

### 🔐 Authentication
- Business and Driver login/sign-up
- Secure token-based authentication

### 🧑‍💼 Business Dashboard
- Post new shipments
- Manage active and past shipments
- View driver details and shipment status

### 🚛 Driver Dashboard
- View available shipments
- Accept & manage shipments
- Update delivery status and profile

---

## ⚙️ Tech Stack

| Frontend    | Backend     | Database     | Other Tools          |
|-------------|-------------|--------------|----------------------|
| React + TS  | Node.js     | MongoDB      | JWT Authentication   |
| Vite        | Express.js  | Mongoose     | TailwindCSS (UI)     |
| Axios       | REST API    |              | Git & GitHub         |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rohandhobale/drivesync.git
cd drivesync
```

### 2. Install dependencies
Frontend
```
cd project
npm install
```
Backend
```
cd ../server
npm install
```
### 3. Setup environment variables
Create a .env file inside the server/ folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_url
JWT_SECRET=your_jwt_secret
```
### 4. Run the application
Start Backend
```
cd server
npm start
```
Start Frontend
``` 
cd ../project
npm run dev
```

