import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create(
  persist(
    set => ({
      user: null,
      token: null,
      hydrated: false,
      setUser: user => set({user}),
      setToken: token => set({token}),
      clearAuth: () => set({user: null, token: null}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state?.set({hydrated: true});
      },
    },
  ),
);

export default useAuthStore;
