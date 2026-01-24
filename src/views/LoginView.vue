<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'

const router = useRouter()
const store = useQuizStore()

// --- TEMA (DARK MODE) AYARLARI ---
const isDarkMode = ref(false)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value

  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// --- FORM VE GİRİŞ AYARLARI ---
const formData = reactive({ name: '', surname: '', tckn: '' })

onMounted(() => {
  if (store.checkRefreshViolation()) {
    alert(`HATA: ERR_REFRESH_VIOLATION\n\n${store.invalidReason}`)
  }
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
    isDarkMode.value = true
  }
})

const handleLogin = () => {
  if (!formData.name || !formData.surname || !formData.tckn) {
    alert("HATA: ERR_EMPTY_FIELDS\n\nLütfen tüm alanları doldurunuz.")
    return
  }
  const tcknRegex = /^\d{11}$/
  if (!tcknRegex.test(formData.tckn)) {
    alert("HATA: ERR_TCKN_INVALID\n\nTC Kimlik Numarası 11 haneli rakamlardan oluşmalıdır.")
    return
  }
  const history = JSON.parse(localStorage.getItem('quizHistory') || '[]')
  const existingUser = history.find((record) => record.tckn === formData.tckn)

  if (existingUser) {
    alert("HATA: ERR_DUPLICATE_ENTRY\n\nBu TC Kimlik Numarası ile daha önce sınava katılım sağlanmıştır.")
    return
  }
  store.startExam({ ...formData })
  router.push('/quiz')
}
</script>

<template>
  <div class="login-page">
    <button @click="toggleTheme" class="theme-toggle-btn">
      <span v-if="isDarkMode">☀️ Aydınlık Mod</span>
      <span v-else>🌙 Karanlık Mod</span>
    </button>

    <div class="login-card">
      <div class="login-header">
        <h1 class="page-title">Bilgi Yarışması</h1>
        <p class="page-subtitle">Giriş yapmak için bilgilerinizi giriniz.</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Adınız</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="Adınızı giriniz"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Soyadınız</label>
          <input
            v-model="formData.surname"
            type="text"
            class="form-input"
            placeholder="Soyadınızı giriniz"
          />
        </div>

        <div class="form-group">
          <label class="form-label">TC Kimlik No</label>
          <input
            v-model="formData.tckn"
            type="text"
            maxlength="11"
            class="form-input"
            placeholder="11 haneli numara"
          />
        </div>

        <button type="submit" class="btn-primary btn-start">Sınavı Başlat</button>
      </form>
    </div>
  </div>
</template>
