# Stonkboard
A simple web app for comparing up to three stocks by price and EPS.

## Running locally
* You will need to provide an API key for [Alpha Vantage](https://www.alphavantage.co/ "Alpha Vantage") in the application settings
    * `cp src/settings_example.ts src/settings.ts`
    * Edit `src/settings.ts`, filling in the value of `ALPHA_VANTAGE_API_KEY`
* Run `npm install`
* Run `npx snowpack dev`
* Your browser should open to the app at http://localhost:8080/

## Running tests
* `npm test`

## Creating a production build
* `npx snowpack build`
* Upload the `build/` directory
