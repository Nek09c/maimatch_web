<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="cyber-box auth-loading">
    <span class="glitch">AUTHENTICATING...</span>
  </div>
  
  <!-- Error state -->
  <div v-if="error" class="auth-error">
    {{ error }}
  </div>
  
  <!-- Not authenticated -->
  <button v-if="!isAuthenticated" @click="handleGoogleSignIn" class="cyber-button glitch" :disabled="isLoading">
    CONNECT (LOGIN)
  </button>
  
  <!-- Authenticated - just the disconnect button -->
  <button v-else @click="handleSignOut" class="cyber-button glitch">
    DISCONNECT (LOGOUT)
  </button>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'

export default defineComponent({
  name: 'AuthComponent',
  setup() {
    const {
      isAuthenticated,
      isLoading,
      error,
      userDisplayName,
      userEmail,
      userPhotoURL,
      userId,
      signInWithGoogle,
      signOutUser,
      initializeAuth
    } = useAuth()

    const { createOrUpdateProfile } = useUserProfile()

    const handleGoogleSignIn = async () => {
      try {
        console.log('Starting Google sign in...');
        await signInWithGoogle()
        console.log('Google sign in successful, creating/updating profile...');
        // Create or update user profile after successful sign in
        await createOrUpdateProfile()
        console.log('Profile updated successfully');
      } catch (err) {
        console.error('Sign in failed:', err)
      }
    }

    const handleSignOut = async () => {
      try {
        await signOutUser()
      } catch (err) {
        console.error('Sign out failed:', err)
      }
    }

    // Initialize auth on component mount
    onMounted(() => {
      initializeAuth()
    })

    return {
      isAuthenticated,
      isLoading,
      error,
      userDisplayName,
      userEmail,
      userPhotoURL,
      userId,
      handleGoogleSignIn,
      handleSignOut
    }
  }
})
</script>

<style>
.auth-loading {
  text-align: center;
  padding: 1rem;
}

.auth-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  color: #ff0000;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
}

button.cyber-button {
  /* Ensure exact match with cyber-button styling */
  background: var(--system-bg) !important;
  color: var(--system-text) !important;
  border: 1px solid var(--system-border) !important;
  padding: 0.5rem 1rem !important;
  margin: 0 !important;
  font-family: "Courier New", monospace !important;
  text-transform: uppercase !important;
  cursor: pointer;
  position: relative;
  text-decoration: none;
  display: inline-block !important;
  vertical-align: middle;
  text-shadow: 0 0 8px rgba(242, 242, 242, 0.5), 0 0 15px rgba(242, 242, 242, 0.3);
  box-shadow: 0 0 10px rgba(242, 242, 242, 0.2), 0 0 20px rgba(242, 242, 242, 0.1);
  transition: all 0.3s ease;
  
  /* Additional resets to remove browser button defaults */
  font-size: inherit !important;
  line-height: inherit !important;
  border-radius: 0 !important;
  outline: none !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
}

button.cyber-button::before {
  content: '>';
  margin-right: 0.5rem;
}

button.cyber-button:hover {
  background: var(--system-text);
  color: var(--system-bg);
  border-color: var(--system-accent);
  animation: cyberButtonBlink 0.5s ease-in-out infinite;
}

button.cyber-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.cyber-button:disabled:hover {
  background: var(--system-bg);
  color: var(--system-text);
  border-color: var(--system-border);
  animation: none;
}

@keyframes cyberButtonBlink {
  0% {
    box-shadow: 0 0 15px rgba(242, 242, 242, 0.6), inset 0 0 10px rgba(242, 242, 242, 0.3), 0 0 25px rgba(242, 242, 242, 0.3);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }
  50% {
    box-shadow: 0 0 25px rgba(242, 242, 242, 1), inset 0 0 15px rgba(242, 242, 242, 0.5), 0 0 35px rgba(242, 242, 242, 0.6);
    text-shadow: 0 0 15px rgba(0, 0, 0, 1);
  }
  100% {
    box-shadow: 0 0 15px rgba(242, 242, 242, 0.6), inset 0 0 10px rgba(242, 242, 242, 0.3), 0 0 25px rgba(242, 242, 242, 0.3);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid var(--system-accent);
  filter: drop-shadow(0 0 10px rgba(242, 242, 242, 0.3));
}

.user-details {
  text-align: left;
}

.user-name {
  margin: 0;
  font-size: 1.1rem;
  color: var(--system-text);
}

.user-email {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: var(--system-accent);
  opacity: 0.8;
}

.user-id {
  margin: 0;
  font-size: 0.8rem;
  color: var(--system-glitch);
  opacity: 0.7;
  font-family: monospace;
}

.sign-out {
  background: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.sign-out:hover {
  background: #c82333;
  border-color: #c82333;
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .user-details {
    text-align: center;
  }
}
</style> 