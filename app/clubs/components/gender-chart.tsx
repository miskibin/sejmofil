'use client'

import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ClubDemographics } from '@/lib/queries/clubs'

interface GenderChartProps {
  demographics: ClubDemographics
}

export function GenderChart({ demographics }: GenderChartProps) {
  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '250px',
    },
    title: {
      text: '',
    },
    plotOptions: {
      pie: {
        innerSize: '60%',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: {
            fontSize: '12px',
          },
        },
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Liczba',
        data: [
          {
            name: 'Kobiety',
            y: demographics.femaleCount,
            color: '#ec4899',
          },
          {
            name: 'Mężczyźni',
            y: demographics.maleCount,
            color: '#3b82f6',
          },
        ],
      },
    ],
    tooltip: {
      pointFormat: 'Liczba: <b>{point.y}</b><br/>Procent: <b>{point.percentage:.1f}%</b>',
    },
    credits: {
      enabled: false,
    },
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
