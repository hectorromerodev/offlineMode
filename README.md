# NETWORK OFFLINE API SERVICE

## With this app I will learn to do an app with the option offline mode and store the data on the local storage.

#### Steps to start

1. ionic start networkOffline blank --type=angular
2. ionic g service services/api
3. ionic g service services/network
4. ionic g service services/offlineManager
5. npm install cordova-plugin-network-information
6. npm install @ionic-native/network
7. npm install cordova-sqlite-storage
8. npm install @ionic-native/sqlite
9. npm install @ionic/storage
10. ionic cap sync
11. Add `IonicStorageModule.forRoot()` adn `HttpClientModule` import in app.module.ts
12. Add `Network` provider in app.module.ts
