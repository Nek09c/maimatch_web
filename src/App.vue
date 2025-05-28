<template>
  <div class="app-container">
    <!-- Background Image -->
    <div class="background-image"></div>
    
    <NewsTicker />
    <header class="cyber-box">
      <h1 class="glitch">MAIMATCH</h1>
      <nav>
        <router-link to="/" class="cyber-button">HOME</router-link>
        <router-link to="/forum" class="cyber-button">FORUM</router-link>
        <router-link to="/posts" class="cyber-button">POSTS</router-link>
        <router-link to="/locations" class="cyber-button"
          >LOCATIONS</router-link
        >
        <router-link to="/songs" class="cyber-button">SONGS</router-link>
      </nav>
    </header>

    <main class="content-area">
      <div class="cyber-box">
        <ParticleTransition>
          <router-view :key="$route.fullPath"></router-view>
        </ParticleTransition>
      </div>
    </main>

    <footer class="cyber-box">
      <p>CONNECTED TO THE WIRED</p>
      <p class="glitch">MAIMATCH WEB v0.1.0</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import NewsTicker from './components/NewsTicker.vue';
import ParticleTransition from './components/ParticleTransition.vue';

export default defineComponent({
  name: "App",
  components: {
    NewsTicker,
    ParticleTransition
  },
  setup() {
    onMounted(() => {
      // Set background image after component mounts
      const backgroundElement = document.querySelector('.background-image') as HTMLElement;
      if (backgroundElement) {
        backgroundElement.style.backgroundImage = 'url(/maimatch_bg.JPG)';
      }
    });

    return {};
  },
});
</script>

<style>
@import "./assets/lain-theme.css";

:root {
  --system-bg: #000000;
  --system-text: #F2F2F2;
  --system-accent: #ff00ff;
  --system-glitch: #00ffff;
  --system-border: #333333;
}

body {
  background-color: var(--system-bg);
  color: var(--system-text);
  font-family: "Courier New", monospace;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  position: relative;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  opacity: 0.35;
  z-index: -2;
  pointer-events: none;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--system-border);
  background: var(--system-bg);
  position: relative;
  box-shadow: 0 0 15px rgba(242, 242, 242, 0.3), 0 0 25px rgba(242, 242, 242, 0.1);
  transition: all 0.3s ease;
}

header:hover {
  animation: headerBlink 0.8s ease-in-out infinite;
}

@keyframes headerBlink {
  0% {
    box-shadow: 0 0 15px rgba(242, 242, 242, 0.3), 0 0 25px rgba(242, 242, 242, 0.1);
  }
  50% {
    box-shadow: 0 0 25px rgba(242, 242, 242, 0.6), 0 0 35px rgba(242, 242, 242, 0.3);
  }
  100% {
    box-shadow: 0 0 15px rgba(242, 242, 242, 0.3), 0 0 25px rgba(242, 242, 242, 0.1);
  }
}

header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 0%, rgba(242, 242, 242, 0.1) 50%, transparent 100%);
  pointer-events: none;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

header:hover::before {
  animation: headerGradientBlink 0.8s ease-in-out infinite;
}

@keyframes headerGradientBlink {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}

nav {
  display: flex;
  gap: 1rem;
}

.content-area {
  flex: 1;
  padding: 1rem;
  background: transparent;
}

.content-area .cyber-box {
  background: transparent !important;
  backdrop-filter: none !important;
}

footer {
  text-align: center;
  padding: 1rem;
  border: 1px solid var(--system-border);
  background: var(--system-bg);
  box-shadow: 0 0 12px rgba(242, 242, 242, 0.3), 0 0 20px rgba(242, 242, 242, 0.1);
  transition: all 0.3s ease;
}

footer:hover {
  animation: footerBlink 0.7s ease-in-out infinite;
}

@keyframes footerBlink {
  0% {
    box-shadow: 0 0 12px rgba(242, 242, 242, 0.3), 0 0 20px rgba(242, 242, 242, 0.1);
  }
  50% {
    box-shadow: 0 0 20px rgba(242, 242, 242, 0.6), 0 0 30px rgba(242, 242, 242, 0.3);
  }
  100% {
    box-shadow: 0 0 12px rgba(242, 242, 242, 0.3), 0 0 20px rgba(242, 242, 242, 0.1);
  }
}

/* Systemspace-style text effects */
h1, h2, h3, h4, h5, h6 {
  font-family: "Courier New", monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  position: relative;
}

h1 {
  font-size: 2em;
  color: var(--system-text);
  text-shadow: 2px 2px var(--system-accent), 0 0 15px rgba(242, 242, 242, 0.6), 0 0 25px rgba(242, 242, 242, 0.4);
  transition: all 0.3s ease;
  animation: h1Blink 0.6s ease-in-out infinite;
}

h1:hover {
  animation: h1Blink 0.4s ease-in-out infinite;
}

