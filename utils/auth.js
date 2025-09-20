import Cookies from 'js-cookie';

export const setAuthToken = (token) => {
  if (token) {
    Cookies.set('token', token, { expires: 7 });
  } else {
    Cookies.remove('token');
  }
};

export const getAuthToken = () => {
  return Cookies.get('token');
};

export const removeAuthToken = () => {
  Cookies.remove('token');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};