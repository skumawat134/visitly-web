import React, { useEffect } from 'react';

const AngularApp = () => {
  useEffect(() => {
    window.process = {
      env: {
        NG_APP_ENV: 'development',
        NODE_ENV: 'development'
      }
    };
    let mounted = true;
    let unmountFn: (() => void) | undefined;
    const loadAngular = async () => {
      (window as any).isReactShell = true;
      const { mountAngularApp, unmountAngularApp } = await import('visitlyAngular/Bootstrap');
      if (mounted) {
        unmountFn = unmountAngularApp;
        mountAngularApp('angular-container');
      }
    };
    loadAngular().catch(console.error);
    return () => {
      mounted = false;
      if (unmountFn) {
        unmountFn();
      }
    };
  }, []);
  return (
    <div
      id="angular-container"
      className="fix-header fix-sidebar"
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'block',
        position: 'relative',
      }}
    />
  );
};
export default AngularApp;