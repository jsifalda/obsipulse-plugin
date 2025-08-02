import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateDailyAverage, calculateInLastXDays, calculateStreak, parseDailyCounts } from '@/lib/stats'
import { DeviceData } from '@/lib/types'
import { convertObjectToArray } from '@/lib/utils'
import * as Plot from '@observablehq/plot'
import { Activity, Info } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

const MAX_DAILY_COUNT = 18
const MAX_DAILY_HALF_COUNT = Math.floor(MAX_DAILY_COUNT / 2)

interface VaultDetailProps {
  vault: DeviceData
}

export const VaultDetail = ({ vault: data }: VaultDetailProps) => {
  const dailyCounts = useMemo(() => {
    return convertObjectToArray(parseDailyCounts(data.dayCounts))
  }, [data.dayCounts])

  const vault = useMemo(() => {
    return {
      count: dailyCounts.filter(({ value }) => value).length,
      streak: calculateStreak(dailyCounts),
      averages: {
        daily: calculateDailyAverage(dailyCounts),
      },
      inLast: {
        '7days': calculateInLastXDays(dailyCounts, 7),
        '365days': calculateInLastXDays(dailyCounts, 365),
      },
      dailyCounts,
    }
  }, [dailyCounts])

  const dailyCountsSorted = useMemo(() => {
    return dailyCounts.sort((a, b) => {
      const aDate = new Date(a.date)
      const bDate = new Date(b.date)
      return bDate.getTime() - aDate.getTime()
    })
  }, [dailyCounts])

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const barChart = Plot.plot({
      padding: 0,
      height: 240, // Set the height to 240px
      y: {
        type: 'band',
        domain: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      x: {
        type: 'band',
        domain: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      },
      color: {
        type: 'threshold',
        //  Opacity scales have a default domain from 0 to the maximum value of associated channels.
        domain: (() => {
          const values = dailyCounts.map((d) => d.value).filter(Boolean)
          const numberOfSteps = 9

          if (values.length === 0) {
            return Array.from({ length: numberOfSteps }, (_, i) => i)
          }

          const min = Math.min(...values)
          const max = Math.max(...values)
          const step = (max - min) / numberOfSteps
          const numberOfStepsTrimmed = numberOfSteps - 2 // (to remove the min and max)

          let result = [min]
          for (let i = 1; i <= numberOfStepsTrimmed; i++) {
            const stepValue = min + i * step
            result.push(stepValue)
          }
          result.push(max)
          // const result = [min + step, min + 2 * step, min + 3 * step, max]
          // console.log('---result', result, { min, max, step })
          return result
        })(),
        range: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39', '#184d27', '#0d3318'],
      },
      // based on: https://observablehq.com/@observablehq/plot-seattle-temperature-heatmap?intent=fork
      marks: [
        Plot.cell(
          dailyCounts,
          Plot.group(
            { fill: 'max' },
            {
              x: (d) => {
                const x = new Date(d.date).toLocaleString('default', { month: 'short' })
                return x
              },
              y: (d) => {
                const day = new Date(d.date).getDay()
                const y = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                return y
              },
              // fill: (d) => d.value,
              fill: 'value',
              inset: 2,
              title: (d) => `${d.key}: ${d.value} words`,
            },
          ),
        ),
      ],
    })
    ref?.current?.append(barChart)

    return () => barChart.remove()
  }, [dailyCounts])

  return (
    <>
      <div className="yp-flex yp-flex-col yp-md-flex-row yp-justify-between yp-mt-5">
        <div className="yp-md-mb-0">
          <h2 className="yp-text-xl yp-font-bold yp-mb-5">Contributions in last year</h2>
          <div {...{ ref }}></div>
          {/* {dailyCountsSorted.length ? (
            <p className="yp-text-xs yp-text-muted-foreground yp-mt-0 yp-mb-3 yp-flex yp-items-center yp-gap-1">
              <Info className="yp-h-4 yp-w-4" />
              Tip: Hover over cells to see word count details
            </p>
          ) : null} */}
        </div>
      </div>

      <div className="yp-flex yp-flex-row yp-mt-5 yp-justify-between">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Streak</CardTitle>
          </CardHeader>
          <CardContent className="yp-flex yp-justify-center">
            <Badge>
              <Activity className="yp-size-4" />
              &nbsp; {vault.streak} days
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="yp-text-center">Daily Average</CardTitle>
          </CardHeader>
          <CardContent className="yp-flex yp-justify-center">
            <Badge>
              {/* <WholeWord className="size-4" /> &nbsp; */}
              {vault.averages.daily} words
            </Badge>
          </CardContent>
        </Card>
      </div>

      <h2 className="yp-text-xl yp-font-bold yp-mt-5 yp-mb-5">Contributions activity</h2>
      <div
        className={
          dailyCountsSorted.length > MAX_DAILY_HALF_COUNT
            ? 'yp-flex yp-flex-col yp-justify-between'
            : 'yp-flex yp-flex-row yp-justify-between'
        }
      >
        {dailyCountsSorted.length === 0 ? (
          <div className="yp-text-gray-500">No contributions yet.</div>
        ) : (
          <>
            <div
              className={
                dailyCountsSorted.length > MAX_DAILY_HALF_COUNT
                  ? 'yp-grid yp-grid-cols-1 yp-md-grid-cols-2 yp-gap-1'
                  : 'yp-grid yp-grid-cols-1 yp-gap-1'
              }
            >
              {dailyCountsSorted.slice(0, MAX_DAILY_COUNT).map((item) => {
                return (
                  <div key={item.key} className="yp-flex yp-justify-left">
                    <div className="yp-pl-2">{item.key}:</div>
                    <div className="yp-pl-2">{item.value}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {dailyCountsSorted.length > MAX_DAILY_COUNT && (
        <div className="yp-text-sm yp-text-gray-500 yp-mt-2 yp-col-span-2">
          Showing only the last {MAX_DAILY_COUNT} items out of {dailyCountsSorted.length} contributions.
        </div>
      )}

      <div className="yp-flex yp-flex-row yp-justify-between yp-mt-5">
        <Card>
          <CardHeader>
            <CardTitle className="yp-text-center">Last 7 days</CardTitle>
          </CardHeader>
          <CardContent className="yp-flex yp-justify-center">
            <Badge>{vault.inLast['7days']} words</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="yp-text-center">Last 365 days</CardTitle>
          </CardHeader>
          <CardContent className="yp-flex yp-justify-center">
            <Badge>{vault.inLast['365days']} words</Badge>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
