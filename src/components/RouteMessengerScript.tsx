"use client";

import { useEffect } from 'react';

export default function RouteMessengerScript() {
  useEffect(() => {
    const script = document.getElementById('route-messenger-script');
    if (script) {
      script.setAttribute('data-target-origin', '*');
      script.setAttribute('data-message-type', 'ROUTE_CHANGE');
      script.setAttribute('data-include-search-params', 'true');
      script.setAttribute('data-only-in-iframe', 'true');
      script.setAttribute('data-debug', 'true');
      script.setAttribute('data-custom-data', JSON.stringify({
        appName: 'YourApp',
        version: '1.0.0',
        greeting: 'hi'
      }));
    }
  }, []);

  return null;
}

