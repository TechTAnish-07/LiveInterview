# 🎙️ LiveInterview

> A real-time interview platform that seamlessly connects **HR professionals** and **candidates** — with live video calls and a collaborative coding editor in one unified workspace.

🌐 **Live Demo:** [live-interview-ten.vercel.app](https://live-interview-ten.vercel.app)

---

## 🚀 Features

- 📹 **Live Video Calls** — Real-time video communication between HR and candidates
- 💻 **Collaborative Code Editor** — In-browser coding environment for technical rounds
- 🔐 **Authentication** — Secure login for HR and candidate roles
- 📅 **Interview Session Management** — Schedule, join, and manage interview sessions
- 🧑‍💼 **Role-based Access** — Separate dashboards and permissions for HR and candidates
- 📱 **Responsive UI** — Clean and intuitive interface built with React.js

---

## 🛠️ Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Frontend   | React.js, CSS       |
| Backend    | Spring Boot (Java)  |
| Database   | MySQL               |
| Deployment | Vercel (Frontend)   |

---

## 📁 Project Structure

```
LiveInterview/
├── frontend/        # React.js application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   └── ...
│   └── package.json
│
└── backend/         # Spring Boot application
    ├── src/
    │   └── main/
    │       ├── java/     # Controllers, Services, Repositories
    │       └── resources/
    │           └── application.properties
    └── pom.xml
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v16+)
- Java 17+
- Maven
- MySQL

---

### 🖥️ Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will run at `http://localhost:3000`

---

### 🔧 Backend Setup

1. Configure your database in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/liveinterview
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

2. Run the Spring Boot server:

```bash
cd backend
mvn spring-boot:run
```

The API will run at `http://localhost:8080`

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Anish** — [@TechTAnish-07](https://github.com/TechTAnish-07)

> ⭐ If you found this project helpful, please consider giving it a star!
