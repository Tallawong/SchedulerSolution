import { InjectionToken } from '@angular/core';
import type { ColorConfig, TestService } from './test.service';

// Shared tokens for the providers and consumers in the add/edit feature.
// Keep these outside AppModule to avoid a circular dependency.
export const USERS_SERVICE_TOKEN = new InjectionToken<TestService>('USERS_SERVICE_TOKEN');
export const USERS_SERVICE_CONFIG_TOKEN = new InjectionToken<ColorConfig>(
  'USERS_SERVICE_CONFIG_TOKEN',
);
