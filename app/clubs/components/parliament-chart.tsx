'use client'

import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ClubWithStats } from '@/lib/queries/clubs'

interface ParliamentChartProps {
  clubs: ClubWithStats[]
}

// Color mapping for Polish political parties
const clubColors: Record<string, string> = {
  PiS: '#003d7a',
  KO: '#f59e0b',
  Polska2050: '#8b5cf6',
  PSL: '#16a34a',
  Lewica: '#dc2626',
  Konfederacja: '#1e40af',
  Razem: '#be123c',
  Kukiz15: '#334155',
}

export function ParliamentChart({ clubs }: ParliamentChartProps) {
  const chartData = clubs.map((club) => ({
    name: club.id,
    y: club.activeMembers,
    color: clubColors[club.id] || '#6b7280',
  }))

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
    },
    title: {
      text: '',
    },
    plotOptions: {
      pie: {
        innerSize: '50%',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}',
          style: {
            fontSize: '11px',
          },
        },
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Posłowie',
        data: chartData,
      },
    ],
    tooltip: {
      pointFormat: 'Liczba posłów: <b>{point.y}</b><br/>Udział: <b>{point.percentage:.1f}%</b>',
    },
    credits: {
      enabled: false,
    },
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
