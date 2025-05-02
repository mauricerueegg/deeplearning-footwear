# Usage
# docker build --platform=linux/amd64 -t mosazhaw/djl-footwear-classification .     # für Windows (Intel/AMD)
# docker build --platform=linux/arm64 -t mosazhaw/djl-footwear-classification .     # für Apple Silicon (M1/M2)
# docker run --name djl-footwear-classification -p 8080:8080 -d mosazhaw/djl-footwear-classification

FROM --platform=$BUILDPLATFORM openjdk:21-jdk-slim

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

# Build the application (skip tests for faster image build)
RUN ./mvnw -Dmaven.test.skip=true package

# Expose application port
EXPOSE 8080

# Run the packaged JAR (adjust JAR name if necessary)
CMD ["java", "-jar", "/usr/src/app/target/playground-0.0.1-SNAPSHOT.jar"]