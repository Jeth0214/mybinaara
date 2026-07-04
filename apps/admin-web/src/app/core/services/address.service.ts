import { Injectable } from '@angular/core';
import regions from '../data/address/regions_lite.json';
import cities from '../data/address/cities_lite.json';
import districts from '../data/address/districts_lite.json';

export interface RegionData {
  region_id: number;
  code: string;
  name_ar: string;
  name_en: string;
}

export interface CityData {
  city_id: number;
  region_id: number;
  name_ar: string;
  name_en: string;
}

export interface DistrictData {
  district_id: number;
  city_id: number;
  region_id: number;
  name_ar: string;
  name_en: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly _regions: RegionData[] = regions as RegionData[];
  private readonly _cities: CityData[] = cities as CityData[];
  private readonly _districts: DistrictData[] = districts as DistrictData[];

  getRegions(): RegionData[] {
    return this._regions;
  }

  getCities(): CityData[] {
    return this._cities;
  }

  getCitiesByRegion(regionId: number): CityData[] {
    return this._cities.filter(c => c.region_id === regionId);
  }

  getDistrictsByCity(cityId: number): DistrictData[] {
    return this._districts.filter(d => d.city_id === cityId);
  }

  findCityByName(cityName: string): CityData | undefined {
    if (!cityName) return undefined;
    const lower = cityName.toLowerCase().trim();
    const cleanLower = lower.replace(/\b(governorate|city|region)\b/g, '').replace(/[^a-z0-9]/g, '').trim();
    
    return this._cities.find(c => {
      const cLower = c.name_en.toLowerCase().trim();
      const cCleanLower = cLower.replace(/\b(governorate|city|region)\b/g, '').replace(/[^a-z0-9]/g, '').trim();
      return cLower === lower || cCleanLower === cleanLower || c.name_ar === cityName;
    });
  }

  findDistrictByName(cityId: number, districtName: string): DistrictData | undefined {
    if (!districtName) return undefined;
    const normInput = this.normalizeName(districtName);
    
    return this._districts.find(d => {
      if (d.city_id !== cityId) return false;
      const normD = this.normalizeName(d.name_en);
      return normD === normInput || d.name_ar === districtName;
    });
  }

  private normalizeName(s: string): string {
    if (!s) return '';
    return s.toLowerCase()
      .replace(/\bdist(rict)?\b\.?/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }
}

