import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '1%',
  },
  surface: {
    borderRadius: 10,
    flex: 1,
  },
  prefInput: {
    width: '100%',
    height: 25,
    textAlign: 'right',
    fontSize: 14,
  },
  prefInputOutline: {
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
  }
});
