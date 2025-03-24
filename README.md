# NittanyBusiness
CMPSC 431 Database Management Project

## Requirements

* node
* sqlite3
* bcrypt
* cors
* csv-parser
* dotenv
* express
* react-router-dom
* axios
* react
* react-dom
* react-scripts

## Project Structure
The code is organized into two main modules:

1. **frontend/**: Frontend
2. **backend/**: Backend

~~~
├── backend/
│   ├── data/                    # Folder to store all CSV data files for import
│   ├── README.md                # Documentation for backend setup and usage
│   ├── db.js                    # Handles SQLite database connection and exports the db
│   ├── package-lock.json        
│   ├── package.json             # Defines backend dependencies and scripts
│   └── server.js                # Main server file
├── frontend/
│   ├── public/                  # Statis assets
│   ├── src/                     # React source files
│   │   ├── components/          # React component files
│   │   │   ├── Home.js          # Homepage component
│   │   │   ├── Login.js         # User login form component
│   │   │   └── SignUp.js        # User registration form component
│   │   ├── App.css              # Global styles for frontend app
│   │   ├── App.js               # Root component
│   │   ├── index.css            # Global styles
│   │   └── index.js             # Main entry point that renders the React app
│   ├── README.md                # Documentation for frontend
│   ├── package-lock.json        # 
│   └── package.json             # Defines frontend dependencies and scripts
├── .idea/
└── README.md                    # Main documentation for the entire project
~~~



## Usage

### Quick Start
Install all required dependencies
```
cd frontend
npm start

cd ..
cd backend
node server.js

```
