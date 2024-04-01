import { Serie } from "@nivo/line";
import { DateTime } from "luxon";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { InitDataContext } from "../app/data/init-data-context";
import { ThemeContext } from "../app/theme-context";
import WeatherForecast from "./WeatherForecast";
import WeatherPrecipitation from "./WeatherPrecipitation";
import WeatherWind from "./WeatherWind";

export interface DayData {
  date: DateTime;
  sunrise: DateTime;
  sunset: DateTime;
  temperature: { min: number; max: number };
  weather_code: number;
}
export interface WeatherContextType {
  forecast: DayData[];
  selectedDay: DateTime;
  precipitation: Serie[];
  wind: Serie[];
  maxWind: number;
  setWeatherContext: Dispatch<SetStateAction<WeatherContextType | null>>;
}
export const weatherContextDefaultValue = {
  forecast: [],
  selectedDay: DateTime.now(),
  precipitation: [],
  wind: [],
  maxWind: -1,
  setWeatherContext: () => {},
};

export const WeatherContext = createContext<WeatherContextType>(
  weatherContextDefaultValue
);

export default function WeatherCombo() {
  const [weatherContext, setWeatherContext] =
    useState<WeatherContextType | null>(null);
  const { isMobile } = useContext(ThemeContext);

  const { timezone, latitude, longitude } = useContext(InitDataContext);

  useEffect(() => {
    const selectedDay =
      weatherContext?.selectedDay ||
      DateTime.now().setZone(timezone).startOf("day");

    const fetchForecast = async () => {
      const forecastDays = 5;
      const params: Record<string, any> = {
        latitude,
        longitude,
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "sunrise",
          "sunset",
        ].join(","),
        timezone: "UTC",
        forecast_days: forecastDays,
        format: "json",
      };
      const meteoURL = new URL("https://api.open-meteo.com/v1/forecast");

      for (const param in params) {
        meteoURL.searchParams.append(param, params[param]);
      }

      const response = await fetch(meteoURL);
      const data = await response.json();

      const days: DayData[] = [];
      for (let i = 0; i < forecastDays; i++) {
        days.push({
          date: DateTime.fromISO(data.daily.time[i]),
          sunrise: DateTime.fromISO(data.daily.sunrise[i] + "Z"), // adding Z to make it UTC
          sunset: DateTime.fromISO(data.daily.sunset[i] + "Z"),
          temperature: {
            min: data.daily.temperature_2m_min[i],
            max: data.daily.temperature_2m_max[i],
          },
          weather_code: data.daily.weather_code[i],
        });
      }

      return days;
    };

    const fetchPrecipitationAndWind = async () => {
      const params: Record<string, any> = {
        latitude: 55.616656,
        longitude: 12.566018,
        hourly: [
          "precipitation_probability",
          "wind_speed_10m",
          "wind_gusts_10m",
        ].join(","),
        start_date: selectedDay.toFormat("yyyy-MM-dd"),
        end_date: selectedDay.toFormat("yyyy-MM-dd"),
        timezone: "UTC",
        format: "json",
      };
      const meteoURL = new URL("https://api.open-meteo.com/v1/forecast");

      for (const param in params) {
        meteoURL.searchParams.append(param, params[param]);
      }

      const response = await fetch(meteoURL);
      const data = await response.json();

      const precipitation: Serie[] = [{ id: "Precipitation", data: [] }];
      const wind: Serie[] = [
        { id: "Wind", data: [] },
        { id: "Gusts", data: [] },
      ];

      let maxWind = -1;
      for (let i = 0; i < 24; i++) {
        (precipitation[0].data as any).push({
          x: new Date(data.hourly.time[i]),
          y: data.hourly.precipitation_probability[i],
        });
        (wind[0].data as any).push({
          x: new Date(data.hourly.time[i]),
          y: data.hourly.wind_speed_10m[i],
        });
        (wind[1].data as any).push({
          x: new Date(data.hourly.time[i]),
          y: data.hourly.wind_gusts_10m[i],
        });
        maxWind = Math.max(
          maxWind,
          data.hourly.wind_gusts_10m[i],
          data.hourly.wind_speed_10m[i]
        );
      }

      return { precipitation, wind, maxWind };
    };

    const fetchAll = async () => {
      const [forecast, { wind, precipitation, maxWind }] = await Promise.all([
        fetchForecast(),
        fetchPrecipitationAndWind(),
      ]);

      setWeatherContext({
        forecast,
        wind,
        selectedDay,
        precipitation,
        maxWind,
        setWeatherContext,
      });
    };

    fetchAll();
  }, [weatherContext?.selectedDay.toFormat("YYYY-MM-dd")]);

  if (!weatherContext) {
    return null;
  }

  return (
    <WeatherContext.Provider value={weatherContext}>
      <div
        className="flex items-center justify-center"
        style={{ height: "50vh" }}
      >
        <WeatherForecast />
      </div>
      <div style={{ height: isMobile ? "100vh" : "50vh" }}>
        <WeatherPrecipitation />
      </div>
      <div style={{ height: isMobile ? "100vh" : "50vh" }}>
        <WeatherWind />
      </div>
    </WeatherContext.Provider>
  );
}
