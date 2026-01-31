import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

export const useQuizStore = defineStore('quiz', () => {
  const examStarted = ref(false)
  const isFinished = ref(false)
  const timer = ref(300)
  const timerInterval = ref(null)
  const currentQuestionIndex = ref(0)
  const isInvalid = ref(false)
  const invalidReason = ref('')
  const isLoading = ref(false)
  const error = ref(null)
  const questions = ref([])

  const user = reactive({
    name: '',
    surname: '',
    tckn: ''
  })

  const userAnswers = reactive({})

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

  const isLastQuestion = computed(() =>
    questions.value.length > 0 && currentQuestionIndex.value === questions.value.length - 1
  )

  const calculateScore = computed(() => {
    let total = 0
    questions.value.forEach((q) => {
      const userAns = userAnswers[q.id]
      if (!userAns) return

      if (q.type === 'multiple-choice' && userAns === q.correctAnswer) {
        total += q.points
      }
      else if (q.type === 'multiple-selection') {
        if (Array.isArray(userAns) &&
            userAns.length === q.correctAnswer.length &&
            userAns.every(val => q.correctAnswer.includes(val))) {
          total += q.points
        }
      }
      else if (q.type === 'open-ended') {
        if (userAns.length >= q.minLength) {
          total += q.points
        }
      }
    })
    return total
  })

  async function fetchQuestions() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:3000/questions')
      if (!response.ok) throw new Error('Sunucu hatası!')

      const data = await response.json()
      questions.value = data
    } catch (err) {
      error.value = err.message
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function startExam(userData) {
    Object.assign(user, userData)

    await fetchQuestions()

    if (error.value) {
      alert('Sınav başlatılamadı: ' + error.value)
      return
    }

    examStarted.value = true
    isInvalid.value = false
    invalidReason.value = ''

    localStorage.setItem('exam_ongoing', 'true')
    localStorage.setItem('exam_backup', JSON.stringify(userData))

    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeunload', handleBeforeUnload)

    startTimer()
  }

  function finishExam(success) {
    clearInterval(timerInterval.value)
    examStarted.value = false
    isFinished.value = true

    window.removeEventListener('offline', handleOffline)
    window.removeEventListener('beforeunload', handleBeforeUnload)

    localStorage.removeItem('exam_ongoing')
    localStorage.removeItem('exam_backup')

    if (success && !isInvalid.value) {
      saveResultToHistory()

      const sessionData = {
        user: user,
        userAnswers: userAnswers
      }
      localStorage.setItem('last_exam_result', JSON.stringify(sessionData))
    }
  }

  async function restoreSession() {
    if (questions.value.length > 0 && isFinished.value) return true

    const savedData = localStorage.getItem('last_exam_result')
    if (!savedData) return false

    if (questions.value.length === 0) {
      await fetchQuestions()
    }

    const parsed = JSON.parse(savedData)
    Object.assign(user, parsed.user)
    Object.assign(userAnswers, parsed.userAnswers)

    isFinished.value = true
    return true
  }

  function handleOffline() {
    invalidateExam('İnternet bağlantısı kesildiği için sınav geçersiz sayıldı.')
  }

  function handleBeforeUnload(e) {
    e.preventDefault()
    e.returnValue = ''
  }

  function startTimer() {
    timerInterval.value = setInterval(() => {
      if (timer.value > 0) {
        timer.value--
      } else {
        finishExam(false)
      }
    }, 1000)
  }

  function saveAnswer(answer) {
    if (!currentQuestion.value) return
    const questionId = currentQuestion.value.id
    userAnswers[questionId] = answer
  }

  function nextQuestion() {
    if (!isLastQuestion.value) {
      currentQuestionIndex.value++
    } else {
      finishExam(true)
    }
  }

  function invalidateExam(reason) {
    isInvalid.value = true
    invalidReason.value = reason
    finishExam(false)
  }

  function checkRefreshViolation() {
    if (localStorage.getItem('exam_ongoing') === 'true') {
      const backupUser = JSON.parse(localStorage.getItem('exam_backup') || '{}')
      Object.assign(user, backupUser)

      const failedResult = {
        user: `${backupUser.name || 'Bilinmeyen'} ${backupUser.surname || 'Aday'}`,
        tckn: backupUser.tckn || '00000000000',
        score: 0,
        date: new Date().toLocaleString(),
        status: 'İptal (Sayfa Yenileme)'
      }

      const history = JSON.parse(localStorage.getItem('quizHistory') || '[]')
      history.push(failedResult)
      localStorage.setItem('quizHistory', JSON.stringify(history))

      localStorage.removeItem('exam_ongoing')
      localStorage.removeItem('exam_backup')

      isInvalid.value = true
      invalidReason.value = 'Sınav esnasında sayfa yenilendiği için sınav geçersiz sayıldı ve puanınız 0 olarak işlendi.'
      return true
    }
    return false
  }

  function saveResultToHistory() {
    const result = {
      user: `${user.name} ${user.surname}`,
      tckn: user.tckn,
      score: calculateScore.value,
      date: new Date().toLocaleString()
    }
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]')
    history.push(result)
    history.sort((a, b) => b.score - a.score)
    localStorage.setItem('quizHistory', JSON.stringify(history))
  }

  function $reset() {
    localStorage.removeItem('last_exam_result')
    examStarted.value = false
    isFinished.value = false
    timer.value = 300
    currentQuestionIndex.value = 0
    isInvalid.value = false
    invalidReason.value = ''
    questions.value = []
    error.value = null
    isLoading.value = false

    Object.keys(userAnswers).forEach(key => delete userAnswers[key])
    user.name = ''
    user.surname = ''
    user.tckn = ''
  }

  return {
    user,
    examStarted,
    isFinished,
    timer,
    timerInterval,
    currentQuestionIndex,
    userAnswers,
    isInvalid,
    invalidReason,
    questions,
    currentQuestion,
    isLastQuestion,
    calculateScore,
    isLoading,
    error,
    startExam,
    handleOffline,
    handleBeforeUnload,
    startTimer,
    saveAnswer,
    nextQuestion,
    finishExam,
    invalidateExam,
    checkRefreshViolation,
    saveResultToHistory,
    restoreSession,
    $reset
  }
})
