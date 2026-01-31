<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import ReviewCard from '../components/ReviewCard.vue';

const store = useQuizStore();
const router = useRouter();
const { questions, userAnswers, isInvalid, invalidReason, user } = storeToRefs(store);

const leaderboard = ref([]);
const score = computed(() => store.calculateScore);
const isRestoring = ref(true);

onMounted(async () => {
  const success = await store.restoreSession();
  if (!success && !store.isFinished && !store.isInvalid) {
    router.push('/');
    return;
  }

  isRestoring.value = false;
  const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
  leaderboard.value = history;
});

const handleRestart = () => {
  store.$reset();
  router.push('/');
};

const resultMessage = computed(() => {
  if (isInvalid.value) return 'Sınav Geçersiz Sayıldı!';
  if (store.isFinished && !store.isInvalid) return 'Sınav Tamamlandı!';
  return 'Sınav Sonlandırıldı';
});
</script>

<template>
  <div class="result-page">

    <div v-if="isRestoring" class="loading-state" style="text-align:center; padding: 2rem;">
      <h2>Sonuçlar Yükleniyor...</h2>
    </div>

    <div v-else>

      <div class="result-card" :class="isInvalid ? 'result-card--fail' : 'result-card--success'">
        <div class="result-card__icon">
          <span v-if="isInvalid">❌</span>
          <span v-else>🏆</span>
        </div>

        <h1 class="result-card__title">{{ resultMessage }}</h1>
        <p v-if="isInvalid" class="result-card__reason">{{ invalidReason }}</p>

        <div v-else class="result-card__score-box">
          <p class="user-greeting">Sayın <strong>{{ user.name }} {{ user.surname }}</strong>,</p>
          <div class="result-card__score-val">{{ score }} Puan</div>
        </div>

        <div class="result-actions">
          <button @click="handleRestart" class="btn btn--secondary">
            Giriş Ekranına Dön
          </button>
        </div>
      </div>

      <div v-if="!isInvalid && store.isFinished" class="review">
        <h3 class="review__title">Cevap Anahtarı</h3>

        <ReviewCard
          v-for="q in questions"
          :key="q.id"
          :question="q"
          :user-answer="userAnswers[q.id]"
        />
      </div>

      <div class="leaderboard">
        <h3 class="leaderboard__title">Başarı Sıralaması</h3>
        <table class="leaderboard__table">
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Aday</th>
              <th>Puan</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in leaderboard" :key="index" :class="{ 'leaderboard__row--current': record.tckn === user.tckn }">
              <td>{{ index + 1 }}</td>
              <td>{{ record.user }}</td>
              <td>{{ record.score }}</td>
              <td>{{ record.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>
