import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as ReduxProvider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider as UrqlProvider} from 'urql';
import {store, persistor} from './src/store/store';
import {client} from './src/api/mock-client';
import {AppNavigator} from './src/navigation/AppNavigator';

function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <UrqlProvider value={client}>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </UrqlProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

export default App;
