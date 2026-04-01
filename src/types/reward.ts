export interface RewardCard {
  heroId: string
  level: number         // 第几张卡 (1=3天, 2=6天, 3=9天...)
  imageUrl: string      // /images/rewards/{heroId}_gift_{level}.png
  earnedAt: string      // ISO timestamp
}
