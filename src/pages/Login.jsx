import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Telegram Login Widget
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'auth_02_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    const container = document.getElementById('telegram-login-container');
    if (container) container.appendChild(script);
  }, []);

  
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const token = await user.getIdToken();

      const response = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/profile');
      } else {
        setError('Ошибка сервера при авторизации');
      }
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError('Неверный email или пароль');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const response = await fetch(`${API}/api/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/profile');
      } else {
        setError('Ошибка: токен не получен от сервера');
      }
    } catch (err) {
      console.error('Ошибка входа через Google:', err);
      setError('Ошибка входа через Google');
    }
  };

  // Глобальная функция Telegram
  window.onTelegramAuth = async function (user) {
    try {
      const res = await fetch(`${API}/api/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user,          
          provider: 'telegram'
        })
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/profile');
      } else {
        setError('Ошибка Telegram-входа');
      }
    } catch (err) {
      console.error('Ошибка Telegram входа:', err);
      setError('Ошибка Telegram входа');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Вход</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Войти
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Войти через Google
          </button>

          <div id="telegram-login-container" className="mt-2 flex justify-center"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
