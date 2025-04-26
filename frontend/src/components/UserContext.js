import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(() => {
    // on first load, check if there's a saved email
    return localStorage.getItem('userEmail') || null;
  });

  // whenever userEmail changes, update localStorage
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [userEmail]);

  return (
    <UserContext.Provider value={{ userEmail, setUserEmail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);