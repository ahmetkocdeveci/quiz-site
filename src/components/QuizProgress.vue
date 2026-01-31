<script setup>
import { computed } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { storeToRefs } from 'pinia';

const store = useQuizStore();
const { currentQuestionIndex, questions } = storeToRefs(store);

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
});
</script>

<template>
  <div class="progress">
    <div class="progress__info">
      <span>Soru {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
    </div>
    <div class="progress__track">
      <div class="progress__fill" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
  </div>
</template>
