import { NextResponse } from 'next/server'
import { AnalyticsMetric, PlatformAnalytics } from '@/types'

const seedMetrics: AnalyticsMetric[] = [
  { date: '2025-05-04', clicks: 124, views: 8420, conversions: 4, earnings: 58.0 },
  { date: '2025-05-05', clicks: 198, views: 11200, conversions: 7, earnings: 102.5 },
  { date: '2025-05-06', clicks: 156, views: 9830, conversions: 5, earnings: 73.0 },
  { date: '2025-05-07', clicks: 312, views: 18400, conversions: 11, earnings: 160.5 },
  { date: '2025-05-08', clicks: 267, views: 15600, conversions: 9, earnings: 131.5 },
  { date: '2025-05-09', clicks: 189, views: 12100, conversions: 6, earnings: 87.5 },
  { date: '2025-05-10', clicks: 445, views: 26800, conversions: 15, earnings: 219.0 },
  { date: '2025-05-11', clicks: 321, views: 19200, conversions: 11, earnings: 161.0 },
]

const platformAnalytics: PlatformAnalytics[] = [
  { platform: 'tiktok', views: 52000, clicks: 890, ctr: 1.71, earnings: 312.50, topVideo: 'Hook Test #3' },
  { platform: 'instagram', views: 31400, clicks: 520, ctr: 1.66, earnings: 182.00, topVideo: 'Pain Point Hook' },
  { platform: 'youtube', views: 18200, clicks: 380, ctr: 2.09, earnings: 133.00, topVideo: 'Story Arc Format' },
  { platform: 'facebook', views: 12800, clicks: 165, ctr: 1.29, earnings: 57.75, topVideo: 'Social Proof Version' },
  { platform: 'snapchat', views: 6900, clicks: 57, ctr: 0.83, earnings: 20.00, topVideo: 'Fast CTA Version' },
]

export async function GET() {
  const totals = seedMetrics.reduce(
    (acc, m) => ({
      clicks: acc.clicks + m.clicks,
      views: acc.views + m.views,
      conversions: acc.conversions + m.conversions,
      earnings: acc.earnings + m.earnings,
    }),
    { clicks: 0, views: 0, conversions: 0, earnings: 0 }
  )

  return NextResponse.json({
    metrics: seedMetrics,
    platforms: platformAnalytics,
    totals,
    summary: {
      avgCtr: ((totals.clicks / totals.views) * 100).toFixed(2),
      avgConversionRate: ((totals.conversions / totals.clicks) * 100).toFixed(2),
      revenuePerClick: (totals.earnings / totals.clicks).toFixed(2),
      bestDay: seedMetrics.reduce((a, b) => a.earnings > b.earnings ? a : b).date,
    },
  })
}
