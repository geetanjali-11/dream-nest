# Dream Nest Deployment

This project is prepared for a split deployment:

- Vercel for the React frontend
- Render for the Express backend
- MongoDB Atlas for the database

## Environment variables

### Render backend

- `MONGO_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT`
- `CLIENT_URL=https://your-vercel-domain.vercel.app`

### Vercel frontend

- `REACT_APP_API_URL=https://your-render-service.onrender.com`

### Local frontend development only

- `REACT_APP_API_URL=http://localhost:3001`

## Render setup

1. Push this project to GitHub.
2. In Render, create a new Web Service from that GitHub repo.
3. Set the Root Directory to `server`.
4. Render can use the included `render.yaml`, or use these values manually:

```bash
npm ci
```

```bash
npm start
```

5. Add the backend environment variables listed above.
6. Deploy once to get your live backend URL, such as `https://dream-nest-api.onrender.com`.

## Vercel setup

1. In Vercel, import the same GitHub repo.
2. Set the Root Directory to `client`.
3. Vercel can detect Create React App automatically. The included `client/vercel.json` is only there to make that explicit.
4. Add this frontend environment variable:

```bash
REACT_APP_API_URL=https://your-render-service.onrender.com
```

5. Deploy the frontend.
6. Copy your Vercel URL and put it back into Render as `CLIENT_URL`.
7. Redeploy Render so CORS allows the real frontend domain.

## Deployment order

1. Deploy Render first
2. Copy the Render backend URL
3. Deploy Vercel with `REACT_APP_API_URL`
4. Copy the Vercel frontend URL
5. Update Render `CLIENT_URL`
6. Redeploy Render

## MongoDB notes

- Use MongoDB Atlas for production.
- Make sure your Atlas network access allows your hosting provider.
- Uploaded images are now stored in MongoDB GridFS instead of the local filesystem.

## Local run

Backend:

```bash
cd server
npm install
npm start
```

Frontend:

```bash
cd client
npm install
npm start
```

## Production behavior

- protected endpoints require a Bearer token
- listing and profile images are served through `/uploads/:filename`
- frontend talks to Render through `REACT_APP_API_URL`
