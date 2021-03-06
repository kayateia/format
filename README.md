# [format] - distributed forum software built on Matrix

## Licence
This project is licensed under the [`Apache License 2.0`](http://www.apache.org/licenses/LICENSE-2.0). Contributors to this project must agree to releasing their contributions under that licence.

```
    Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

## Intro
This project contains a Vue single page "progressive web app" that is capable of connecting to a Matrix server using the JavaScript SDK, much like the Element chat client. Instead of emulating Discord/Slack/etc, however, this client works on specially scoped chat rooms that send forum posts as messages, and then presents a view to the user that looks a great deal like a traditional forum, like phpBB, MyBB, etc.

Like Element, you will have to log in through this app for it to get an access token; you might also consider taking an existing access token from elsewhere and "logging in" with that instead. (Then you don't have to trust this app with your credentials.)

A great deal more theoretical stuff yet to be determined! (Especially, discovery.)

## Status
**Experimental, to put it kindly.** Not very much is done yet. In fact, it's probably not even ready for outside contributions. A lot of structure still needs to go into place.

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
