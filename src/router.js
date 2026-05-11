import { createRouter, createWebHashHistory } from 'vue-router'
import ExamLayout from './views/ExamLayout.vue'
import DashboardView from './views/DashboardView.vue'
import ReadingSystemView from './views/ReadingSystemView.vue'
import ListeningSystemView from './views/ListeningSystemView.vue'
import ReadingPracticeView from './views/exam/PracticeView.vue'
import ListeningPracticeView from './views/exam/ListeningPracticeView.vue'
import WritingSystemView from './views/WritingSystemView.vue'
import WritingFeedbackView from './views/WritingFeedbackView.vue'
import SpeakingSystemView from './views/SpeakingSystemView.vue'
import SpeakingPracticeView from './views/exam/SpeakingPracticeView.vue'
import SpeakingFeedbackView from './views/SpeakingFeedbackView.vue'
import VocabularySystemView from './views/VocabularySystemView.vue'
import VocabularyLibraryView from './views/VocabularyLibraryView.vue'
import VocabularyWordView from './views/VocabularyWordView.vue'
import VocabularyReviewView from './views/VocabularyReviewView.vue'
import VocabularyCreateView from './views/VocabularyCreateView.vue'
import HistoryView from './views/HistoryView.vue'
import ToolsView from './views/ToolsView.vue'
import SettingsView from './views/SettingsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/exam/dashboard',
    },
    {
      path: '/exam/reading/:id',
      name: 'exam-reading-practice',
      component: ReadingPracticeView,
    },
    {
      path: '/exam/listening/:id',
      name: 'exam-listening-practice',
      component: ListeningPracticeView,
    },
    {
      path: '/exam',
      component: ExamLayout,
      redirect: '/exam/dashboard',
      children: [
        { path: 'dashboard', name: 'exam-dashboard', component: DashboardView },
        { path: 'reading', name: 'exam-reading', component: ReadingSystemView },
        { path: 'listening', name: 'exam-listening', component: ListeningSystemView },
        { path: 'vocabulary', name: 'exam-vocabulary', component: VocabularySystemView },
        { path: 'vocabulary/library', name: 'exam-vocabulary-library', component: VocabularyLibraryView },
        { path: 'vocabulary/review', name: 'exam-vocabulary-review', component: VocabularyReviewView },
        { path: 'vocabulary/word/:id', name: 'exam-vocabulary-word', component: VocabularyWordView },
        { path: 'vocabulary/create', name: 'exam-vocabulary-create', component: VocabularyCreateView },
        { path: 'writing', name: 'exam-writing', component: WritingSystemView },
        { path: 'writing/feedback', name: 'exam-writing-feedback', component: WritingFeedbackView },
        { path: 'speaking', name: 'exam-speaking', component: SpeakingSystemView },
        { path: 'speaking/practice', name: 'exam-speaking-practice', component: SpeakingPracticeView },
        { path: 'speaking/feedback', name: 'exam-speaking-feedback', component: SpeakingFeedbackView },
        { path: 'history', name: 'exam-history', component: HistoryView },
        { path: 'tools', name: 'exam-tools', component: ToolsView },
        { path: 'settings', name: 'exam-settings', component: SettingsView },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/exam/dashboard',
    },
  ],
})

export default router
