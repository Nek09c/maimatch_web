import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";
import { initializeExtensionShield } from "./utils/extension-shield";

// Debug Firebase config
console.log("Firebase Config loaded:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasAuthDomain: !!firebaseConfig.authDomain,
  config: {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? "[HIDDEN]" : undefined,
  },
});

// Initialize extension protection
initializeExtensionShield();

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    // Validate required config
    if (!firebaseConfig.projectId) {
      throw new Error("Firebase projectId is required but not provided");
    }
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase apiKey is required but not provided");
    }

    console.log("Initializing Firebase...");
    const firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");

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
  } else {
    console.log("Firebase already initialized");
    const app = createApp(App);
    app.use(router);
    app.mount("#app");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Add error details to the page for debugging
  const errorDiv = document.createElement("div");
  errorDiv.style.color = "red";
  errorDiv.style.padding = "20px";
  errorDiv.style.whiteSpace = "pre-wrap";
  errorDiv.textContent = `Firebase Initialization Error:\n${
    error instanceof Error ? error.message : "Unknown error"
  }\n\nConfig State:\n${JSON.stringify(
    {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasAuthDomain: !!firebaseConfig.authDomain,
    },
    null,
    2
  )}`;
  document.body.appendChild(errorDiv);
  throw error;
}
