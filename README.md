
# Expense Tracker

An open-source Expense Tracker application to help users manage and track their expenses. The platform provides an easy way to upload bills, view leaderboard rankings, and generate detailed reports on monthly and yearly expenses.

## Features

- **Bill Uploader**: Easily upload and store digital copies of bills.
- **Leaderboard**: View top spenders in the organization based on monthly and yearly expenses.
- **Report Generation**: Generate detailed expense reports by month or year.
- **User Authentication**: Secure user login and account management.
- **Expense Categorization**: Tag and categorize expenses for precise reporting.

## Getting Started

These instructions will help you set up the project locally or on an EC2 instance.

### Prerequisites

- **Node.js** and **npm**
- **Database**: Set up a MySQL or PostgreSQL database, and configure the environment variables.
- **AWS S3** (optional): For storing bill uploads in the cloud.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/final-project-expense-tracker.git
   cd final-project-expense-tracker
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root of the project with:
   ```plaintext
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   AWS_S3_BUCKET_NAME=your_s3_bucket (optional)
   ```

4. **Run Database Migrations**:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Start the Server**:
   ```bash
   npm start
   ```
   Access the server at `http://localhost:3000`.

### Usage

- **Bill Upload**: Users can upload images or PDFs of bills.
- **Leaderboard**: View top spenders.
- **Report Generation**: Generate reports by month or year.



### Development

To start the development server with hot-reloading:
```bash
npm run dev
```

### Deployment on EC2


   ```

**Install Dependencies** and **Run the Application**.

**Process Management** (optional): Use `pm2` to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start npm --name "expense-tracker" -- start
   ```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository** on GitHub.
2. **Clone Your Fork** locally:
   ```bash
   git clone https://github.com/yourusername/final-project-expense-tracker.git
   ```
3. **Create a New Branch** for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
4. **Commit Your Changes** and **Push** them to your fork:
   ```bash
   git push origin feature-name
   ```
5. **Create a Pull Request** on the main repository.

### Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.


---

This version includes a **Contributing** section to encourage participation and a **Code of Conduct** reference for contributor guidelines. Let me know if you'd like further modifications!
