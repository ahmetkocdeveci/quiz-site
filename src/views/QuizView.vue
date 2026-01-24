<script setup>
import { ref, computed, watch } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

const store = useQuizStore();
const router = useRouter();
const { currentQuestion, currentQuestionIndex, questions, timer, isFinished } = storeToRefs(store);

// Cevap değişkeni (Array veya String olabilir)
const answer = ref('');

// Soru değişince cevap alanını sıfırla ve türe göre ayarla
watch(currentQuestion, (newQuestion) => {
  if (newQuestion.type === 'multiple-selection') {
    answer.value = []; // Çoklu seçimse boş liste
  } else {
    answer.value = ''; // Diğerleriyse boş yazı
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

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
});

const formattedTime = computed(() => {
  const m = Math.floor(timer.value / 60);
  const s = timer.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const handleNext = () => {
  const finalAnswer = Array.isArray(answer.value) ? [...answer.value] : answer.value;
  store.saveAnswer(finalAnswer);
  store.nextQuestion();
};
</script>

<template>
  <div class="quiz-page">

    <header class="quiz-header">
      <div class="timer-container" :class="{ 'timer-critical': timer < 60 }">
        <span class="timer-icon">⏱️</span>
        <span class="timer-text">{{ formattedTime }}</span>
      </div>
    </header>

    <main class="quiz-content">

      <div class="progress-section">
        <div class="progress-info">
          <span>Soru {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>

      <div class="question-card">
        <h2 class="question-title">{{ currentQuestion.text }}</h2>

        <div v-if="currentQuestion.type === 'multiple-choice'" class="options-list">
          <label
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="option-item"
            :class="{ 'option-selected': answer === option }"
          >
            <input
              type="radio"
              :name="'question-' + currentQuestion.id"
              :value="option"
              v-model="answer"
              class="option-radio"
            >
            <span class="option-text">{{ option }}</span>
          </label>
        </div>

        <div v-else-if="currentQuestion.type === 'multiple-selection'" class="options-list">
          <label
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="option-item"
            :class="{ 'option-selected': answer.includes(option) }"
          >
            <input
              type="checkbox"
              :value="option"
              v-model="answer"
              class="option-radio"
            >
            <span class="option-text">{{ option }}</span>
          </label>
          <p class="text-sm text-gray-500 mt-2 italic">* Birden fazla seçenek işaretleyebilirsiniz.</p>
        </div>

        <div v-else-if="currentQuestion.type === 'open-ended'" class="open-ended-area">
          <textarea
            v-model="answer"
            class="answer-textarea"
            placeholder="Cevabınızı buraya yazınız..."
          ></textarea>
          <div class="char-count" :class="answer.length < currentQuestion.minLength ? 'count-error' : 'count-success'">
            {{ answer.length }} / {{ currentQuestion.minLength }} karakter
          </div>
        </div>
      </div>

      <div class="quiz-actions">
        <button
          @click="handleNext"
          :disabled="!canProceed"
          class="btn-primary btn-next"
        >
          {{ currentQuestionIndex === questions.length - 1 ? 'Sınavı Bitir' : 'Sonraki Soru' }}
        </button>
      </div>

    </main>
  </div>
</template>
