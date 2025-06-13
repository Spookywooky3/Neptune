// react and expo stack
import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// third party stack
import { Surface, Text, Button } from 'react-native-paper';

// components
import { styles } from '@/components/styles';

import { PlannerPreferences } from '@/components/tables/preference-table';
import { StopTable } from '@/components/tables/stop-table';
import { GasTable } from '@/components/tables/gas-table';

import { StopGraph } from '@/components/graphs/stop-graph';
import { SaturationGraph } from '@/components/graphs/saturation-graph';

const Index = () => {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    console.log(pageIndex);
  }, [pageIndex]);

  return (
    <View style={[styles.container, { flexDirection: 'row', justifyContent: 'space-between' }]}>
      {/* Main Panel */}
      <View style={{ flex: 0.6, flexDirection: 'column' }}>
        <Surface
          style={styles.surface}
          elevation={1}>
          <View style={{ flex: 0.5 }}>
            <StopGraph />
          </View>
          <View style={{ flex: 0.5 }}>
            <SaturationGraph />
          </View>
        </Surface>
      </View>

      {/* Side Panel */}
      <View style={{ flex: 0.39, flexDirection: 'column' }}>
        {
          {
            0: (
              <>
                {/* Mixture Table */}
                <View style={{ paddingBottom: '1%' }}>
                  <GasTable />
                </View>
                {/* Stop Table */}
                <View style={{ paddingBottom: '1%' }}>
                  <StopTable />
                </View>
              </>
            ),
            1: (
              <>
                {/* Preferences */}
                <View style={{ paddingBottom: '1%' }}>
                  <PlannerPreferences />
                </View>
              </>
            ),
          }[pageIndex]
        }
        {/* Anchored 'Tab' Bar */}
        <View style={{ marginTop: 'auto' }}>
          <Surface
            style={[styles.surface, { flexDirection: 'row' }]}
            elevation={1}>
            {/* Left Button */}
            <View style={{ flex: 0.5 }}>
              <View style={{ flex: 0.5 }}>
                <Button
                  style={{
                    borderRadius: 10,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderWidth: 1,
                  }}
                  onPress={() => setPageIndex(0)}>
                  Dive Profile
                </Button>
              </View>
            </View>
            {/* Right Button */}
            <View style={{ flex: 0.5 }}>
              <Button
                style={{
                  borderRadius: 10,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderWidth: 1,
                }}
                onPress={() => setPageIndex(1)}>
                Preferences
              </Button>
            </View>
          </Surface>
        </View>
      </View>
    </View>
  );
};

const Page = ({ children }: { children: React.ReactNode }) => {};
export default Index;
