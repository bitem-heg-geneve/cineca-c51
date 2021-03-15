# Cineca Demonstrator React App

## Requirements

* Make sure Node >= 10.16 and npm >= 5.6 are installed

* Make sure python 3 is available on your machine (tiny backend)

## Installation

* Create a react application in order to get the necessary modules

### `npx create-react-app react-test-1`
### `cd react-test-1`

* Clone the project locally

### `cd ..`
### `git clone https://github.com/bitem-heg-geneve/cineca-c51.git`
### `cd cineca-c51`

* Move or link the node_modules directory in react-test-1 to the project directory

### `mv ../react-test-1/node_modules .`
or
### `ln -s ../react-test-1/node_modules`

* Install additional dependencies of the project
### `npm install --save react-router-dom`
### `npm install --save evergreen-ui`

## Run it locally

In the project directory

* Start the backend:
### `python3 cineca_httpserver.py &`

Runs the app in the development mode.
### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
