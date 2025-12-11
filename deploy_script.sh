#!/bin/bash

# Deploy Artist Bazaar app on Ubuntu

set -e  # Stop on error

# Function to clone the ArtistBazaar code
code_clone() {
    echo "Cloning the ArtistBazaar repository..."
    if [ -d "ArtistBazaar" ]; then
        echo "Directory 'ArtistBazaar' already exists. Skipping clone."
    else
        git clone https://github.com/Rogshivam/ArtistBazaar.git || {
            echo "Failed to clone repository!"
            return 1
        }
    fi
}

# Function to install dependencies
install_requirements() {
    echo "Installing dependencies using apt..."

    sudo apt update -y || return 1
    sudo apt upgrade -y || return 1

    sudo apt install -y docker.io docker-compose-plugin git || {
        echo "Failed to install Docker or dependencies."
        return 1
    }

    # Enable Docker
    sudo systemctl enable docker
    sudo systemctl restart docker
}

# Function to fix permissions
required_restarts() {
    echo "Fixing docker.sock permissions..."

    sudo usermod -aG docker $USER || {
        echo "Failed to add user to docker group"
        return 1
    }

    sudo chown $USER:$USER /var/run/docker.sock || {
        echo "Failed to update docker.sock permissions."
        return 1
    }
}

# Function to deploy the app
deploy() {
    echo "Deploying ArtistBazaar..."

    cd ArtistBazaar || {
        echo "Project directory not found!"
        return 1
    }

    # Run containers
    docker compose up -d || {
        echo "Docker compose failed!"
        return 1
    }

    echo "Deployment successful!"
}

# Main script
echo "********** DEPLOYMENT STARTED *********"

code_clone
install_requirements
required_restarts
deploy

echo "********** DEPLOYMENT COMPLETED *********"
echo "✅ 1. To check running containers, run:  docker ps"
echo "   Look for PORTS like:  0.0.0.0:4000->4000/tcp (backend) or 0.0.0.0:3000->4173/tcp (frontend)"
echo ""
echo "👉 Backend URL:   http://localhost:4000"
echo "👉 Frontend URL:  http://localhost:3000"


