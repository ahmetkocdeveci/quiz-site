<script setup>
import { reactive, onMounted, ref } from 'vue';
import { useQuizStore } from '../stores/quiz';
import { useRouter } from 'vue-router';

const store = useQuizStore();
const router = useRouter();

const formData = reactive({
  name: '',
  surname: '',
  tckn: ''
});

const isDark = ref(false);

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};
const handleLogin = async () => {
  if (!formData.name || !formData.surname || !formData.tckn) {
    alert('Lütfen tüm alanları doldurunuz.');
    return;
  }

  if (!/^\d{11}$/.test(formData.tckn)) {
    alert('TCKN 11 haneli olmalı ve sadece rakamlardan oluşmalıdır.');
    return;
  }

  const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
  const existingUser = history.find(record => record.tckn === formData.tckn);

  if (existingUser) {
    alert('Bu TCKN ile daha önce sınava girilmiş!');
    return;
  }
  await store.startExam({ ...formData });
  if (!store.error) {
    router.push('/quiz');
  }
};
</script>

<template>
  <div class="login-page">
    <button @click="toggleTheme" class="theme-btn">
      {{ isDark ? '☀️ Light Mode' : '🌙 Dark Mode' }}
    </button>

    <div class="login-card">
      <h1 class="login-card__title">Online Sınav Sistemi</h1>
      <p class="login-card__subtitle">Lütfen giriş bilgilerinizi eksiksiz doldurunuz.</p>

      <form @submit.prevent="handleLogin">
        <div class="login-card__group">
          <label class="login-card__label">Adınız</label>
          <input
            v-model="formData.name"
            type="text"
            class="login-card__input"
            placeholder="Örn: Ahmet"
            required
          >
        </div>

        <div class="login-card__group">
          <label class="login-card__label">Soyadınız</label>
          <input
            v-model="formData.surname"
            type="text"
            class="login-card__input"
            placeholder="Örn: Yılmaz"
            required
          >
        </div>

        <div class="login-card__group">
          <label class="login-card__label">TC Kimlik No</label>
          <input
            v-model="formData.tckn"
            type="text"
            class="login-card__input"
            placeholder="11 haneli TCKN"
            maxlength="11"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')"
            required
          >
        </div>

        <button type="submit" class="btn btn--primary">Sınavı Başlat</button>
      </form>
    </div>
  </div>
</template>
