<script setup>
import { computed } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { storeToRefs } from 'pinia';

const store = useQuizStore();
const { timer } = storeToRefs(store);

const formattedTime = computed(() => {
  const m = Math.floor(timer.value / 60);
  const s = timer.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});
</script>

<template>
  <header class="header">
    <div class="timer" :class="{ 'timer--critical': timer < 60 }">
      <span class="timer__icon">⏱️</span>
      <span class="timer__text">{{ formattedTime }}</span>
    </div>
  </header>
</template>
