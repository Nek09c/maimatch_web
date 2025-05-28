<template>
  <div v-if="isAuthenticated" class="user-info-display">
    <img v-if="userPhotoURL" :src="userPhotoURL" :alt="userDisplayName" class="user-avatar" />
    <div class="user-details">
      <h4 class="user-name glitch">{{ userDisplayName }}</h4>
      <p class="user-email">{{ userEmail }}</p>
      <p class="user-id">ID: {{ userId.substring(0, 8) }}...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  name: 'UserInfo',
  setup() {
    const {
      isAuthenticated,
      userDisplayName,
      userEmail,
      userPhotoURL,
      userId
    } = useAuth()

    return {
      isAuthenticated,
      userDisplayName,
      userEmail,
      userPhotoURL,
      userId
    }
  }
})
</script>

<style scoped>
.user-info-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--system-border);
  background: var(--system-bg);
  box-shadow: 0 0 10px rgba(242, 242, 242, 0.2), 0 0 20px rgba(242, 242, 242, 0.1);
  transition: all 0.3s ease;
}

.user-info-display:hover {
  box-shadow: 0 0 15px rgba(242, 242, 242, 0.4), 0 0 25px rgba(242, 242, 242, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--system-accent);
  filter: drop-shadow(0 0 8px rgba(242, 242, 242, 0.3));
}

.user-details {
  text-align: left;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 0.9rem;
  color: var(--system-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  margin: 0.1rem 0 0 0;
  font-size: 0.75rem;
  color: var(--system-accent);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-id {
  margin: 0.1rem 0 0 0;
  font-size: 0.7rem;
  color: var(--system-glitch);
  opacity: 0.7;
  font-family: monospace;
}

@media (max-width: 768px) {
  .user-info-display {
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  
  .user-name {
    font-size: 0.8rem;
  }
  
  .user-email {
    font-size: 0.7rem;
  }
  
  .user-id {
    display: none; /* Hide ID on mobile for space */
  }
}
</style> 