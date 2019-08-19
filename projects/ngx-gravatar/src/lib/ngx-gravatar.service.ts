import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';
import { GravatarConfig } from './gravatar-config';
import { GRAVATAR_CONFIG_TOKEN } from './gravatar-config.token';
import { DEFAULT_CONFIG } from './ngx-gravatar.constants';
import { FALLBACK, FallbackType, RATING, RatingType } from './ngx-gravatar.enums';

@Injectable({
  providedIn: 'root'
})
export class NgxGravatarService {
  private defaultConfig: GravatarConfig;

  constructor(@Optional() @Inject(GRAVATAR_CONFIG_TOKEN) private gravatarConfig: GravatarConfig) {
    this.defaultConfig = { ...DEFAULT_CONFIG };

    if (this.gravatarConfig) {
      this.gravatarConfig.rating = this.determineRating(this.gravatarConfig.rating) as RatingType;
      this.gravatarConfig.fallback = this.determineFallback(this.gravatarConfig.fallback) as FallbackType;
      this.defaultConfig = { ...this.defaultConfig, ...this.gravatarConfig };
    }
  }

  /**
   * Return defaultConfig object
   */
  getDefaultConfig() {
    return this.defaultConfig;
  }

  /**
   * Generate gravatar url
   * @param email is a string. If email is not a string, email will be set to empty string "" by default
   * @param md5Hash is a string. If value is given it will take precedence over email.
   * @param size number
   * @param rating string
   * @param fallback string
   * @return gravatar url
   */
  generateGravatarUrl(email: string, md5Hash?: string, size?: number, rating?: string, fallback?: string) {
    let emailHash: string | Int32Array;
    if (md5Hash) {
      emailHash = md5Hash;
    } else {
      try {
        email = email.trim().toLowerCase();
      } catch (e) {
        console.error(`[ngx-gravatar] - Email (${email}) is not a string. Empty string is used as a default email.`);
        email = '';
      }
      emailHash = Md5.hashStr(email);
    }
    size = size ? size : this.defaultConfig.size;
    rating = this.determineRating(rating, this.defaultConfig.rating);
    fallback = this.determineFallback(fallback, this.defaultConfig.fallback);
    const protocol = location.protocol === 'http:'? 'http:' : 'https:';
    return `${protocol}//www.gravatar.com/avatar/${emailHash}?s=${size}&r=${rating}&d=${fallback}`;
  }

  /**
   * Determine gravatar fallback string
   * @param fallback string
   * @param defaultFallback string
   * @return string
   */
  private determineFallback(fallback: string, defaultFallback: string = DEFAULT_CONFIG.fallback): string {
    if (fallback === undefined) {
      return defaultFallback;
    }

    if (FALLBACK[fallback] === undefined) {
      // Complain invalid fallback
      console.error(
        `[ngx-gravatar] - "${fallback}" is invalid gravatar fallback type. ` + `Default fallback "${defaultFallback}" is used.`
      );
      return defaultFallback;
    }

    return fallback;
  }

  /**
   * Determine gravatar rating string
   * @param rating string
   * @param defaultRating string
   * @return string
   */
  private determineRating(rating: string, defaultRating: string = DEFAULT_CONFIG.rating): string {
    if (rating === undefined) {
      return defaultRating;
    }

    if (RATING[rating] === undefined) {
      console.error(`[ngx-gravatar] - "${rating}" is invalid gravatar rating type. ` + `Default rating "${defaultRating}" is used.`);
      return defaultRating;
    }

    return rating;
  }
}
