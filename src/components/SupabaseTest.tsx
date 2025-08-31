import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test environment variables
        const env = {
          url: import.meta.env.VITE_SUPABASE_URL,
          key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
        };
        setEnvVars(env);
        console.log('🔧 Environment variables:', env);

        // Test Supabase connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          console.error('❌ Supabase connection error:', error);
          setConnectionStatus(`Error: ${error.message}`);
        } else {
          console.log('✅ Supabase connection successful');
          setConnectionStatus('✅ Connected successfully');
        }
      } catch (error) {
        console.error('💥 Connection test failed:', error);
        setConnectionStatus(`Failed: ${error}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div><strong>Supabase Test</strong></div>
      <div>Status: {connectionStatus}</div>
      <div>URL: {envVars.url ? '✅' : '❌'}</div>
      <div>Key: {envVars.key}</div>
    </div>
  );
};

export default SupabaseTest;
