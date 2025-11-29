import React, { useState } from 'react';
import { resetService } from '../services/api';
import './ResetDatabase.css';

const ResetDatabase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the database? This will delete all current data and restore demo data.'
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await resetService.reset();
      setMessage('Database reset successfully! Demo data has been loaded.');
      console.log('Reset response:', response.data);
      
      // Recargar la página después de 2 segundos para mostrar los nuevos datos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error resetting database:', error);
      const errorMessage = error.response?.data?.message || 'Error resetting database';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-database">
      <button 
        onClick={handleReset} 
        disabled={loading}
        className={`btn btn-reset ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Resetting...' : 'Reset Database'}
      </button>
      
      {message && (
        <div className="message success">
          {message}
        </div>
      )}
      
      {error && (
        <div className="message error">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default ResetDatabase;