import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';



import AsyncStorage from '@react-native-async-storage/async-storage';







export enum UserType {



  SENIOR = 'SENIOR',



  GUARDIAN = 'GUARDIAN'



}







export interface User {



  id: string;



  userId: string;



  name: string;



  phone: string;



  userType: UserType;



  profileImage?: string;



  createdAt?: string;



  updatedAt?: string;



  // kakaoAccessToken은 백엔드에서 관리



  gender?: string;



}







interface UserContextType {



  user: User | null;



  userType: UserType | null;



  isLoading: boolean;



  login: (userData: User) => Promise<void>;



  logout: () => Promise<void>;



  updateUser: (userData: Partial<User>) => Promise<void>;



  setUserType: (type: UserType) => void;



}







const UserContext = createContext<UserContextType | undefined>(undefined);







interface UserProviderProps {



  children: ReactNode;



}







export function UserProvider({ children }: UserProviderProps) {



  const [user, setUser] = useState<User | null>(null);



  const [userType, setUserType] = useState<UserType | null>(null);



  const [isLoading, setIsLoading] = useState(true);







  useEffect(() => {



    loadUserFromStorage();



  }, []);







  const loadUserFromStorage = async () => {



    try {



      const storedUser = await AsyncStorage.getItem('user');



      const storedUserType = await AsyncStorage.getItem('userType');



      



      if (storedUser) {



        setUser(JSON.parse(storedUser));



      }



      



      if (storedUserType) {



        setUserType(storedUserType as UserType);



      }



    } catch (error) {



      console.error('Failed to load user from storage:', error);



    } finally {



      setIsLoading(false);



    }



  };







  const login = async (userData: User) => {



    try {



      setUser(userData);



      setUserType(userData.userType);



      



      await AsyncStorage.setItem('user', JSON.stringify(userData));



      await AsyncStorage.setItem('userType', userData.userType);



    } catch (error) {



      console.error('Failed to save user to storage:', error);



      throw error;



    }



  };







  const logout = async () => {



    try {



      setUser(null);



      setUserType(null);



      



      await AsyncStorage.removeItem('user');



      await AsyncStorage.removeItem('userType');



    } catch (error) {



      console.error('Failed to clear user from storage:', error);



      throw error;



    }



  };







  const updateUser = async (userData: Partial<User>) => {



    if (!user) return;



    



    try {



      const updatedUser = { ...user, ...userData };



      setUser(updatedUser);



      



      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));



    } catch (error) {



      console.error('Failed to update user in storage:', error);



      throw error;



    }



  };







  const value: UserContextType = {



    user,



    userType,



    isLoading,



    login,



    logout,



    updateUser,



    setUserType



  };







  return (



    <UserContext.Provider value={value}>



      {children}



    </UserContext.Provider>



  );



}







export function useUser() {



  const context = useContext(UserContext);



  if (context === undefined) {



    throw new Error('useUser must be used within a UserProvider');



  }



  return context;



}