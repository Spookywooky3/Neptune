// react and expo stack
import React, { useState } from 'react';
import { View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// third party stack
import { Surface, DataTable, TextInput, Checkbox } from 'react-native-paper';

// context
import { useDecompression } from '@/context/decompression';

// components
import { styles } from '@/components/styles';

export const GasTable = () => {
  const decoContext = useDecompression();

  return (
    <Surface
      style={styles.surface}
      elevation={1}>
      <DataTable style={{}}>
        <DataTable.Header>
          <DataTable.Title>Oxygen</DataTable.Title>
          <DataTable.Title>Nitrogen</DataTable.Title>
          <DataTable.Title>Capacity (L)</DataTable.Title>
          <DataTable.Title>Pressure (Bar)</DataTable.Title>
          <DataTable.Title numeric> </DataTable.Title>
        </DataTable.Header>

        {decoContext.preferences!.mixtures!.map((mixture, index) => {
          return (
            <DataTable.Row key={index}>
              <DataTable.Cell>{mixture.oxygen}</DataTable.Cell>
              <DataTable.Cell>{mixture.nitrogen}</DataTable.Cell>
              <DataTable.Cell>{mixture.cylinders[0].waterCapacity}</DataTable.Cell>
              <DataTable.Cell>{mixture.cylinders[0].workingPressure}</DataTable.Cell>
              <DataTable.Cell numeric>
                <MaterialCommunityIcons
                  name='trash-can-outline'
                  size={24}
                  color='red'
                />
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </Surface>
  );
};