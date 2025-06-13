// react and expo stack
import React, { useEffect, useState } from 'react';

// third party stack
import { CartesianChart, Line } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

// context
import { useDecompression, Compartment } from '@/context/decompression';

const COMPARTMENT_COLOURS = [
  '#FF5733', // Red-Orange
  '#33FF57', // Green
  '#3357FF', // Blue
  '#FF33A1', // Pink
  '#FFD700', // Gold
  '#A133FF', // Purple
  '#33FFF5', // Cyan
  '#FF8C33', // Dark Orange
  '#57FF33', // Lime Green
  '#33A1FF', // Sky Blue
  '#A1FF33', // Yellow-Green
  '#FF3333', // Bright Red
  '#33FFA1', // Mint Green
  '#8B33FF', // Deep Violet
  '#FFB733', // Warm Yellow
  '#4B0082', // Indigo
];

const formatSaturationData = (
  saturationTimeline: Array<{ diveTime: number; compartments: Array<Compartment> }>
) => {
  let mergedTimeline: Array<{ x: number; [key: string]: number }> = saturationTimeline.map(
    (tick) => {
      let result: { x: number; [key: string]: number } = { x: tick.diveTime };
      tick.compartments.map((compartment, index) => {
        result[`y${index}`] = compartment.saturation;
        result[`y${index}mv`] = compartment.mValue;
      });

      return result;
    }
  );
  return mergedTimeline;
};

export const SaturationGraph = () => {
  const font = useFont(require('@/assets/fonts/Inter.ttf'));

  const { saturationTimeline } = useDecompression();
  if (saturationTimeline!.length === 0) return <div>Loading...</div>;

  let data = formatSaturationData(saturationTimeline!);
  if (data.length === 0) return <div>No data available</div>;
  
  return (
    <CartesianChart
      data={data}
      padding={30}
      xKey='x'
      yKeys={[
        'y0',
        'y1',
        'y2',
        'y3',
        'y4',
        'y5',
        'y6',
        'y7',
        'y8',
        'y9',
        'y10',
        'y11',
        'y12',
        'y13',
        'y14',
        'y15',
      ]}
      xAxis={{
        font,
        formatXLabel(value) {
          return `${Math.floor(value / 60)}:${Math.floor(value % 60)
            .toString()
            .padStart(2, '0')}min`;
        },
      }}
      yAxis={[
        {
          yKeys: [
            'y0',
            'y1',
            'y2',
            'y3',
            'y4',
            'y5',
            'y6',
            'y7',
            'y8',
            'y9',
            'y10',
            'y11',
            'y12',
            'y13',
            'y14',
            'y15',
          ],
          font,
          labelPosition: 'inset',
          formatYLabel(value) {
            return `${value.toFixed(2)}atm`;
          },
        },
      ]}
      domainPadding={{
        bottom: 5,
        right: 31,
      }}>
      {({ points }) => {
        return (
          <>
            {Array.from({ length: 16 }, (_, i) => (
              <Line
                key={i}
                points={points[`y${i}` as keyof typeof points]}
                color={COMPARTMENT_COLOURS[i]}
                strokeWidth={2}
              />
            ))}
          </>
        );
      }}
    </CartesianChart>
  );
};
