#!/bin/bash

# BodaBoda Deployment Script
# Automated deployment for staging and production environments

set -e  # Exit on any error

# Configuration
REGISTRY="ghcr.io"
IMAGE_NAME="bodaboda-app"
VERSION=${GITHUB_REF#refs/*/}  # Extract branch/tag
ENVIRONMENT=${1:-staging}  # Default to staging

echo "🚀 BodaBoda Deployment Script"
echo "📍 Environment: $ENVIRONMENT"
echo "🏷️  Version: $VERSION"

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -f ./backend/Dockerfile.enhanced -t $REGISTRY/$IMAGE_NAME:$VERSION .
docker push $REGISTRY/$IMAGE_NAME:$VERSION

if [ $? -ne 0 ]; then
    echo "❌ Docker build/push failed!"
    exit 1
fi

# Deploy based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "🎭 Deploying to staging..."
    
    # Staging deployment
    docker-compose -f docker-compose.staging.yml up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    # Health check
    echo "🏥️ Running health checks..."
    curl -f http://staging.bodaboda.app/api/health
    
    if [ $? -eq 0 ]; then
        echo "✅ Staging deployment successful!"
        echo "🌐 Staging URL: https://staging.bodaboda.app"
    else
        echo "❌ Staging deployment failed!"
        exit 1
    fi

elif [ "$ENVIRONMENT" = "production" ]; then
    echo "🎉 Deploying to production..."
    
    # Production deployment
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 60
    
    # Health check
    echo "🏥️ Running health checks..."
    curl -f http://bodaboda.app/api/health
    
    if [ $? -eq 0 ]; then
        echo "✅ Production deployment successful!"
        echo "🌐 Production URL: https://bodaboda.app"
        echo "📊 Monitoring: https://grafana.bodaboda.app"
    else
        echo "❌ Production deployment failed!"
        exit 1
    fi

else
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Use: ./deploy.sh [staging|production]"
    exit 1
fi

echo "🎯 Deployment completed!"
echo "📈 Next steps:"
echo "• Monitor application logs"
echo "• Check Grafana dashboard"
echo "• Verify API endpoints"
