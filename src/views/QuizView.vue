<script setup>
import { ref, computed, watch } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import QuizHeader from '../components/QuizHeader.vue';
import QuizProgress from '../components/QuizProgress.vue';
import QuestionCard from '../components/QuestionCard.vue';

const store = useQuizStore();
const router = useRouter();
const { currentQuestion, currentQuestionIndex, questions, isFinished } = storeToRefs(store);

const answer = ref('');

watch(currentQuestion, (newQuestion) => {
  if (newQuestion.type === 'multiple-selection') {
    answer.value = [];
  } else {
    answer.value = '';
  }
});

watch(isFinished, (newVal) => {
  if (newVal) {
    router.push('/result');
  }
});

const canProceed = computed(() => {
  if (currentQuestion.value.type === 'multiple-choice') {
    return answer.value !== '';
  }
  if (currentQuestion.value.type === 'multiple-selection') {
    return answer.value.length > 0;
  }
  if (currentQuestion.value.type === 'open-ended') {
    return answer.value.length >= currentQuestion.value.minLength;
  }
  return false;
});

const handleNext = () => {
  const finalAnswer = Array.isArray(answer.value) ? [...answer.value] : answer.value;
  store.saveAnswer(finalAnswer);
  store.nextQuestion();
};
</script>

<template>
  <div class="quiz-page">
    <QuizHeader />

    <main class="quiz-content">
      <QuizProgress />

      <QuestionCard
        :question="currentQuestion"
        v-model="answer"
      />

      <div class="quiz-actions">
        <button
          @click="handleNext"
          :disabled="!canProceed"
          class="btn btn--primary btn--next"
        >
          {{ currentQuestionIndex === questions.length - 1 ? 'Sınavı Bitir' : 'Sonraki Soru' }}
        </button>
      </div>
    </main>
  </div>
</template>
