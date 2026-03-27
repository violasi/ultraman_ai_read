import { chineseLevel1Stories } from './level1'
import { chineseLevel2Stories } from './level2'
import { chineseLevel3Stories } from './level3'
import type { ChineseStory, Level } from '../../../types/story'

export const allChineseStories: ChineseStory[] = [
  ...chineseLevel1Stories,
  ...chineseLevel2Stories,
  ...chineseLevel3Stories,
]

export function getChineseStoriesByLevel(level: Level): ChineseStory[] {
  return allChineseStories.filter(s => s.level === level)
}

export function getChineseStoryById(id: string): ChineseStory | undefined {
  return allChineseStories.find(s => s.id === id)
}
