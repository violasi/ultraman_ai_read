import { createHashRouter, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
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
      { index: true, element: <Navigate to="/books" replace /> },
      { path: 'books', element: <BookSelectPage /> },
      { path: 'books/library', element: <BookLibraryPage /> },
      { path: 'books/read/:bookId', element: <BookReadPage /> },
      { path: 'books/manage', element: <BookManagePage /> },
      { path: 'heroes', element: <HeroHallPage /> },
      { path: 'heroes/:heroId', element: <HeroDetailPage /> },
      { path: 'vocab', element: <VocabBookPage /> },
      { path: 'vocab/review/:char', element: <VocabReviewPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
