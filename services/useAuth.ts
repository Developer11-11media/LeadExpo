import { useContext } from "react";
import { UserContext } from "./UserContext";

export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useAuth debe usarse dentro de UserProvider");
  return context;
};
