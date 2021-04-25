/**
 * Mock stuff for credentials stored on local storage
 */

import { customAlphabet } from "nanoid";
import { useEffect, useState } from "react";
import { LS_KEYS } from "../constants";

export function useUserID(): string | null {
  const [userID, setUserID] = useState<string | null>(null);
  //  useEffect forces this to happen on the client, since `window` is not
  //  available on the server during server-side rendering
  useEffect(() => {
    let userId = getUserID();
    setUserID(userId);
  }, []);
  return userID;
}

export function getUserID() :string  {
  let userID = window.localStorage.getItem(LS_KEYS.userId);
  if (userID == null) {
    const generateBase62ID = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      22
    );
    userID = generateBase62ID();
    window.localStorage.setItem(LS_KEYS.userId, userID);
  }
  return userID;
}

export function useRoomHostingKey(): string | null {
  const [roomHostingKey, setRoomHostingKey] = useState<string | null>(null);
  //  useEffect forces this to happen on the client, since `window` is not
  //  available on the server during server-side rendering
  useEffect(() => {
    let roomKey = getRoomHostingKey();
    setRoomHostingKey(roomKey);
  }, []);
  return roomHostingKey;
}

export function getRoomHostingKey(): string {
  let roomKey = window.localStorage.getItem(LS_KEYS.roomKey);
  if (roomKey == null) {
    const generateBase62ID = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      22
    );
    roomKey = generateBase62ID();
    window.localStorage.setItem(LS_KEYS.roomKey, roomKey);
  }
  return roomKey;
}