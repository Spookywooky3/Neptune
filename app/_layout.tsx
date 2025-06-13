// expo react stack
import { Drawer } from 'expo-router/drawer';

// third party stack
import { MD2LightTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

// context
import { PlannerProvider } from '@/context/planner';
import { DecompressionProvider } from '@/context/decompression';
import { Alert } from 'react-native';

export default function RootLayout() {
  try {
    return (
      <PaperProvider theme={MD2LightTheme}>
        {' '}
        {/* Finish the web setup for paper */}
        <PlannerProvider>
          <DecompressionProvider>
            <Drawer>
              <Drawer.Screen
                name='index'
                options={{ drawerLabel: 'Home', title: 'Home' }}
              />
            </Drawer>
          </DecompressionProvider>
        </PlannerProvider>
      </PaperProvider>
    );
  } catch (error: any) {
    Alert.alert('Error', error);
  }
}
