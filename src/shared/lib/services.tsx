import React, { createContext, useContext } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { HttpClient } from './httpClient';
import { Storage } from './storage';

/**
 * Dependency-injection container. Concrete services (http client, storage) are
 * created once in the composition root and handed down here. Features pull what
 * they need via `useServices()` instead of importing singletons — which keeps
 * them decoupled and trivially testable (inject fakes in a test provider).
 */
export type Services = {
  /** Realtime + (later) auth/DB. Signaling rides on its broadcast channels. */
  supabase: SupabaseClient;
  /** Generic JSON client — reserved for future REST needs (contacts, etc.). */
  http: HttpClient;
  /** Key-value persistence abstraction (in-memory by default). */
  storage: Storage;
};

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children,
}: {
  services: Services;
  children: React.ReactNode;
}) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return services;
}
