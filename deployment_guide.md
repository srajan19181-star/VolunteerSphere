# VolunteerSphere Deployment Guide

This guide walks you through deploying the full-stack **VolunteerSphere** application. 

Since the project is structured as a monorepo (with `/client` and `/server` folders), we will deploy the **backend API on Render** (free-tier Node.js hosting) and the **frontend client on Vercel** (free-tier optimized static hosting).

---

## Prerequisites
1. Ensure your latest changes are pushed to a **GitHub Repository** (either public or private).
2. Create a free account on **[Render](https://render.com/)**.
3. Create a free account on **[Vercel](https://vercel.com/)**.

---

## Phase 1: Deploy the Backend (Render)

Render is great for hosting Node.js Express APIs. It automatically pulls changes from GitHub and redeploys.

### Step-by-Step Instructions:
1. Log in to your **Render Dashboard**.
2. Click **New +** and select **Web Service**.
3. Connect your **GitHub account** and choose the repository containing `VolunteerSphere`.
4. Configure the Web Service settings:
   * **Name**: `volunteersphere-api` (or any custom name)
   * **Region**: Choose the region closest to you or your users.
   * **Branch**: `main` (or whichever branch you push to)
   * **Root Directory**: `server` *(Crucial: This tells Render to only build inside the server folder)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Instance Type**: `Free`
5. Scroll down and click **Advanced** to add **Environment Variables**:
   * Add the following keys exactly as they appear in your local `server/.env`:
     
     | Key | Value | Description |
     | :--- | :--- | :--- |
     | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
     | `JWT_SECRET` | `volunteersphere_super_secret_jwt_key_...` | A long, secure random password string |
     | `JWT_EXPIRE` | `7d` | Token lifespan |
     | `EMAIL_HOST` | `smtp.gmail.com` | SMTP host |
     | `EMAIL_PORT` | `587` | SMTP port |
     | `EMAIL_USER` | `your-email@gmail.com` | Your SMTP username |
     | `EMAIL_PASS` | `your-gmail-app-password` | Your SMTP App Password |
     | `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Cloudinary Cloud Name |
     | `CLOUDINARY_API_KEY` | `your-cloudinary-api-key` | Cloudinary API Key |
     | `CLOUDINARY_API_SECRET` | `your-cloudinary-api-secret` | Cloudinary API Secret |
     | `NODE_ENV` | `production` | Enables production mode |
     | `CLIENT_URL` | *(Leave empty for now, we will set this in Phase 3)* | The URL of your Vercel frontend |
6. Click **Create Web Service**. 
7. Once deployed, Render will provide a public URL for your API at the top-left of the page (e.g. `https://volunteersphere-api.onrender.com`). **Copy this URL**.

---

## Phase 2: Deploy the Frontend (Vercel)

Vercel provides optimized hosting for static frontends like Vite and React.

### Step-by-Step Instructions:
1. Log in to the **Vercel Dashboard**.
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository containing `VolunteerSphere`.
4. Configure the Project settings:
   * **Framework Preset**: `Vite` (Vercel detects this automatically)
   * **Root Directory**: Click *Edit* and select the `client` folder. *(Crucial: This tells Vercel to build the frontend)*
5. Under **Build and Development Settings**:
   * Verify **Build Command** is `npm run build` or `vite build`.
   * Verify **Output Directory** is `dist`.
6. Expand the **Environment Variables** section and add:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://YOUR-RENDER-API-URL/api` (e.g., `https://volunteersphere-api.onrender.com/api` — *Note the trailing `/api`*)
7. Click **Deploy**.
8. Once complete, Vercel will give you a public URL (e.g., `https://volunteersphere.vercel.app`). **Copy this URL**.

---

## Phase 3: Connect Frontend & Backend (CORS)

For security, the backend needs to know the exact URL of the frontend so it allows logins and requests.

### Step-by-Step Instructions:
1. Go back to your **Render Dashboard** and open your Web Service (`volunteersphere-api`).
2. Go to the **Environment** tab.
3. Find the `CLIENT_URL` variable.
4. Set its value to your Vercel frontend URL (e.g., `https://volunteersphere.vercel.app` — *No trailing slash*).
5. Save changes. Render will automatically roll out a brief update to apply the change.

---

## Verification
1. Open your Vercel frontend URL in a browser.
2. Register a new account, upload a profile photo, and check that the registration completes.
3. Browse the Events catalog and ensure the Leaflet map and events load successfully.
4. Try joining an event to verify database operations.
