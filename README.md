## Configuration

1. Application configuration file: `src/shared/shared-config/config.json`
- API
- - URL: The API server URL
- - metadata_options: the metadata options path
2. Unit options file: `src/shared/shared-config/dd-options.json`
- file scheme:
```
{
   "unit_key": [
      "string_value1",
      "string_value2",
      ...,
      "string_valueN"
   ], ...
}
```
3. Metadata options are fetched from following database tables:
- `dotmatics_users` for the transfection scientist selector,
- `dotmatics_celllines` for the cell line selector,
- `dotmatics_reagents` for the transfection reagent selector,
- `sample_name_table` for the sample name selector,
- `dotmatics_treatment` for the treatment in well selector


## Compilation

1. Make sure [nodeJS](https://nodejs.org) is installed on your computer.
2. In the project folder where `package.json` is located, for example `c:\Users\Admin\Desktop\transfection-editor\`, install all project dependencies using command:
    ```bash
    npm install
    ```
3. To make production build following commands:
   ```bash
   npm run compil
   ```
   ```bash
   npm run release
   ```
   Note: `run` keyword is mandatory, because `compil` and `release` are custom script names.
4. After this script will be successfully finished `/dist/Release.zip` appears in the project directory. This file contains all required files to run the web application. 



