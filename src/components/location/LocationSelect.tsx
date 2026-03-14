"use client";

import React, { useCallback, useEffect, useState } from "react";

export interface LocationData {
  id: number;
  name: string;
}

const dummyCountries: LocationData[] = [
  { id: 1, name: "United States" },
  { id: 2, name: "United Kingdom" },
  { id: 3, name: "Germany" },
  { id: 4, name: "Japan" },
  { id: 5, name: "Australia" },
];

const dummyStates: Record<number, LocationData[]> = {
  1: [
    { id: 1, name: "New York" },
    { id: 2, name: "California" },
    { id: 3, name: "Texas" },
    { id: 4, name: "Florida" },
  ],
  2: [
    { id: 5, name: "England" },
    { id: 6, name: "Scotland" },
    { id: 7, name: "Wales" },
  ],
  3: [
    { id: 8, name: "Berlin" },
    { id: 9, name: "Bavaria" },
    { id: 10, name: "North Rhine-Westphalia" },
  ],
  4: [
    { id: 11, name: "Tokyo" },
    { id: 12, name: "Osaka" },
    { id: 13, name: "Kyoto" },
  ],
  5: [
    { id: 14, name: "New South Wales" },
    { id: 15, name: "Victoria" },
    { id: 16, name: "Queensland" },
  ],
};

const dummyCities: Record<number, LocationData[]> = {
  1: [
    { id: 1, name: "New York City" },
    { id: 2, name: "Buffalo" },
    { id: 3, name: "Albany" },
  ],
  2: [
    { id: 4, name: "Los Angeles" },
    { id: 5, name: "San Francisco" },
    { id: 6, name: "San Diego" },
  ],
  3: [
    { id: 7, name: "Houston" },
    { id: 8, name: "Dallas" },
    { id: 9, name: "Austin" },
  ],
  4: [
    { id: 10, name: "Miami" },
    { id: 11, name: "Orlando" },
    { id: 12, name: "Tampa" },
  ],
  5: [
    { id: 13, name: "London" },
    { id: 14, name: "Manchester" },
    { id: 15, name: "Birmingham" },
  ],
  6: [
    { id: 16, name: "Edinburgh" },
    { id: 17, name: "Glasgow" },
  ],
  7: [
    { id: 18, name: "Cardiff" },
    { id: 19, name: "Swansea" },
  ],
  8: [
    { id: 20, name: "Berlin" },
    { id: 21, name: "Potsdam" },
  ],
  9: [
    { id: 22, name: "Munich" },
    { id: 23, name: "Nuremberg" },
  ],
  10: [
    { id: 24, name: "Cologne" },
    { id: 25, name: "Düsseldorf" },
  ],
  11: [
    { id: 26, name: "Tokyo" },
    { id: 27, name: "Yokohama" },
  ],
  12: [
    { id: 28, name: "Osaka" },
    { id: 29, name: "Kyoto" },
  ],
  14: [
    { id: 30, name: "Sydney" },
    { id: 31, name: "Newcastle" },
  ],
  15: [
    { id: 32, name: "Melbourne" },
    { id: 33, name: "Geelong" },
  ],
  16: [
    { id: 34, name: "Brisbane" },
    { id: 35, name: "Gold Coast" },
  ],
};

interface LocationSelectProps {
  countryLabel?: string;
  stateLabel?: string;
  cityLabel?: string;
  countryValue?: number | null;
  stateValue?: number | null;
  cityValue?: number | null;
  onCountryChange?: (value: number | null) => void;
  onStateChange?: (value: number | null) => void;
  onCityChange?: (value: number | null) => void;
  required?: boolean;
}

export default function LocationSelect({
  countryLabel = "Country",
  stateLabel = "State",
  cityLabel = "City",
  countryValue,
  stateValue,
  cityValue,
  onCountryChange,
  onStateChange,
  onCityChange,
  required = false,
}: LocationSelectProps) {
  const [countries, setCountries] = useState<LocationData[]>([]);
  const [states, setStates] = useState<LocationData[]>([]);
  const [cities, setCities] = useState<LocationData[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const fetchCountries = useCallback(() => {
    setLoadingCountries(true);
    setTimeout(() => {
      setCountries(dummyCountries);
      setLoadingCountries(false);
    }, 300);
  }, []);

  const fetchStates = useCallback((countryId: number) => {
    setLoadingStates(true);
    setTimeout(() => {
      setStates(dummyStates[countryId] || []);
      setLoadingStates(false);
    }, 300);
  }, []);

  const fetchCities = useCallback((countryId: number, stateId: number) => {
    setLoadingCities(true);
    setTimeout(() => {
      setCities(dummyCities[stateId] || []);
      setLoadingCities(false);
    }, 300);
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    if (countryValue) {
      fetchStates(countryValue);
      setStates([]);
      setCities([]);
      onStateChange?.(null);
      onCityChange?.(null);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [countryValue, fetchStates, onStateChange, onCityChange]);

  useEffect(() => {
    if (countryValue && stateValue) {
      fetchCities(countryValue, stateValue);
      setCities([]);
      onCityChange?.(null);
    } else {
      setCities([]);
    }
  }, [countryValue, stateValue, fetchCities, onCityChange]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onCountryChange?.(value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onStateChange?.(value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onCityChange?.(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          {countryLabel}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <select
          value={countryValue ?? ""}
          onChange={handleCountryChange}
          disabled={loadingCountries}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          {stateLabel}
        </label>
        <select
          value={stateValue ?? ""}
          onChange={handleStateChange}
          disabled={!countryValue || loadingStates}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          {cityLabel}
        </label>
        <select
          value={cityValue ?? ""}
          onChange={handleCityChange}
          disabled={!stateValue || loadingCities}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
