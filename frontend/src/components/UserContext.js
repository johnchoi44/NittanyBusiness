// UserContext.js: For making email available globally
import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || null;
  });

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`userEmail`, userEmail);
    } else {
      localStorage.removeItem(`userEmail`);
    }
  }, [userEmail]);

  return (
    <UserContext.Provider value={{ userEmail, setUserEmail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);