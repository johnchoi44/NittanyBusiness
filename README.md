<br />
<div align="center">
    <h2 align="center">Nittany Business</h2>
    <p align="center">
        NittanyBusiness is a modern online marketplace designed to simplify bulk ordering and streamline business transactions. Our platform bridges the gap between small and medium-sized enterprises (SMEs) and trusted suppliers, offering a reliable, user-friendly ecosystem built for efficiency, transparency, and growth. Whether you're sourcing materials or expanding your supply chain, NittanyBusiness empowers you to do business better.
    </p>
    <p align="center">
        The project is built for CMPSC 431W at Penn State.
    </p>
</div>
<br />
<div align="center">
    <img alt="Static Badge" src="https://img.shields.io/badge/Node-20232A?style=for-the-badge&logo=nodedotjs">
    <img alt="Static Badge" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=React&logoColor=61DAFB">
    <img alt="Static Badge" src="https://img.shields.io/badge/HTML-20232A?style=for-the-badge&logo=html5">
    <img alt="Static Badge" src="https://img.shields.io/badge/CSS-20232A?style=for-the-badge&logo=css">
    <img alt="Static Badge" src="https://img.shields.io/badge/JavaScript-20232A?style=for-the-badge&logo=javascript">
    <img alt="Static Badge" src="https://img.shields.io/badge/SQLite-20232A?style=for-the-badge&logo=sqlite&logoColor=003B57">
</div>

## Contributors
<div align="center">
    <a href="https://github.com/github_username/repo_name/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=johnchoi44/NittanyBusiness" alt="contrib.rocks image" />
    </a>
</div>
<br />
<table align="center">
  <tr>
    <th>Name</th>
    <th>GitHub</th>
    <th>Contact</th>
  </tr>
  <tr>
    <td>Eric Shoch</td>
    <td>@shocheric</td>
    <td>ecs5694@psu.edu</td>
  </tr>
  <tr>
    <td>Kenzy Kim</td>
    <td>@k3nzzy</td>
    <td>sfl5778@psu.edu</td>
  </tr>
  <tr>
    <td>Shibli Nomani</td>
    <td>@Khavab</td>
    <td>sdn5184@psu.edu</td>
  </tr>
  <tr>
    <td>Yongjun Choi</td>
    <td>@johnchoi44</td>
    <td>ybc5222@psu.edu</td>
  </tr>
</table>
<br />

## Project Roadmap

- For project roadmap, refer to [#7 Implementation Tracker](https://github.com/johnchoi44/NittanyBusiness/issues/7).
- See [open issues](https://github.com/johnchoi44/NittanyBusiness/issues) for full list of known issues and propsed features.

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
Alternatively, run this script from the root directory to start both services at once.
```
./dev_start.sh
```
This is a shell script that will reset the db file and start the frontend and backend together. Simply CTRL+C to stop both processes at once.


### SQL code to merge datasets
```angular2html
UPDATE Users
SET user_type = (
    SELECT GROUP_CONCAT(user_type, ', ')FROM (
        SELECT b.user_type FROM Buyer b WHERE b.email = Users.email
        UNION
        SELECT s.user_type FROM Sellers s WHERE s.email = Users.email
        UNION
        SELECT h.user_type FROM Helpdesk h WHERE h.email = Users.email
    )
);
```
