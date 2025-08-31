// import { createContext } from "react";

// export interface Alert {
//   msg: string;
//   type: "success" | "error" | "info";
// }

// export interface AlertContextType {
//   alert: Alert | null;
//   showAlert: (message: string, type: Alert["type"]) => void;
// }

// const AlertContext = createContext<AlertContextType | undefined>(undefined);

// export default AlertContext;
import { createContext } from "react";

export interface Alert {
  msg: string;
  type: "success" | "danger" | "info";
}

export interface AlertContextType {
  alert: Alert | null;
  showAlert: (msg: string, type: Alert["type"]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export default AlertContext;


