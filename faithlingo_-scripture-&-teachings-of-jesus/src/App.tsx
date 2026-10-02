/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { LifeOSProvider } from './context/LifeOSContext';
import { LifeOSDesktop } from './components/lifeos/LifeOSDesktop';

export default function App() {
  return (
    <AppProvider>
      <LifeOSProvider>
        <LifeOSDesktop />
      </LifeOSProvider>
    </AppProvider>
  );
}
