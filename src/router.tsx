import { createHashRouter } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import KnownCharsPage from './pages/KnownCharsPage'
import ChineseHome from './pages/chinese/ChineseHome'
import ChineseStory from './pages/chinese/ChineseStory'
import ChineseQuiz from './pages/chinese/ChineseQuiz'
import PinyinHome from './pages/pinyin/PinyinHome'
import PinyinStory from './pages/pinyin/PinyinStory'
import PinyinQuiz from './pages/pinyin/PinyinQuiz'
import EnglishHome from './pages/english/EnglishHome'
import EnglishStory from './pages/english/EnglishStory'
import EnglishQuiz from './pages/english/EnglishQuiz'
import VocabBook from './pages/VocabBook'
import RewardsPage from './pages/RewardsPage'
import StoryWorkshop from './pages/StoryWorkshop'
import SaveLoadPage from './pages/SaveLoadPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'chinese', element: <ChineseHome /> },
      { path: 'chinese/story/:id', element: <ChineseStory /> },
      { path: 'chinese/quiz/:id', element: <ChineseQuiz /> },
      { path: 'pinyin', element: <PinyinHome /> },
      { path: 'pinyin/story/:id', element: <PinyinStory /> },
      { path: 'pinyin/quiz/:id', element: <PinyinQuiz /> },
      { path: 'english', element: <EnglishHome /> },
      { path: 'english/story/:id', element: <EnglishStory /> },
      { path: 'english/quiz/:id', element: <EnglishQuiz /> },
      { path: 'vocab', element: <VocabBook /> },
      { path: 'rewards', element: <RewardsPage /> },
      { path: 'known-chars', element: <KnownCharsPage /> },
      { path: 'workshop', element: <StoryWorkshop /> },
      { path: 'save', element: <SaveLoadPage /> },
    ],
  },
])
