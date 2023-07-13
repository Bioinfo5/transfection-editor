# Compilation

1. Make sure [nodeJS](https://nodejs.org) is installed on your computer.
2. In the project folder where `package.json` is located, for example `c:\Users\Admin\Desktop\transfection-editor\`, install all project dependencies using command:
    ```bash
    npm install
    ```
3. To make production build run:
   ```bash
   npm run release
   ```
   Note: `run` keyword is mandatory, because `release` is a custom script name.
4. After this script will be successfully finished `/dist/Release.zip` appears in the project directory. This file contains all required files to run the web application. 



