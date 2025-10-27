'use client'

import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { TopicCount } from '@/lib/queries/clubs'

interface TopicChartProps {
  topics: TopicCount[]
  clubName: string
}

export function TopicChart({ topics, clubName }: TopicChartProps) {
  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
      backgroundColor: 'transparent',
      height: Math.min(topics.length * 35 + 60, 500),
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: topics.map((t) => t.topic),
      title: {
        text: null,
      },
      labels: {
        style: {
          fontSize: '10px',
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Liczba Druków',
        style: {
          fontSize: '11px',
        },
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: '{point.y}',
          style: {
            fontSize: '10px',
          },
        },
        color: '#3b82f6',
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        type: 'bar',
        name: 'Liczba druków',
        data: topics.map((t) => t.printsCount),
      },
    ],
    tooltip: {
      headerFormat: '<b>{point.key}</b><br/>',
      pointFormat: 'Liczba druków: <b>{point.y}</b>',
    },
    credits: {
      enabled: false,
    },
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
