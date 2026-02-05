<script setup>
import { computed } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { storeToRefs } from 'pinia';

const store = useQuizStore();
const { timer } = storeToRefs(store);

const formattedTime = computed(() => {
  if (timer.value === null) return '∞';

  const m = Math.floor(timer.value / 60);
  const s = timer.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});
</script>

<template>
  <header class="header">
    <div v-if="timer !== null" class="timer" :class="{ 'timer--critical': timer < 10 }">
      <span class="timer__icon">⏱️</span>
      <span class="timer__text">{{ formattedTime }}</span>
    </div>

    <div v-else class="timer" style="border-color: #2ecc71; color: #2ecc71;">
      <span class="timer__icon">♾️</span>
      <span class="timer__text">Süresiz</span>
    </div>
  </header>
</template>
