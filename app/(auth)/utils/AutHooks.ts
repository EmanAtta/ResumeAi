import { useMutation } from "@tanstack/react-query";
import { login, signup, LoginCredentials, SignupCredentials, AuthResponse } from "./AutServices";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLogin = () => {
  const mutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: async (response) => {
      console.log('Login successful:', response);
      // Store auth token - handle nested data structure
      const token = (response as any)?.data?.token || response.token;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        console.log('Token stored successfully:', token.substring(0, 20) + '...');
      } else {
        console.warn('No token found in response:', response);
      }
    },
    onError: (error) => {
      console.error('Login error:', error.message);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};

export const useSignup = () => {
  const mutation = useMutation<AuthResponse, Error, SignupCredentials>({
    mutationFn: signup,
    onSuccess: async (response) => {
      console.log('Signup successful:', response);
      // Store auth token - handle nested data structure
      const token = (response as any)?.data?.token || response.token;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        console.log('Token stored successfully:', token.substring(0, 20) + '...');
      } else {
        console.warn('No token found in response:', response);
      }
    },
    onError: (error) => {
      console.error('Signup error:', error.message);
    },
  });

  return {
    signup: mutation.mutate,
    signupAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};
