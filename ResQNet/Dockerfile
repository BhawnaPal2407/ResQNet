# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy gradle wrapper and configuration
COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./

# Copy source code
COPY src src

# Make gradlew executable and build executable JAR
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S resqnet && adduser -S resqnet -G resqnet
USER resqnet:resqnet

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Environment variables with defaults
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1

# Entry point
ENTRYPOINT ["java", "-jar", "app.jar"]
