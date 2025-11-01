# Providers Nearby API (Express + TypeScript + Bun + Sequelize + MySQL)

This project implements an API endpoint to find nearby providers based on user location.  
It supports distance filtering, sorting (by distance or rating), pagination, and test-user injection.

---

## 🚀 Features

- `/providers/nearby` endpoint to return nearby providers within a cutoff distance.
- Sort by **distance** or **star rating**.
- Pagination via `limit` and `offset`.
- **Reusable test-user middleware** (adds test providers for QA or sandbox accounts).
- **Optimized for large datasets (100k+ providers)** using bounding-box prefilter + SQL Haversine formula.
- Tested using **`bun test`**.

---

## 🧱 Tech Stack

- [Bun](https://bun.sh)
- [Express](https://expressjs.com)
- [Sequelize ORM](https://sequelize.org)
- MySQL (can adapt to SQLite for testing)
- TypeScript

---

## ⚙️ Installation

1. **Clone & Install**
   ```bash
   unzip providers-nearby.zip
   cd providers-nearby
   bun install
   ```

2. **Set environment variables**
   ```bash
   export DB_HOST=127.0.0.1
   export DB_PORT=3306
   export DB_NAME=testdb
   export DB_USER=root
   export DB_PASS=password
   export PORT=3000
   ```

3. **Start the server**
   ```bash
   bun run src/server.ts
   ```

   Or:
   ```bash
   RUN_SERVER=1 bun run src/server.ts
   ```

---

## 📡 API Endpoint

### **GET** `/providers/nearby`

#### Request Parameters (query)
| Parameter | Type | Description |
|------------|------|-------------|
| `latitude` | number | User latitude |
| `longitude` | number | User longitude |
| `limit` | number | Number of results to return (default 10) |
| `offset` | number | Pagination offset (default 0) |
| `distance` | number | Max distance in kilometers (default 5) |
| `sortby` | string | `distance` or `rating` |

#### Example Request
```bash
curl "http://localhost:3000/providers/nearby?latitude=1.3521&longitude=103.8198&limit=3&distance=10&sortby=distance"
```

#### Example Response
```json
{
  "results": [
    {
      "id": 1,
      "name": "John Trainer",
      "latitude": 1.3531,
      "longitude": 103.8190,
      "rating": 4.7,
      "distance": 0.12
    }
  ],
  "count": 1
}
```

---

## 🧪 Test User

Add a header `x-test-user: 1` or `x-user-id: test` to include synthetic test providers in the response:
```bash
curl "http://localhost:3000/providers/nearby?latitude=1.3521&longitude=103.8198" -H "x-test-user: 1"
```

---

## 🧭 Performance Notes

- The SQL query uses:
  - **Bounding box** filtering to minimize rows checked.
  - **Haversine formula** (`acos/cos/sin`) for accurate distances.
  - Indexing recommendation:
    ```sql
    CREATE INDEX idx_lat_lng ON providers(latitude, longitude);
    ```
- This keeps performance nearly constant whether there are **10** or **100,000** providers.

---

## 🧰 Testing

Run tests with:
```bash
bun test
```

This will:
- Spin up an in-memory server.
- Insert test providers.
- Verify that distance sorting and test-user logic work.

---

## 🧩 Folder Structure
```
providers-nearby/
├── src/
│   ├── db.ts
│   ├── server.ts
│   ├── models/
│   │   └── provider.ts
│   ├── routes/
│   │   └── providers.ts
│   └── middleware/
│       └── testUser.ts
├── test/
│   └── providers.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📜 License

MIT License  
© 2025 Providers Nearby API
