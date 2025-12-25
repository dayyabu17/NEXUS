import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const useSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      setLoading(true);

      try {
        const response = await api.post('/auth/login', { email, password });
        const { data } = response;

        try {
          if (data.token) {
            localStorage.setItem('token', data.token);
          } else {
            localStorage.removeItem('token');
          }

          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          } else {
            localStorage.removeItem('refreshToken');
          }

          localStorage.setItem('user', JSON.stringify(data));
        } catch {
          // Ignore storage access errors to keep the flow uninterrupted
        }

        if (data.role === 'admin') {
          navigate('/admin/dashboard');
          return;
        }

        if (data.role === 'organizer') {
          try {
            sessionStorage.setItem('showWelcome', 'true');
          } catch {
            // Ignore storage access errors to keep the flow uninterrupted
          }

          navigate('/organizer/dashboard', { state: { fromSignIn: true } });
          return;
        }

        navigate('/guest/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [email, password, navigate]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleSubmit,
    loading,
  };
};

export default useSignIn;
