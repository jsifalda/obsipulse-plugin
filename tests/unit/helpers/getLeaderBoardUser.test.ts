import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLeaderBoardUser } from '@/src/helpers/getLeaderBoardUser'
import { requestUrl } from 'obsidian'

vi.mock('@/src/helpers/getLocalTodayDate', () => ({
  getLocalTodayDate: vi.fn(() => '2024-01-15'),
}))

describe('getLeaderBoardUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('private mode', () => {
    it('should return empty result when private mode is enabled', async () => {
      const plugin = { settings: { privateMode: true } }

      const result = await getLeaderBoardUser('user123', plugin)

      expect(result).toEqual({
        user: undefined,
        totalCount: 0,
      })
      expect(requestUrl).not.toHaveBeenCalled()
    })

    it('should make API call when private mode is disabled', async () => {
      const plugin = { settings: { privateMode: false } }
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: { rankings: [], totalCount: 0 },
      } as any)

      await getLeaderBoardUser('user123', plugin)

      expect(requestUrl).toHaveBeenCalled()
    })

    it('should make API call when plugin is undefined', async () => {
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: { rankings: [], totalCount: 0 },
      } as any)

      await getLeaderBoardUser('user123')

      expect(requestUrl).toHaveBeenCalled()
    })

    it('should make API call when settings is undefined', async () => {
      const plugin = {}
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: { rankings: [], totalCount: 0 },
      } as any)

      await getLeaderBoardUser('user123', plugin)

      expect(requestUrl).toHaveBeenCalled()
    })
  })

  describe('successful API response', () => {
    it('should find user in rankings', async () => {
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: {
          rankings: [
            { userId: 'user123', ranking: 5, vaults: [{ name: 'vault1', ranking: 3 }] },
            { userId: 'other', ranking: 10, vaults: [] },
          ],
          totalCount: 100,
        },
      } as any)

      const result = await getLeaderBoardUser('user123')

      expect(result.user).toEqual({
        userId: 'user123',
        ranking: 5,
        vaults: [{ name: 'vault1', ranking: 3 }],
      })
      expect(result.totalCount).toBe(100)
    })

    it('should return undefined user when not found in rankings', async () => {
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: {
          rankings: [{ userId: 'other', ranking: 10, vaults: [] }],
          totalCount: 50,
        },
      } as any)

      const result = await getLeaderBoardUser('user123')

      expect(result.user).toBeUndefined()
      expect(result.totalCount).toBe(50)
    })

    it('should fallback to rankings length when totalCount is missing', async () => {
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: {
          rankings: [
            { userId: 'a', ranking: 1, vaults: [] },
            { userId: 'b', ranking: 2, vaults: [] },
            { userId: 'c', ranking: 3, vaults: [] },
          ],
        },
      } as any)

      const result = await getLeaderBoardUser('user123')

      expect(result.totalCount).toBe(3)
    })

    it('should return 0 totalCount when rankings is empty and totalCount is missing', async () => {
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: {
          rankings: [],
        },
      } as any)

      const result = await getLeaderBoardUser('user123')

      expect(result.totalCount).toBe(0)
    })
  })

  describe('API errors', () => {
    it('should reject when status is not 200', async () => {
      vi.mocked(requestUrl).mockResolvedValue({
        status: 500,
        json: {},
      } as any)

      await expect(getLeaderBoardUser('user123')).rejects.toThrow('Invalid status')
    })

    it('should reject when requestUrl throws', async () => {
      const networkError = new Error('Network error')
      vi.mocked(requestUrl).mockRejectedValue(networkError)

      await expect(getLeaderBoardUser('user123')).rejects.toThrow('Network error')
    })
  })

  describe('API request configuration', () => {
    it('should call requestUrl with correct parameters', async () => {
      vi.mocked(requestUrl).mockResolvedValue({
        status: 200,
        json: { rankings: [], totalCount: 0 },
      } as any)

      await getLeaderBoardUser('user123')

      expect(requestUrl).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://www.yourpulse.cc/app/api/leaderboard?date=2024-01-15',
        headers: { 'content-type': 'application/json' },
      })
    })
  })
})
