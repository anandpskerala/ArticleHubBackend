# ArticleHubBackend

Welcome to the **ArticleHubBackend**! This repository hosts the backend API for ArticleHub, a platform designed for managing articles. It provides a robust and scalable solution for handling article creation, retrieval, updates, and deletions, along with user authentication.

## ✨ Features

* **RESTful API:** A well-structured API for seamless interaction.

* **User Authentication:** Secure user registration and login.

* **Article Management:** CRUD (Create, Read, Update, Delete) operations for articles.

* **Scalable Architecture:** Built with Node.js and Express.js for performance.

* **Containerization:** Docker support for easy deployment and portability.

## 🛠️ Technologies Used

* **Node.js:** JavaScript runtime environment.

* **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.

* **TypeScript:** Superset of JavaScript that adds static typing.

* **MongoDB:** NoSQL database for flexible data storage.

* **Mongoose:** MongoDB object data modeling (ODM) for Node.js.

* **PNPM:** Fast, disk space efficient package manager.

* **Docker:** Platform for developing, shipping, and running applications in containers.

## 🚀 Getting Started

Follow these steps to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed:

* **Node.js** (LTS version recommended)

* **PNPM** (`npm install -g pnpm`)

* **MongoDB** (running locally or accessible via a connection string)

* **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/anandpskerala/ArticleHubBackend.git
cd ArticleHubBackend
```

2. **Install dependencies:**

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```
PORT=5000
MONGO_URI=mongodb+srv://mongourl
JWT_SECRET=secret
FRONTEND_URL=http://localhost:5173
CLOUD_NAME=cloudinaryname
CLOUD_API_KEY=api_key
CLOUD_SECRET=secret
```

### Running the Application

**Development Mode:**

```bash
pnpm dev
```

This will start the server in development mode, typically with hot-reloading.

**Production Mode:**

1. **Build the project:**

```
pnpm build
```

2. **Start the server:**
```
pnpm start
```

**Using Docker:**

1. **Build the Docker image:**

```
docker build -t articlehub-backend .
```

2. **Run the Docker container:**
```
docker run -p 5000:5000 -d --name articlehub-app articlehub-backend
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.

2. Create a new branch (`git checkout -b feature/your-feature-name`).

3. Make your changes.

4. Commit your changes (`git commit -m 'feat: Add new feature'`).

5. Push to the branch (`git push origin feature/your-feature-name`).

6. Open a Pull Request.

## 📄 License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.