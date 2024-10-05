# Backend

Full backend for the app.

Specify TODO in TODO.md

## How to setup

1. **Prerequisites:**

   - [![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/downloads)
     - used version: `2.43.0.windows.1`
   - [![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/download/prebuilt-installer) [![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://nodejs.org/en/download/prebuilt-installer)
     - node used version: `v20.2.0`
     - npm used version: `9.6.6`
   - [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
     - used version: `7.0`

2. **[Create git to github ssh key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).**
3. **Clone repo:**

   ```powershell|terminal|shell
   git clone https://github.com/ApliCraft/Backend
   ```

4. **cd into repo and install needed packages:**

   ```powershell|terminal|shell
   cd Backend
   npm i
   ```

5. **(optional)** Create .env file with

   `PORT=[website port]`

   `MONGO_URI=[mongodb url with db name example: (mongodb://localhost:27017/ApliCraft)]`

   ![alt text](./assets/image.png)

6. **Run the app/build/run** as development environment:

   ```powershell|terminal|shell
    npm start
    npm run build
    npm run dev
   ```
