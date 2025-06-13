import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Surface, DataTable, TextInput, Checkbox, List, Text } from 'react-native-paper';

import { usePlanner } from '@/context/planner';
import { useDecompression } from '@/context/decompression';
import { styles } from '@/components/styles';

export const PlannerPreferences = () => {
  const plannerContext = usePlanner()!;
  const decoContext = useDecompression()!;

  const [lastStopDepth, setLastStopDepth] = useState(
    decoContext.preferences!.lastStopDepth.toString() ?? '0'
  );
  const [minStepSize, setMinStepSize] = useState(
    decoContext.preferences!.minimumStepSize.toString() ?? '0'
  );
  const [minDecoTime, setMinDecoTime] = useState(
    decoContext.preferences!.minimumDecoTime?.toString() ?? '0'
  );
  const [gfLow, setGfLowPref] = useState(decoContext.preferences!.gfLow.toString() ?? '0');
  const [gfHigh, setGfHighPref] = useState(decoContext.preferences!.gfHigh.toString() ?? '0');
  const [ascentRate, setAscentRate] = useState(
    decoContext.preferences!.ascentRate.toString() ?? '0'
  );
  const [descentRate, setDescentRate] = useState(
    decoContext.preferences!.descentRate.toString() ?? '0'
  );
  const [freshwater, setFreshwater] = useState(decoContext.preferences!.freshwater ?? false);

  const validateText = (text: string) => text.replace(/[^0-9^.]/g, '');

  const savePreferences = () => {
    decoContext.setPreference?.('lastStopDepth', parseFloat(lastStopDepth));
    decoContext.setPreference?.('minimumStepSize', parseFloat(minStepSize));
    decoContext.setPreference?.('minimumDecoTime', parseFloat(minDecoTime));
    decoContext.setPreference?.('gfLow', parseFloat(gfLow));
    decoContext.setPreference?.('gfHigh', parseFloat(gfHigh));
    decoContext.setPreference?.('ascentRate', parseFloat(ascentRate));
    decoContext.setPreference?.('descentRate', parseFloat(descentRate));
    decoContext.setPreference?.('freshwater', freshwater);
  };

  return (
    <Surface
      style={styles.surface}
      elevation={1}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Save Preferences</DataTable.Title>
          <DataTable.Title numeric>
            <Pressable onPress={savePreferences}>
              <MaterialCommunityIcons
                name='content-save-all-outline'
                size={22}
                color='green'
              />
            </Pressable>
          </DataTable.Title>
        </DataTable.Header>

        {/* Deco Preferences */}
        <DataTable.Row>
          <DataTable.Cell>
            <Text>Decompression Preferences</Text>
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <TextInput
              style={styles.prefInput}
              label='Last Stop Depth (m)'
              mode='outlined'
              keyboardType='numeric'
              value={lastStopDepth}
              onChangeText={(text) => setLastStopDepth(validateText(text))}
            />
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <TextInput
              style={styles.prefInput}
              label='Minimum Step Size (m)'
              mode='outlined'
              keyboardType='numeric'
              value={minStepSize}
              onChangeText={(text) => setMinStepSize(validateText(text))}
            />
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <TextInput
              style={styles.prefInput}
              label='Minimum Deco Time (s)'
              mode='outlined'
              keyboardType='numeric'
              value={minDecoTime}
              onChangeText={(text) => setMinDecoTime(validateText(text))}
            />
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <TextInput
              style={styles.prefInput}
              label='GF High'
              mode='outlined'
              keyboardType='numeric'
              value={gfHigh}
              onChangeText={(text) => setGfHighPref(validateText(text))}
            />
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <TextInput
              style={styles.prefInput}
              label='GF Low'
              mode='outlined'
              keyboardType='numeric'
              value={gfLow}
              onChangeText={(text) => setGfLowPref(validateText(text))}
            />
          </DataTable.Cell>
        </DataTable.Row>

        {/* Planner Preferences */}
        <DataTable.Row>
          <DataTable.Cell>
            <Text>Planner Preferences</Text>
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <TextInput
              style={styles.prefInput}
              label='Ascent Rate (m/s)'
              mode='outlined'
              keyboardType='numeric'
              value={ascentRate}
              onChangeText={(text) => setAscentRate(validateText(text))}
            />
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <TextInput
              style={styles.prefInput}
              label='Descent Rate (m/s)'
              mode='outlined'
              keyboardType='numeric'
              value={descentRate}
              onChangeText={(text) => setDescentRate(validateText(text))}
            />
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>
            <Text>Freshwater</Text>
          </DataTable.Cell>
          <DataTable.Cell numeric>
            <Checkbox
              status={freshwater ? 'checked' : 'unchecked'}
              onPress={() => setFreshwater(!freshwater)}
            />
          </DataTable.Cell>
        </DataTable.Row>
      </DataTable>
    </Surface>
  );
};