@keyframes h1Blink {
  0% {
    text-shadow: 2px 2px var(--system-accent), 0 0 15px rgba(242, 242, 242, 0.6), 0 0 25px rgba(242, 242, 242, 0.4);
  }
  50% {
    text-shadow: 2px 2px var(--system-accent), 0 0 25px rgba(242, 242, 242, 1), 0 0 35px rgba(242, 242, 242, 0.8);
  }
  100% {
    text-shadow: 2px 2px var(--system-accent), 0 0 15px rgba(242, 242, 242, 0.6), 0 0 25px rgba(242, 242, 242, 0.4);
  }
}

.glitch {
  position: relative;
  text-shadow: 0 0 10px rgba(242, 242, 242, 0.8), 0 0 20px rgba(242, 242, 242, 0.6), 0 0 30px rgba(242, 242, 242, 0.4);
  transition: all 0.3s ease;
  animation: mainGlitchBlink 0.6s ease-in-out infinite;
}

.glitch:hover {
  animation: mainGlitchBlink 0.4s ease-in-out infinite;
}

@keyframes mainGlitchBlink {
  0% {
    text-shadow: 2px 2px var(--system-accent), 0 0 15px rgba(242, 242, 242, 0.6), 0 0 25px rgba(242, 242, 242, 0.4);
  }
  25% {
    text-shadow: -2px -2px var(--system-glitch), 0 0 20px rgba(242, 242, 242, 0.8), 0 0 30px rgba(242, 242, 242, 0.6);
  }
  50% {
    text-shadow: 2px -2px var(--system-accent), 0 0 25px rgba(242, 242, 242, 1), 0 0 35px rgba(242, 242, 242, 0.8);
  }
  75% {
    text-shadow: -2px 2px var(--system-glitch), 0 0 20px rgba(242, 242, 242, 0.8), 0 0 30px rgba(242, 242, 242, 0.6);
  }
  100% {
    text-shadow: 2px 2px var(--system-accent), 0 0 15px rgba(242, 242, 242, 0.6), 0 0 25px rgba(242, 242, 242, 0.4);
  }
}

.cyber-box {
  background: var(--system-bg);
  border: 1px solid var(--system-border);
  padding: 2rem;
  position: relative;
  box-shadow: 0 0 15px rgba(242, 242, 242, 0.2), inset 0 0 10px rgba(242, 242, 242, 0.05), 0 0 25px rgba(242, 242, 242, 0.1);
  transition: all 0.3s ease;
}

.cyber-box:hover {
  animation: cyberBoxBlink 0.8s ease-in-out infinite;
}

@keyframes cyberBoxBlink {
  0% {
    box-shadow: 0 0 15px rgba(242, 242, 242, 0.2), inset 0 0 10px rgba(242, 242, 242, 0.05), 0 0 25px rgba(242, 242, 242, 0.1);
  }
  50% {
    box-shadow: 0 0 25px rgba(242, 242, 242, 0.5), inset 0 0 15px rgba(242, 242, 242, 0.15), 0 0 35px rgba(242, 242, 242, 0.3);
  }
  100% {
    box-shadow: 0 0 15px rgba(242, 242, 242, 0.2), inset 0 0 10px rgba(242, 242, 242, 0.05), 0 0 25px rgba(242, 242, 242, 0.1);
  }
}

.cyber-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 0%, rgba(242, 242, 242, 0.05) 50%, transparent 100%);
  pointer-events: none;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.cyber-box:hover::before {
  animation: cyberBoxGradientBlink 0.8s ease-in-out infinite;
}

@keyframes cyberBoxGradientBlink {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}

.cyber-button {
  background: var(--system-bg);
  color: var(--system-text);
  border: 1px solid var(--system-border);
  padding: 0.5rem 1rem;
  font-family: "Courier New", monospace;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  text-decoration: none;
  display: inline-block;
  text-shadow: 0 0 8px rgba(242, 242, 242, 0.5), 0 0 15px rgba(242, 242, 242, 0.3);
  box-shadow: 0 0 10px rgba(242, 242, 242, 0.2), 0 0 20px rgba(242, 242, 242, 0.1);
  transition: all 0.3s ease;
}

.cyber-button:hover {
  background: var(--system-text);
  color: var(--system-bg);
  border-color: var(--system-accent);
  animation: cyberButtonBlink 0.5s ease-in-out infinite;
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

.cyber-button::before {
  content: '>';
  margin-right: 0.5rem;
}

/* Terminal-like text effect */
.terminal-text {
  font-family: "Courier New", monospace;
  white-space: pre;
  overflow: hidden;
  border-right: 2px solid var(--system-text);
  animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
  text-shadow: 0 0 8px rgba(242, 242, 242, 0.5), 0 0 15px rgba(242, 242, 242, 0.3);
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

@keyframes blink-caret {
  from, to { 
    border-color: transparent;
    box-shadow: 0 0 5px transparent;
  }
  50% { 
    border-color: var(--system-text);
    box-shadow: 0 0 10px rgba(242, 242, 242, 0.6), 0 0 20px rgba(242, 242, 242, 0.4);
  }
}
</style>
