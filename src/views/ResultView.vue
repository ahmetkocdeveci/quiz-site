<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

const store = useQuizStore();
const router = useRouter();
const { questions, userAnswers, isInvalid, invalidReason, user } = storeToRefs(store);

const leaderboard = ref([]);
const score = computed(() => store.calculateScore);

onMounted(() => {
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

// --- CEVAP KONTROL MANTIĞI ---
const formatAnswer = (ans) => {
  if (Array.isArray(ans)) return ans.join(', ');
  return ans || 'Boş Bırakıldı';
};

const getQuestionStatus = (question) => {
  const userAns = userAnswers.value[question.id];

  // 1. Durum: Cevap Yoksa
  if (!userAns || (Array.isArray(userAns) && userAns.length === 0)) {
    return { class: 'status-empty', text: 'Boş Bırakıldı', isCorrect: false };
  }

  // 2. Durum: Açık Uçlu Sorular (YENİ DÜZENLEME)
  // Bunlar için "Doğru/Yanlış" demiyoruz, nötr döndürüyoruz.
  if (question.type === 'open-ended') {
    return { class: 'status-neutral', text: '', isCorrect: null };
  }

  // 3. Durum: Çoktan Seçmeli
  if (question.type === 'multiple-choice') {
    if (userAns === question.correctAnswer) return { class: 'status-correct', text: 'Doğru', isCorrect: true };
    return { class: 'status-wrong', text: 'Yanlış', isCorrect: false };
  }

  // 4. Durum: Çoklu Seçim (Checkbox) (DÜZELTİLDİ: Boşluk Sorunu)
  if (question.type === 'multiple-selection') {
    const isCorrect = Array.isArray(userAns) &&
                      userAns.length === question.correctAnswer.length &&
                      userAns.every(val => question.correctAnswer.includes(val));

    if (isCorrect) return { class: 'status-correct', text: 'Tam Doğru', isCorrect: true };
    // Buradaki metni daha okunabilir yaptık:
    return { class: 'status-wrong', text: 'Eksik / Yanlış', isCorrect: false };
  }
};
</script>

<template>
  <div class="result-page">

    <div class="result-card" :class="isInvalid ? 'status-fail' : 'status-success'">
      <div class="result-icon">
        <span v-if="isInvalid">❌</span>
        <span v-else>🏆</span>
      </div>

      <h1 class="result-title">{{ resultMessage }}</h1>
      <p v-if="isInvalid" class="result-reason">{{ invalidReason }}</p>

      <div v-else class="score-display">
        <p class="user-greeting">Sayın <strong>{{ user.name }} {{ user.surname }}</strong>,</p>
        <div class="score-value">{{ score }} Puan</div>
      </div>

      <div class="result-actions">
        <button @click="handleRestart" class="btn-secondary btn-restart">
          Giriş Ekranına Dön
        </button>
      </div>
    </div>

    <div v-if="!isInvalid && store.isFinished" class="review-container">
      <h3 class="review-title">Cevap Anahtarı</h3>

      <div v-for="q in questions" :key="q.id" class="review-card" :class="getQuestionStatus(q).class">
        <div class="review-header">
          <span class="review-q-num">Soru {{ q.id }}</span>

          <span v-if="q.type !== 'open-ended'" class="review-badge">
            {{ getQuestionStatus(q).text }}
          </span>
          <span v-else class="review-badge-neutral">Yanıtlandı</span>
        </div>

        <p class="review-question-text">{{ q.text }}</p>

        <div class="review-details">
          <div class="user-answer-box">
            <strong>Sizin Cevabınız:</strong>
            <span>{{ formatAnswer(userAnswers[q.id]) }}</span>
          </div>

          <div v-if="!getQuestionStatus(q).isCorrect && q.type !== 'open-ended'" class="correct-answer-box">
            <strong>Doğru Cevap:</strong>
            <span>{{ formatAnswer(q.correctAnswer) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="leaderboard-container">
      <h3 class="leaderboard-title">Başarı Sıralaması</h3>
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Sıra</th>
            <th>Aday</th>
            <th>Puan</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in leaderboard" :key="index" :class="{ 'current-user-row': record.tckn === user.tckn }">
            <td>{{ index + 1 }}</td>
            <td>{{ record.user }}</td>
            <td>{{ record.score }}</td>
            <td>{{ record.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
