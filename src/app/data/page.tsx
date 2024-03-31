"use client";

import { useSearchParams } from "next/navigation";
import { createContext } from "react";
import ElPrice from "../../components/ElPrice";
import WeatherCombo from "../../components/WeatherCombo";

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

export default function Data() {
  const searchParams = useSearchParams();
  return (
    <InitDataContext.Provider
      value={{
        timezone: searchParams.get("timezone") || initDataDefaultValue.timezone,
        latitude: parseFloat(
          searchParams.get("latitude") ||
            initDataDefaultValue.latitude.toString()
        ),
        longitude: parseFloat(
          searchParams.get("longitude") ||
            initDataDefaultValue.longitude.toString()
        ),
        priceArea:
          searchParams.get("priceArea") || initDataDefaultValue.priceArea,
      }}
    >
      <div className="grid grid-cols-2">
        <div style={{ width: "50vw", height: "50vh" }}>
          <ElPrice />
        </div>
        <WeatherCombo />
      </div>
    </InitDataContext.Provider>
  );
}
