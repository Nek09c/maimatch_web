import { ref, computed, getCurrentInstance } from "vue";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// Global state for authentication
const currentUser = ref<User | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

export function useAuth() {
  const instance = getCurrentInstance();
  const auth = instance?.appContext.config.globalProperties.$auth;

  if (!auth) {
    throw new Error("Firebase Auth not initialized");
  }

  // Computed properties
  const isAuthenticated = computed(() => !!currentUser.value);
  const userDisplayName = computed(
    () => currentUser.value?.displayName || "Anonymous"
  );
  const userEmail = computed(() => currentUser.value?.email || "");
  const userPhotoURL = computed(() => currentUser.value?.photoURL || "");
  const userId = computed(() => currentUser.value?.uid || "");

  // Initialize auth state listener (only once)
  const initializeAuth = () => {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
      isLoading.value = false;
      if (user) {
        console.log("User signed in:", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        console.log("User signed out");
      }
    });
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      error.value = null;
      isLoading.value = true;

      const provider = new GoogleAuthProvider();
      // Optional: Add scopes if needed
      provider.addScope("email");
      provider.addScope("profile");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google sign-in successful:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      return user;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      error.value = err.message || "Failed to sign in with Google";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      error.value = null;
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (err: any) {
      console.error("Sign out error:", err);
      error.value = err.message || "Failed to sign out";
      throw err;
    }
  };

  // Get user data for database operations
  const getUserData = () => {
    if (!currentUser.value) return null;

    return {
      uid: currentUser.value.uid,
      email: currentUser.value.email,
      displayName: currentUser.value.displayName,
      photoURL: currentUser.value.photoURL,
      emailVerified: currentUser.value.emailVerified,
    };
  };

  return {
    // State
    currentUser: computed(() => currentUser.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed properties
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    userId,

    // Methods
    initializeAuth,
    signInWithGoogle,
    signOutUser,
    getUserData,
  };
}
