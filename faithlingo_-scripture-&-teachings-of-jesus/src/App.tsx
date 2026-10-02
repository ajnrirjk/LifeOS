/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { LifeOSProvider } from './context/LifeOSContext';
import { LifeOSDesktop } from './components/lifeos/LifeOSDesktop';
import { TermsOfServicePage } from './components/TermsOfServicePage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());
  const [currentHash, setCurrentHash] = useState(() => window.location.hash.toLowerCase());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
      setCurrentHash(window.location.hash.toLowerCase());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  if (currentPath.startsWith('/terms') || currentHash.includes('terms')) {
    return <TermsOfServicePage />;
  }

  return (
    <AppProvider>
      <LifeOSProvider>
        <LifeOSDesktop />
      </LifeOSProvider>
    </AppProvider>
  );
}
