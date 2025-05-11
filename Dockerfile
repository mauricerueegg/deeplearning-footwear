# Usage
# Dockerfile für Azure-kompatibles Image (amd64!)
# Baue mit:
# docker buildx build --platform=linux/amd64 -t mauricerueegg/djl-flower-classification:v4 --push .

FROM --platform=linux/amd64 openjdk:21-jdk-slim

# Set working directory
WORKDIR /usr/src/app

# Copy Maven wrapper and project files
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Copy application source and model assets
COPY src src
COPY models models

# Make Maven wrapper executable
RUN chmod +x mvnw

# Optional: Zeilenenden korrigieren (wenn du mit Windows arbeitest)
RUN sed -i 's/\r$//' mvnw

# Build the application (skip tests for faster image build)
RUN ./mvnw -Dmaven.test.skip=true package

# Expose application port
EXPOSE 8080

# Run the packaged JAR (prüfe JAR-Namen!)
CMD ["java", "-jar", "/usr/src/app/target/playground-0.0.1-SNAPSHOT.jar"]