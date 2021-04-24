import { customAlphabet } from "nanoid";
import { useEffect, useState } from "react";
import { LS_KEYS } from "../constants";

export function useUserID(): string | null {
  const [userID, setUserID] = useState<string | null>(null);
  //  useEffect forces this to happen on the client, since `window` is not
  //  available on the server during server-side rendering
  useEffect(() => {
    let userID = window.localStorage.getItem(LS_KEYS.userId);
    if (userID == null) {
      const generateBase62ID = customAlphabet(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        22
      );
      userID = generateBase62ID();
      window.localStorage.setItem("roomservice-user", userID);
    }
    setUserID(userID);
  }, []);
  return userID;
}