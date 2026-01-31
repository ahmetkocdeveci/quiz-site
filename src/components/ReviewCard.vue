<script setup>
import { computed } from 'vue';
const props = defineProps({
  question: Object,
  userAnswer: [String, Array, undefined]
});
const formattedUserAnswer = computed(() => {
  if (Array.isArray(props.userAnswer)) return props.userAnswer.join(', ');
  return props.userAnswer || 'Boş Bırakıldı';
});

const formattedCorrectAnswer = computed(() => {
  if (Array.isArray(props.question.correctAnswer)) return props.question.correctAnswer.join(', ');
  return props.question.correctAnswer;
});
const status = computed(() => {
  const ans = props.userAnswer;
  if (!ans || (Array.isArray(ans) && ans.length === 0)) {
    return { class: 'review-card--empty', text: 'Boş Bırakıldı', isCorrect: false };
  }
  if (props.question.type === 'open-ended') {
    return { class: 'review-card--neutral', text: 'Yanıtlandı', isCorrect: null };
  }
  if (props.question.type === 'multiple-choice') {
    if (ans === props.question.correctAnswer)
      return { class: 'review-card--correct', text: 'Doğru', isCorrect: true };
    return { class: 'review-card--wrong', text: 'Yanlış', isCorrect: false };
  }
  if (props.question.type === 'multiple-selection') {
    const isCorrect = Array.isArray(ans) &&
                      ans.length === props.question.correctAnswer.length &&
                      ans.every(val => props.question.correctAnswer.includes(val));

    if (isCorrect) return { class: 'review-card--correct', text: 'Tam Doğru', isCorrect: true };
    return { class: 'review-card--wrong', text: 'Eksik / Yanlış', isCorrect: false };
  }

  return { class: '', text: '', isCorrect: false };
});
</script>

<template>
  <div class="review-card" :class="status.class">
    <div class="review-card__header">
      <span class="review-q-num">Soru {{ question.id }}</span>

      <span class="review-card__badge"
            :style="question.type === 'open-ended' ? 'background:#95a5a6' : ''">
        {{ status.text }}
      </span>
    </div>

    <p class="review-card__text">{{ question.text }}</p>

    <div class="review-card__details">
      <div class="user-answer-box">
        <strong>Sizin Cevabınız:</strong>
        <span>{{ formattedUserAnswer }}</span>
      </div>

      <div v-if="!status.isCorrect && question.type !== 'open-ended'" class="correct-answer-box">
        <strong>Doğru Cevap:</strong>
        <span style="color:#27ae60">{{ formattedCorrectAnswer }}</span>
      </div>
    </div>
  </div>
</template>
