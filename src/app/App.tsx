import React from 'react';
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';

/**
 * Application root. Pure composition: providers wrap navigation. All concrete
 * logic lives in features and shared layers — this stays tiny on purpose.
 */
export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
