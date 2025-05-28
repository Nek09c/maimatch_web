import { ref, computed, getCurrentInstance } from "vue";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "./useAuth";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  postsCount: number;
  preferences: {
    favoriteGenres: string[];
    skillLevel: string;
    favoriteLocations: string[];
  };
}

export function useUserProfile() {
  const instance = getCurrentInstance();
  const db = instance?.appContext.config.globalProperties.$db;
  const { currentUser, isAuthenticated } = useAuth();

  const userProfile = ref<UserProfile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  if (!db) {
    throw new Error("Firestore not initialized");
  }

  // Create or update user profile
  const createOrUpdateProfile = async () => {
    if (!isAuthenticated.value || !currentUser.value) {
      throw new Error("User not authenticated");
    }

    try {
      isLoading.value = true;
      error.value = null;

      const userRef = doc(db, "users", currentUser.value.uid);
      const userDoc = await getDoc(userRef);

      const now = Timestamp.now();

      if (userDoc.exists()) {
        // Update existing profile
        await updateDoc(userRef, {
          email: currentUser.value.email,
          displayName: currentUser.value.displayName,
          photoURL: currentUser.value.photoURL,
          lastLoginAt: now,
        });

        console.log("User profile updated");
      } else {
        // Create new profile
        const newProfile: UserProfile = {
          uid: currentUser.value.uid,
          email: currentUser.value.email || "",
          displayName: currentUser.value.displayName || "Anonymous",
          photoURL: currentUser.value.photoURL || "",
          createdAt: now,
          lastLoginAt: now,
          postsCount: 0,
          preferences: {
            favoriteGenres: [],
            skillLevel: "",
            favoriteLocations: [],
          },
        };

        await setDoc(userRef, newProfile);
        console.log("New user profile created");
      }

      // Load the updated profile
      await loadUserProfile();
    } catch (err: any) {
      console.error("Error creating/updating user profile:", err);
      error.value = err.message || "Failed to update user profile";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Load user profile
  const loadUserProfile = async (userId?: string) => {
    const targetUserId = userId || currentUser.value?.uid;

    if (!targetUserId) {
      return null;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const userRef = doc(db, "users", targetUserId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        userProfile.value = userDoc.data() as UserProfile;
        return userProfile.value;
      } else {
        console.log("User profile not found");
        return null;
      }
    } catch (err: any) {
      console.error("Error loading user profile:", err);
      error.value = err.message || "Failed to load user profile";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Update user preferences
  const updatePreferences = async (
    preferences: Partial<UserProfile["preferences"]>
  ) => {
    if (!isAuthenticated.value || !currentUser.value) {
      throw new Error("User not authenticated");
    }

    try {
      isLoading.value = true;
      error.value = null;

      const userRef = doc(db, "users", currentUser.value.uid);
      await updateDoc(userRef, {
        preferences: {
          ...userProfile.value?.preferences,
          ...preferences,
        },
      });

      // Reload profile
      await loadUserProfile();
    } catch (err: any) {
      console.error("Error updating preferences:", err);
      error.value = err.message || "Failed to update preferences";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Increment posts count
  const incrementPostsCount = async () => {
    if (!isAuthenticated.value || !currentUser.value) {
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.value.uid);
      const currentCount = userProfile.value?.postsCount || 0;

      await updateDoc(userRef, {
        postsCount: currentCount + 1,
      });

      // Update local profile
      if (userProfile.value) {
        userProfile.value.postsCount = currentCount + 1;
      }
    } catch (err: any) {
      console.error("Error incrementing posts count:", err);
      // Don't throw error for this non-critical operation
    }
  };

  return {
    // State
    userProfile: computed(() => userProfile.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Methods
    createOrUpdateProfile,
    loadUserProfile,
    updatePreferences,
    incrementPostsCount,
  };
}
