import { requestUrl } from 'obsidian'
import { getLocalTodayDate } from './getLocalTodayDate'

export const getLeaderBoardUser = (
  userId: string,
): Promise<{
  user: { ranking: number; userId: string; vaults: { name: string; ranking: number }[] } | undefined
  totalCount: number
}> => {
  return new Promise((resolve, reject) => {
    requestUrl({
      method: 'GET',
      url: `https://www.yourpulse.cc/app/api/leaderboard?date=${getLocalTodayDate()}`,
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((result) => {
        if (result?.status === 200) {
          const response = JSON.parse(JSON.stringify(result))?.json
          resolve({
            user: response?.rankings.find((user: any) => user.userId === userId),
            totalCount: response?.rankings?.length || 0,
          })
        } else {
          reject(new Error('Invalid status'))
        }
      })
      .catch(reject)
  })
}
