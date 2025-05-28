import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";
import { initializeExtensionShield } from "./utils/extension-shield";

// Initialize extension protection
initializeExtensionShield();

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Create Vue app
const app = createApp(App);

// Make Firebase available globally
app.config.globalProperties.$firebase = firebaseApp;
app.config.globalProperties.$db = db;
app.config.globalProperties.$auth = auth;

// Use router and mount app
app.use(router);
app.mount("#app");
