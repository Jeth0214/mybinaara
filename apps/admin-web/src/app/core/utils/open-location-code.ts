export interface CodeArea {
  latitudeLo: number;
  longitudeLo: number;
  latitudeHi: number;
  longitudeHi: number;
  latitudeCenter: number;
  longitudeCenter: number;
  codeLength: number;
}

export class OpenLocationCode {
  private static readonly CODE_ALPHABET = '23456789CFGHJMPQRVWX';
  private static readonly SEPARATOR = '+';
  private static readonly SEPARATOR_POSITION = 8;
  private static readonly PADDING_CHARACTER = '0';
  private static readonly PAIR_RESOLUTIONS = [20.0, 1.0, 0.05, 0.0025, 0.000125];

  /**
   * Check if a code is valid.
   */
  public static isValid(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false;
    }
    const clean = code.trim().toUpperCase();
    const plusIdx = clean.indexOf(this.SEPARATOR);

    if (plusIdx === -1) {
      return false;
    }
    if (plusIdx !== clean.lastIndexOf(this.SEPARATOR)) {
      return false;
    }
    if (clean.length === 1) {
      return false;
    }
    if (plusIdx > this.SEPARATOR_POSITION || plusIdx % 2 === 1) {
      return false;
    }

    // Check padding
    const padIdx = clean.indexOf(this.PADDING_CHARACTER);
    if (padIdx > -1) {
      if (padIdx === 0) {
        return false;
      }
      const padding = clean.substring(padIdx, plusIdx);
      // Padding must be even length and only contain 0
      if (padding.length % 2 === 1) {
        return false;
      }
      for (let i = 0; i < padding.length; i++) {
        if (padding[i] !== this.PADDING_CHARACTER) {
          return false;
        }
      }
      // Padded codes must end with the separator
      if (clean.charAt(clean.length - 1) !== this.SEPARATOR) {
        return false;
      }
    }

    if (clean.length - plusIdx - 1 === 1) {
      return false;
    }

