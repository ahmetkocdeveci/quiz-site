<script setup>
defineProps({
  question: {
    type: Object,
    required: true
  }
});

const answer = defineModel();
</script>

<template>
  <div class="question-card">
    <h2 class="question-card__title">{{ question.text }}</h2>

    <div v-if="question.type === 'multiple-choice'" class="question-card__options">
      <label
        v-for="(option, index) in question.options"
        :key="index"
        class="question-card__option"
        :class="{ 'question-card__option--selected': answer === option }"
      >
        <input
          type="radio"
          :name="'question-' + question.id"
          :value="option"
          v-model="answer"
          class="question-card__radio"
        >
        <span>{{ option }}</span>
      </label>
    </div>

    <div v-else-if="question.type === 'multiple-selection'" class="question-card__options">
      <label
        v-for="(option, index) in question.options"
        :key="index"
        class="question-card__option"
        :class="{ 'question-card__option--selected': Array.isArray(answer) && answer.includes(option) }"
      >
        <input
          type="checkbox"
          :value="option"
          v-model="answer"
          class="question-card__radio"
        >
        <span>{{ option }}</span>
      </label>
      <p class="text-sm text-gray-500 mt-2 italic">* Birden fazla seçenek işaretleyebilirsiniz.</p>
    </div>

    <div v-else-if="question.type === 'open-ended'">
      <textarea
        v-model="answer"
        class="question-card__textarea"
        placeholder="Cevabınızı buraya yazınız..."
      ></textarea>
      <div class="question-card__char-count"
           :class="answer.length < question.minLength ? 'question-card__char-count--error' : 'question-card__char-count--success'">
        {{ answer.length }} / {{ question.minLength }} karakter
      </div>
    </div>
  </div>
</template>
