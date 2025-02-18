<template>
  <div v-if="show" class="loading-overlay">
    <div class="whale-container">
      <img src="../assets/whale.svg" alt="Whale" class="whale">
      <div v-for="n in 10" :key="n" class="bubble" :style="getBubbleStyle(n)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

function getBubbleStyle(index) {
  const delay = Math.random() * 2
  const duration = 2.5 + Math.random() * 2
  const left = 35 + Math.random() * 30  // Concentrated more in the middle
  const size = 15 + Math.random() * 25   // Slightly larger bubbles

  return {
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
    '--left': `${left}%`,
    '--size': `${size}px`,
    '--opacity': 0.3 + Math.random() * 0.4
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.whale-container {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.whale {
  position: absolute;
  bottom: 40px;
  width: 200px;
  height: auto;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.bubble {
  position: absolute;
  bottom: 120px;
  left: var(--left);
  width: var(--size);
  height: var(--size);
  background: rgba(135, 206, 235, var(--opacity));
  border-radius: 50%;
  animation: rise var(--duration) ease-out infinite;
  animation-delay: var(--delay);
  backdrop-filter: blur(1px);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes rise {
  0% {
    transform: scale(0.2) translateY(0);
    opacity: var(--opacity);
  }
  50% {
    opacity: calc(var(--opacity) * 0.6);
  }
  100% {
    transform: scale(1) translateY(-60vh);
    opacity: 0;
  }
}
</style>
