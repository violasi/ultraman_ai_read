export interface StoryProgress {
  storyId: string
  completed: boolean
  currentSentence: number
  quizScore: number  // 0-3 stars
  quizPassed: boolean
}

export interface UserProgress {
  stories: Record<string, StoryProgress>
  totalStars: number
  lastActiveDate: string
}
