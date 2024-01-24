# Stage 1: Build
FROM node:18 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL

RUN touch .env
# Write the api url into the env file
RUN echo REACT_APP_API_URL=${REACT_APP_API_URL} > .env

RUN cat .env

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
