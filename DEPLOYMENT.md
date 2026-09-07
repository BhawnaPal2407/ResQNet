# ResQNet Deployment & Production Setup Guide

This guide details how to build, run, and deploy the ResQNet Spring Boot backend and PostgreSQL database across local, Docker, and cloud hosting environments.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 21 JDK installed (`java -version`)
- Gradle Wrapper (included in `./gradlew`)

### 1. Run Spring Boot Backend (In-Memory H2 Mode)
No external database setup required. By default, Spring Boot boots using an embedded H2 database.

```bash
cd ResQNet
./gradlew bootRun
```

The backend server starts at `http://localhost:8080`.
- **Health check endpoint**: `http://localhost:8080/actuator/health`
- **H2 Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:resqdb`, User: `sa`, Password: empty)
- **Initial Admin Credentials**:
  - Email: `admin@resqnet.com`
  - Password: `Admin@123`

---

## 🐳 Docker Deployment

### Prerequisites
- Docker Engine & Docker Compose installed

### 1. Start Full Stack with Docker Compose
Run the backend and PostgreSQL database together:

```bash
docker-compose up -d --build
```

### 2. Check Services Status
```bash
docker-compose ps
docker-compose logs -f backend
```

---

## ☁️ Cloud Deployment Options

### 1. Deploying Backend to Render / Railway / Fly.io

1. **Environment Variables**:
   Configure the following variables in your cloud provider dashboard:
   - `PORT`: `8080` (or leave default provided by cloud platform)
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<db_host>:<db_port>/<db_name>?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `<db_username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<db_password>`
   - `SPRING_DATASOURCE_DRIVER_CLASS_NAME`: `org.postgresql.Driver`
   - `SPRING_JPA_DATABASE_PLATFORM`: `org.hibernate.dialect.PostgreSQLDialect`
   - `JWT_SECRET`: `<your_secure_random_base64_string>`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`

2. **Build Settings**:
   - **Build Command**: `./gradlew bootJar --no-daemon -x test`
   - **Start Command**: `java -jar build/libs/ResQNet-0.0.1-SNAPSHOT.jar`
   - Or deploy via Docker container using `ResQNet/Dockerfile`.

---

## 🔒 Production Security Checklist

1. **Change Default Admin Password**: Log in immediately after first boot and change the admin password.
2. **Override `JWT_SECRET`**: Set a long, cryptographically secure secret (minimum 256-bits) via env var.
3. **Restrict CORS**: Replace `CORS_ALLOWED_ORIGINS=*` with your specific frontend application URL(s).
4. **Enforce HTTPS**: Always enable SSL/TLS termination at the load balancer or cloud proxy.
