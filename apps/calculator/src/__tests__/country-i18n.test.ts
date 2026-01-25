import { describe, expect, it } from "vitest";

import { EU_COUNTRY_CODES } from "@/config/eu-countries";
import {
  getAllCountries,
  getCountryData,
  getCountryFlag,
  getEUCountries,
  isEUCountry,
} from "@/lib/i18n/countries";

describe("countries utilities", () => {
  describe("EU_COUNTRY_CODES", () => {
    it("should contain 27 EU member states", () => {
      expect(EU_COUNTRY_CODES).toHaveLength(27);
    });

    it("should contain Germany and France", () => {
      expect(EU_COUNTRY_CODES).toContain("DE");
      expect(EU_COUNTRY_CODES).toContain("FR");
    });
  });

  describe("getCountryFlag", () => {
    it("should return a flag component for valid country code", () => {
      const flag = getCountryFlag("DE");
      expect(flag).toBeDefined();
      expect(typeof flag).toBe("function");
    });

    it("should handle lowercase country codes", () => {
      const flag = getCountryFlag("de");
      expect(flag).toBeDefined();
    });

    it("should return undefined for invalid country code", () => {
      const flag = getCountryFlag("XX");
      expect(flag).toBeUndefined();
    });
  });

  describe("getEUCountries", () => {
    it("should return array of EU countries", () => {
      const countries = getEUCountries("en");
      expect(countries).toHaveLength(27);
      expect(countries[0]).toHaveProperty("code");
      expect(countries[0]).toHaveProperty("name");
      expect(countries[0]).toHaveProperty("nativeName");
      expect(countries[0]).toHaveProperty("Flag");
    });

    it("should return countries sorted alphabetically", () => {
      const countries = getEUCountries("en");
      const names = countries.map((c) => c.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b, "en"));
      expect(names).toEqual(sortedNames);
    });

    it("should work with German locale", () => {
      const countries = getEUCountries("de");
      expect(countries).toHaveLength(27);
      const germany = countries.find((c) => c.code === "DE");
      expect(germany?.name).toBeDefined();
    });
  });

  describe("getCountryData", () => {
    it("should return country data for valid code", () => {
      const germany = getCountryData("DE", "en");
      expect(germany).toBeDefined();
      expect(germany?.code).toBe("DE");
      expect(germany?.name).toBeTruthy();
      expect(germany?.Flag).toBeDefined();
    });

    it("should return undefined for invalid code", () => {
      const invalid = getCountryData("XX", "en");
      expect(invalid).toBeUndefined();
    });

    it("should handle lowercase country codes", () => {
      const france = getCountryData("fr", "en");
      expect(france).toBeDefined();
      expect(france?.code).toBe("FR");
    });
  });

  describe("isEUCountry", () => {
    it("should return true for EU member states", () => {
      expect(isEUCountry("DE")).toBe(true);
      expect(isEUCountry("FR")).toBe(true);
      expect(isEUCountry("ES")).toBe(true);
    });

    it("should return false for non-EU countries", () => {
      expect(isEUCountry("US")).toBe(false);
      expect(isEUCountry("GB")).toBe(false);
      expect(isEUCountry("CH")).toBe(false);
    });

    it("should handle lowercase country codes", () => {
      expect(isEUCountry("de")).toBe(true);
      expect(isEUCountry("us")).toBe(false);
    });
  });

  describe("getAllCountries", () => {
    it("should return more countries than just EU", () => {
      const allCountries = getAllCountries("en");
      expect(allCountries.length).toBeGreaterThan(27);
    });

    it("should include non-EU countries", () => {
      const allCountries = getAllCountries("en");
      const us = allCountries.find((c) => c.code === "US");
      const gb = allCountries.find((c) => c.code === "GB");
      expect(us).toBeDefined();
      expect(gb).toBeDefined();
    });

    it("should return countries sorted alphabetically", () => {
      const countries = getAllCountries("en");
      const names = countries.map((c) => c.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b, "en"));
      expect(names).toEqual(sortedNames);
    });
  });
});
