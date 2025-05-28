import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Create Vue app
const vueApp = createApp(App);

// Make Firebase available globally
vueApp.config.globalProperties.$firebase = firebaseApp;
vueApp.config.globalProperties.$db = db;
vueApp.config.globalProperties.$auth = auth;

// Use router and mount app
vueApp.use(router);
vueApp.mount("#app");
