import { createHashRouter } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import StoryReadPage from './pages/StoryReadPage'
import DiaryPage from './pages/DiaryPage'
import DiaryReadPage from './pages/DiaryReadPage'
import HeroHallPage from './pages/HeroHallPage'
import HeroDetailPage from './pages/HeroDetailPage'
import VocabBookPage from './pages/VocabBook'
import SettingsPage from './pages/SettingsPage'
import BookSelectPage from './pages/BookSelectPage'
import BookReadPage from './pages/BookReadPage'
import BookLibraryPage from './pages/BookLibraryPage'
import BookManagePage from './pages/BookManagePage'
import VocabReviewPage from './pages/VocabReviewPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'read/:id', element: <StoryReadPage /> },
      { path: 'books', element: <BookSelectPage /> },
      { path: 'books/library', element: <BookLibraryPage /> },
      { path: 'books/read/:bookId', element: <BookReadPage /> },
      { path: 'books/manage', element: <BookManagePage /> },
      { path: 'diary', element: <DiaryPage /> },
      { path: 'diary/:id', element: <DiaryReadPage /> },
      { path: 'heroes', element: <HeroHallPage /> },
      { path: 'heroes/:heroId', element: <HeroDetailPage /> },
      { path: 'vocab', element: <VocabBookPage /> },
      { path: 'vocab/review/:char', element: <VocabReviewPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
