# To-Let Mama

To-Let Mama is a rental-listing app for students and property owners. The frontend uses React and Vite; the API is Laravel; MySQL and the application run with Docker Compose.

## Run locally with Docker

1. Install Docker Desktop and start its Linux container engine.
2. From the repository root, create the frontend environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Put your Google OAuth **Web application client ID** in `VITE_GOOGLE_CLIENT_ID` in `.env`. Google sign-in stays unavailable until a client ID is configured and `http://localhost:5173` is listed as an authorized JavaScript origin in Google Cloud Console. Compose passes that same ID to Laravel for server-side token verification.
4. Start the app:

   ```powershell
   docker compose up --build
   ```

Open the frontend at `http://localhost:5173`; the Laravel API is at `http://localhost:8000`. The backend entrypoint runs migrations, creates the public upload link, and seeds repeatable local demo data. The checked-in `docker.env` uses local-only sample database credentials; replace them before deploying or exposing the services to a network.

Uploaded listing photos are JPG, PNG, or WebP, up to 5 MB each and 5 per listing. The API stores files on Laravel's public disk and listing records keep their URLs.

## Demo accounts

The local seeder creates one owner and four student accounts. Each seeded account uses the password `password`:

- Owner: `demo-owner@toletmama.local`
- Students: `demo-student-1@toletmama.local` through `demo-student-4@toletmama.local`

The seeder is safe to run more than once and preserves existing users/listings. Demo credentials are for local development only.

## Useful commands

```powershell
# Stop the app
docker compose down

# Run backend feature tests inside the backend container
docker compose exec backend php artisan test

# Re-run the safe local demo seeder
docker compose exec backend php artisan db:seed --class=ListingSeeder
```

`backend/.env.example` is for running Laravel directly outside Compose. In the Compose setup, `docker.env` supplies backend and MySQL variables, while root `.env` supplies Vite's variables and the Google client ID.
