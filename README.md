# [format] - distributed forum software built on Matrix

## Licence
This project is licensed under the [`Apache License 2.0`](https://opensource.org/licenses/Apache-2.0). Contributors to this project must agree to releasing their contributions under that licence.

## Intro
This project contains a Vue single page "progressive web app" that is capable of connecting to a Matrix server using the JavaScript SDK, much like the Element chat client. Instead of emulating Discord/Slack/etc, however, this client works on specially scoped chat rooms that send forum posts as messages, and then presents a view to the user that looks a great deal like a traditional forum, like phpBB, MyBB, etc.

Like Element, you will have to log in through this app for it to get an access token; you might also consider taking an existing access token from elsewhere and "logging in" with that instead. (Then you don't have to trust this app with your credentials.)

A great deal more theoretical stuff yet to be determined! (Especially, discovery.)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```
