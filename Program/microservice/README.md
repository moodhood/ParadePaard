# Project Management - Patient Service

This repository contains the Patient Service for the Project Management application.

## Running with Docker Compose

The application is configured to run with PostgreSQL using Docker Compose. Follow these steps to run the application:

1. Make sure you have Docker and Docker Compose installed on your machine.

2. Navigate to the root directory of the project (where the `docker-compose.yml` file is located).

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. The application will be available at http://localhost:4000

5. To stop the containers:
   ```bash
   docker-compose down
   ```

## API Endpoints

The following API endpoints are available:

- `GET /patients` - Get all patients
- `POST /patients` - Create a new patient
- `PUT /patients/{id}` - Update a patient
- `DELETE /patients/{id}` - Delete a patient

## Database Configuration

The application is configured to use PostgreSQL with the following settings:

- Database URL: `jdbc:postgresql://postgres:5432/patient_db`
- Username: `postgres`
- Password: `postgres`

These settings are defined in the `docker-compose.yml` file and passed to the application as environment variables.

## Troubleshooting

If you encounter any issues with the application not retrieving data from the database, check the following:

1. Make sure the PostgreSQL container is running:
   ```bash
   docker ps
   ```

2. Check the logs of the patient-service container:
   ```bash
   docker logs patient-service
   ```

3. If needed, you can connect to the PostgreSQL container and check the database:
   ```bash
   docker exec -it postgres psql -U postgres -d patient_db
   ```
   
   Then you can run SQL queries to check if the data is present:
   ```sql
   SELECT * FROM patient;
   ```

4. If the tables are not created or the data is not present, you can try restarting the patient-service container:
   ```bash
   docker-compose restart patient-service
   ```

5. If the issue persists, you can try rebuilding the containers:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```