// react and expo stack
import React, { useEffect, useState } from 'react';

// third party stack
import { CartesianChart, Line } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

// context
import { useDecompression } from '@/context/decompression';
import { usePlanner } from '@/context/planner';

export const StopGraph = () => {
  const font = useFont(require('@/assets/fonts/Inter.ttf'));

  const { saturationTimeline, decoProfile, diveProfile } = useDecompression();

  let [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    let diveTime = 0;
    let points = Array<{ x: number; y: number }>();

    diveProfile!.concat(decoProfile!).forEach((stop, index) => {
      points.push(
        { x: diveTime, y: stop.startDepth },
        { x: (diveTime += stop.timeSeconds), y: stop.endDepth }
      );
    });

    setPoints([...new Map(points.map(point => [point.x, point])).values()]);
  }, [decoProfile]);

  
  if (
    saturationTimeline!.length === 0 ||
    diveProfile!.length === 0 ||
    points.length === 0
  ) {
    return <div>Loading...</div>;
  }
    

  return (
    <CartesianChart
      data={points!}
      padding={30}
      xKey='x'
      yKeys={['y']}
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
          font,
          labelPosition: 'inset',
          formatYLabel(value) {
            return `${value}m`;
          },
        },
      ]}
      domain={{
        y: [Math.max(...points!.map((point) => point.y)), 0],
      }}
      domainPadding={{
        bottom: 5,
        right: 31,
      }}>
      {({ points }) => (
        <Line
          points={points.y}
          color='#188a8d'
          strokeWidth={2}
        />
      )}
    </CartesianChart>
  );
};
