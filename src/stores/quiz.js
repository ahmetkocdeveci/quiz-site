import { defineStore } from 'pinia'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    user: {
      name: '',
      surname: '',
      tckn: ''
    },
    examStarted: false,
    isFinished: false,
    timer: 300,
    timerInterval: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    isInvalid: false,
    invalidReason: '',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        text: 'Recep İvedik İstanbul\'un hangi semtinde oturmaktadır?',
        options: ['Bağcılar', 'Güngören', 'Esenler', 'Zeytinburnu'],
        correctAnswer: 'Güngören',
        points: 10
      },
      {
        id: 2,
        type: 'multiple-choice',
        text: 'Recep İvedik\'in kullandığı o meşhur arabanın modeli nedir?',
        options: ['Murat 131', 'Renault Toros', 'Fiat Bis', 'Tofaş Şahin'],
        correctAnswer: 'Fiat Bis',
        points: 10
      },
      {
        id: 3,
        type: 'multiple-choice',
        text: 'Recep İvedik\'in en sevdiği yemek hangisidir?',
        options: ['Mantı', 'Kuru Fasulye', 'Lahmacun', 'İskender'],
        correctAnswer: 'Kuru Fasulye',
        points: 10
      },
      {
        id: 4,
        type: 'multiple-choice',
        text: 'Recep İvedik 1 filminde Recep, Sibel\'i bulmak için hangi şehre gitmiştir?',
        options: ['Antalya', 'İzmir', 'Muğla', 'Bodrum'],
        correctAnswer: 'Antalya',
        points: 10
      },
      {
        id: 5,
        type: 'multiple-choice',
        text: 'Recep İvedik\'in çocukluk arkadaşının adı nedir?',
        options: ['Salih', 'Mahmut', 'Ali Kerem', 'Nurullah'],
        correctAnswer: 'Nurullah',
        points: 10
      },
      {
        id: 6,
        type: 'multiple-selection',
        text: 'Recep İvedik\'in belirgin fiziksel ve kişisel özellikleri nelerdir? (Birden fazla seçiniz)',
        options: ['Agresif', 'Sakin', 'Kıllı', 'Romantik', 'Kompleksli', 'Kedi gibi'],
        correctAnswer: ['Agresif', 'Kıllı', 'Kompleksli', 'Kedi gibi'],
        points: 10
      },
      {
        id: 7,
        type: 'multiple-selection',
        text: 'Recep İvedik filmlerinde aşağıdaki aktivitelerden hangilerini yapmıştır? (Birden fazla seçiniz)',
        options: ['Yoga', 'Bale', 'Paintball', 'Golf'],
        correctAnswer: ['Yoga', 'Paintball'],
        points: 10
      },
      {
        id: 8,
        type: 'multiple-selection',
        text: 'Aşağıdakilerden hangileri Recep İvedik filmlerinde yer almış karakterlerdir? (Birden fazla seçiniz)',
        options: ['Sibel', 'Behzat Ç.', 'Ali Kerem', 'Polat Alemdar'],
        correctAnswer: ['Sibel', 'Ali Kerem'],
        points: 10
      },
      {
        id: 9,
        type: 'open-ended',
        text: 'Recep İvedik\'in sürekli giydiği gömleğin rengi nedir?',
        minLength: 5,
        points: 10
      },
      {
        id: 10,
        type: 'open-ended',
        text: 'Recep İvedik\'in meşhur gülüşünü yazıyla ifade ediniz.',
        minLength: 3,
        points: 10
      }
    ]
  }),
  getters: {
    currentQuestion: (state) => state.questions[state.currentQuestionIndex],
    isLastQuestion: (state) =>
      state.currentQuestionIndex === state.questions.length - 1,
    calculateScore: (state) => {
      let total = 0
      state.questions.forEach((q) => {
        const userAns = state.userAnswers[q.id]
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
    }
  },
  actions: {
    startExam(userData) {
      this.user = userData
      this.examStarted = true
      this.isInvalid = false
      this.invalidReason = ''

      localStorage.setItem('exam_ongoing', 'true')
      localStorage.setItem('exam_backup', JSON.stringify(userData))

      window.addEventListener('offline', this.handleOffline)
      window.addEventListener('beforeunload', this.handleBeforeUnload)

      this.startTimer()
    },
    handleOffline() {
      this.invalidateExam('İnternet bağlantısı kesildiği için sınav geçersiz sayıldı.')
    },
    handleBeforeUnload(e) {
      e.preventDefault()
      e.returnValue = ''
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--
        } else {
          this.finishExam(false)
        }
      }, 1000)
    },
    saveAnswer(answer) {
      const questionId = this.currentQuestion.id
      this.userAnswers[questionId] = answer
    },
    nextQuestion() {
      if (!this.isLastQuestion) {
        this.currentQuestionIndex++
      } else {
        this.finishExam(true)
      }
    },
    finishExam(success) {
      clearInterval(this.timerInterval)
      this.examStarted = false
      this.isFinished = true

      window.removeEventListener('offline', this.handleOffline)
      window.removeEventListener('beforeunload', this.handleBeforeUnload)

      localStorage.removeItem('exam_ongoing')
      localStorage.removeItem('exam_backup')

      if (success && !this.isInvalid) {
        this.saveResultToHistory()
      }
    },
    invalidateExam(reason) {
      this.isInvalid = true
      this.invalidReason = reason
      this.finishExam(false)
    },
    checkRefreshViolation() {
      if (localStorage.getItem('exam_ongoing') === 'true') {
        const backupUser = JSON.parse(localStorage.getItem('exam_backup') || '{}')
        if(backupUser.tckn) this.user = backupUser;

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

        this.isInvalid = true
        this.invalidReason = 'Sınav esnasında sayfa yenilendiği için sınav geçersiz sayıldı ve puanınız 0 olarak işlendi.'
        return true
      }
      return false
    },
    saveResultToHistory() {
      const result = {
        user: `${this.user.name} ${this.user.surname}`,
        tckn: this.user.tckn,
        score: this.calculateScore,
        date: new Date().toLocaleString()
      }
      const history = JSON.parse(localStorage.getItem('quizHistory') || '[]')
      history.push(result)
      history.sort((a, b) => b.score - a.score)
      localStorage.setItem('quizHistory', JSON.stringify(history))
    }
  }
})
