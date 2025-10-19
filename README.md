# Overall running instructions for the project

**From the parent directory** containing both backend and frontend:

```bash
docker compose up --build --force-recreate -d
or just:
docker compose up -d
```

This will:
1) Rebuild from latest code, all images (backend, frontend, database)
2) Recreate all containers with latest images
3) Run containers in detached mode

This will: 
- Start PostgreSQL on port `5433` (mapped from 5432)
- Auto-run schema and seed scripts via Docker entrypoint
- Build and start the backend on port `5000`
- Build and start the frontend on port `3000`

Changed to port 5433 for DB as I was having issues on my local machine, ideally we should just stick to 5432 

**Access:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- API Documentation: `http://localhost:5000/api-docs`
- Health Check: `http://localhost:5000/health`

To test the backend API, you can use tools like Postman or curl to send requests to the endpoints defined in the API documentation.
API DOCS: http://localhost:5000/api-docs or reference [openapi.yaml](Task-manager-Backend-Submission/openapi.yaml) or the postman collection [postman_collection.json](Task-manager-Backend-Submission/postman_collection.json)
