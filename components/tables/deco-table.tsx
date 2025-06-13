// react and expo stack
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// third party stack
import { Surface, DataTable, TextInput, Checkbox } from 'react-native-paper';

// context
import { usePlanner, StopUI } from '@/context/planner';

// components
import { styles } from '@/components/styles';

export const DecoTable = () => {
  const { stopsUI, setStopsUI } = usePlanner()!;

  const [newStopDepth, setNewStopDepth] = useState(0);
  const [newStopTime, setNewStopTime] = useState(0);

  const validateText = (text: string) => text.replace(/[^0-9^.]/g, '');

  const saveStops = () => {
    if (newStopDepth < 0 || newStopTime < 0) return;

    setStopsUI!([...stopsUI!, { depthMetres: newStopDepth, timeSeconds: newStopTime }]);
  };

  const moveStop = (currentIndex: number, newIndex: number) => {
    let newStops = [...stopsUI!];

    newStops.splice(newIndex, 0, newStops.splice(currentIndex, 1)[0]);
    setStopsUI!(newStops);
  };

  const deleteStop = (index: number) => {
    setStopsUI!(stopsUI!.filter((_, i) => i !== index));
  };

  return (
    <Surface
      style={styles.surface}
      elevation={1}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Depth (m)</DataTable.Title>
          <DataTable.Title>Time (s)</DataTable.Title>
          <DataTable.Title numeric>DECO</DataTable.Title>
        </DataTable.Header>

        {stopsUI!.map((stop, index) => {
          return (
            <DataTable.Row key={`r-${index}`}>
              <DataTable.Cell>{stop.depthMetres}</DataTable.Cell>
              <DataTable.Cell>{stop.timeSeconds}</DataTable.Cell>
              <DataTable.Cell
                style={{ alignItems: 'center' }}
                numeric>
                {index !== 0 && index - 1 > 0 ? (
                  <Pressable
                    key={`pup-${index}`}
                    style={{ paddingLeft: 5 }}
                    onPress={() => moveStop(index, index - 1)}>
                    <MaterialCommunityIcons
                      name='arrow-up'
                      size={18}
                      color='black'
                    />
                  </Pressable>
                ) : null}
                {index !== 0 && index !== stopsUI!.length - 1 ? (
                  <Pressable
                    key={`pdown-${index}`}
                    style={{ paddingLeft: 5 }}
                    onPress={() => moveStop(index, index + 1)}>
                    <MaterialCommunityIcons
                      name='arrow-down'
                      size={18}
                      color='black'
                    />
                  </Pressable>
                ) : null}
                {index !== 0 ? (
                  <Pressable
                    key={`premove-${index}`}
                    style={{ paddingLeft: 10 }}
                    onPress={() => deleteStop(index)}>
                    <MaterialCommunityIcons
                      name='map-marker-remove-outline'
                      size={24}
                      color='red'
                    />
                  </Pressable>
                ) : null}
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </Surface>
  );
};
