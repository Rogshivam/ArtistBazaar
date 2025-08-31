// import React, { useState } from "react";
// import AlertContext, { Alert, AlertContextType } from "./AlertContext";

// const AlertState: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [alert, setAlert] = useState<Alert | null>(null);

//   const showAlert: AlertContextType["showAlert"] = (message, type) => {
//     setAlert({ msg: message, type });
//     setTimeout(() => setAlert(null), 2000);
//   };

//   return (
//     <AlertContext.Provider value={{ alert, showAlert }}>
//       {children}
//     </AlertContext.Provider>
//   );
// };

// export default AlertState;
import { useState } from "react";
import AlertContext, { Alert } from "./AlertContext";

const AlertState: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = (msg: string, type: Alert["type"]) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertState;

