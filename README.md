# geoguessr-bot

Discord Bot to help you create GeoGuessr games

## Usage

- Install dependencies:
  ```shell
  yarn
  ```
- Run project:
  ```shell
  yarn start
  ```

## Available scripts

### `yarn start`

Runs the project in development mode.

The project will reload using `nodemon` if you make edits.
You can see any `babel` compilation error in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.
This will run lint files using `eslint`.

### `yarn build`

Build project using `babel` to make it ready for production.
This should be run before launching `yarn serve`.

### `yarn serve`

Runs the project in production mode. Make sure you run `yarn build` before this script.

## Configuration

Application configuration is provided by environment variables and accessed in code with `process.env.VARIABLE_NAME`.

Environments variables are loaded using the definitions in the `.env.defaults` file.
If you need to override some of them, you can create a `.env` file with your overrides.

> If new environment variables are required by the app, they can be added to the `.env.defaults` to document them.
