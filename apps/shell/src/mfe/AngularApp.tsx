import React , { useEffect } from 'react';

const AngularApp  = () => {
    useEffect(() => {
      window.process = {
        env: {
          NG_APP_ENV: 'development',
          NODE_ENV: 'development'
        }
      };
      let mounted = true;
      const loadAngular = async () => {
        (window as any).isReactShell = true;
        const { mountAngularApp } = await import('visitlyAngular/Bootstrap');
        if (mounted) {
          mountAngularApp('angular-container');
        }
      };
      loadAngular().catch(console.error);
      return () => {
        mounted = false;
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