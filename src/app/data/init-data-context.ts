import { createContext } from "react";

export interface InitDataType {
  timezone: string;
  latitude: number;
  longitude: number;
  priceArea: string;
}
export const initDataDefaultValue = {
  timezone: "Europe/Copenhagen",
  latitude: 5.5,
  longitude: 6.5,
  priceArea: "DK2",
};

export const InitDataContext =
  createContext<InitDataType>(initDataDefaultValue);
