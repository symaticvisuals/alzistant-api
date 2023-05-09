# Specify the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port used by the application
EXPOSE 3000

# Copy the environment variables file to the container
COPY .env .

# Start the application
CMD ["npm", "start"]