    const stripped = clean.replace(/\+/g, '').replace(/0/g, '');
    for (let i = 0; i < stripped.length; i++) {
      if (this.CODE_ALPHABET.indexOf(stripped[i]) === -1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a code is a short code.
   */
  public static isShort(code: string): boolean {
    if (!this.isValid(code)) {
      return false;
    }
    const clean = code.trim().toUpperCase();
    const plusIdx = clean.indexOf(this.SEPARATOR);
    return plusIdx >= 0 && plusIdx < this.SEPARATOR_POSITION;
  }

  /**
   * Check if a code is a full code.
   */
  public static isFull(code: string): boolean {
    if (!this.isValid(code)) {
      return false;
    }
    const clean = code.trim().toUpperCase();
    const plusIdx = clean.indexOf(this.SEPARATOR);
    return plusIdx === this.SEPARATOR_POSITION;
  }

  /**
   * Decode a full Open Location Code.
   */
  public static decode(code: string): CodeArea {
    if (!this.isFull(code)) {
      throw new Error('Passed code is not a valid full Open Location Code: ' + code);
    }
    const clean = code.trim().toUpperCase().replace(/\+/g, '').replace(/0/g, '');

    let latLo = -90;
    let lngLo = -180;

    const pairLength = Math.min(clean.length, 10);
    for (let i = 0; i < pairLength / 2; i++) {
      const latVal = this.CODE_ALPHABET.indexOf(clean[i * 2]);
      const lngVal = this.CODE_ALPHABET.indexOf(clean[i * 2 + 1]);
      const res = this.PAIR_RESOLUTIONS[i];
      latLo += latVal * res;
      lngLo += lngVal * res;
    }

    let latHi = latLo + this.PAIR_RESOLUTIONS[pairLength / 2 - 1];
    let lngHi = lngLo + this.PAIR_RESOLUTIONS[pairLength / 2 - 1];

    if (clean.length > 10) {
      // 11th digit grid refinement
      const val = this.CODE_ALPHABET.indexOf(clean[10]);
      const row = Math.floor(val / 4);
      const col = val % 4;
      // Grid resolution: divide the 5th pair resolution by 5 (lat) and 4 (lng)
      const latRes = 0.000125 / 5;
      const lngRes = 0.000125 / 4;

      latLo = latLo + row * latRes;
      latHi = latLo + latRes;
      lngLo = lngLo + col * lngRes;
      lngHi = lngLo + lngRes;
    }

    return {
      latitudeLo: latLo,
      longitudeLo: lngLo,
      latitudeHi: latHi,
      longitudeHi: lngHi,
      latitudeCenter: Math.min(latLo + (latHi - latLo) / 2, 90),
      longitudeCenter: Math.min(lngLo + (lngHi - lngLo) / 2, 180),
      codeLength: code.replace(/\+/g, '').length
    };
  }

  /**
   * Encode coordinates to a full Plus Code.
   */
  public static encode(latitude: number, longitude: number, codeLength = 10): string {
    if (codeLength < 2 || codeLength > 11) {
      throw new Error('Invalid code length');
    }
    // Clip coordinates
    let lat = Math.max(-90, Math.min(90, latitude));
    let lng = longitude;
    while (lng < -180) lng += 360;
    while (lng >= 180) lng -= 360;

    if (lat === 90) {
      lat = 90 - 0.0000000001;
    }

    let latOffset = lat + 90;
    let lngOffset = lng + 180;
    let code = '';

    const pairs = Math.min(codeLength, 10) / 2;
    for (let i = 0; i < pairs; i++) {
      const res = this.PAIR_RESOLUTIONS[i];
      const latVal = Math.floor(latOffset / res);
      const lngVal = Math.floor(lngOffset / res);

      code += this.CODE_ALPHABET[latVal];
      code += this.CODE_ALPHABET[lngVal];

      latOffset -= latVal * res;
      lngOffset -= lngVal * res;
    }

    // Insert separator at index 8
    if (code.length >= 8) {
      code = code.substring(0, 8) + this.SEPARATOR + code.substring(8);
    } else {
      code = code + this.SEPARATOR;
      while (code.length < 8) {
        code += this.PADDING_CHARACTER;
      }
      code += this.SEPARATOR;
    }

    if (codeLength === 11) {
      // 11th digit grid refinement
      const latRes = 0.000125 / 5;
      const lngRes = 0.000125 / 4;
      const row = Math.floor(latOffset / latRes);
      const col = Math.floor(lngOffset / lngRes);
      const val = row * 4 + col;
      code += this.CODE_ALPHABET[val];
    }

    return code;
  }

  /**
   * Recover a full code from a short code relative to reference coordinates.
   */
  public static recoverNearest(shortCode: string, referenceLatitude: number, referenceLongitude: number): string {
    const cleanShort = shortCode.trim().toUpperCase();
    if (!this.isShort(cleanShort)) {
      if (this.isFull(cleanShort)) {
        return cleanShort;
      }
      throw new Error('Passed code is not a valid short code: ' + shortCode);
    }

    const plusIdx = cleanShort.indexOf(this.SEPARATOR);
    const prefixLength = 8 - plusIdx;
    const resolution = this.PAIR_RESOLUTIONS[prefixLength / 2 - 1];

    const refFull = this.encode(referenceLatitude, referenceLongitude);
    const prefix = refFull.substring(0, prefixLength);
    const candidate = prefix + cleanShort;

    const decoded = this.decode(candidate);
    let finalLat = decoded.latitudeCenter;
    let finalLng = decoded.longitudeCenter;

    const latDiff = finalLat - referenceLatitude;
    const lngDiff = finalLng - referenceLongitude;

    if (latDiff > resolution / 2) {
      finalLat -= resolution;
    } else if (latDiff < -resolution / 2) {
      finalLat += resolution;
    }

    if (lngDiff > resolution / 2) {
      finalLng -= resolution;
    } else if (lngDiff < -resolution / 2) {
      finalLng += resolution;
    }

    return this.encode(finalLat, finalLng, decoded.codeLength);
  }
}
