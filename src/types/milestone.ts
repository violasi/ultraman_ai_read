export interface Milestone {
  id: string
  title: string
  description: string
  icon: string
  rewardCardId: string
  category: 'reading' | 'streak' | 'collection'
}

export interface MilestoneState {
  completed: boolean
  completedAt?: string
}
