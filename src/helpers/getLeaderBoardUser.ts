import { requestUrl } from 'obsidian'
import { getLocalTodayDate } from './getLocalTodayDate'

export const getLeaderBoardUser = (
  userId: string,
  plugin?: any, // Optional plugin instance for private mode checking
): Promise<{
  user: { ranking: number; userId: string; vaults: { name: string; ranking: number }[] } | undefined
  totalCount: number
}> => {
  return new Promise((resolve, reject) => {
    // Check if private mode is active
    if (plugin?.settings?.privateMode === true) {
      console.log('[YourPulse] Leaderboard API request blocked in private mode')
      resolve({
        user: undefined,
        totalCount: 0,
      })
      return
    }

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
