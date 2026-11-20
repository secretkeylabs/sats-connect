import {
  getProviderById,
  getProviders,
  getSupportedWallets,
  type Provider,
  type SupportedWallet,
} from '@sats-connect/core';

const BLOCKED_PATH_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);
const PROVIDER_PATH_SEGMENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function isSafeProviderPath(id: string): boolean {
  const segments = id.split('.');
  return (
    segments.length > 0 &&
    segments.every(
      (segment) => PROVIDER_PATH_SEGMENT.test(segment) && !BLOCKED_PATH_SEGMENTS.has(segment)
    )
  );
}

function isValidDiscoveredProvider(provider: unknown): provider is Provider {
  if (!provider || typeof provider !== 'object') return false;
  const candidate = provider as Partial<Provider>;
  if (
    typeof candidate.id !== 'string' ||
    !isSafeProviderPath(candidate.id) ||
    typeof candidate.name !== 'string' ||
    candidate.name.trim().length === 0 ||
    typeof candidate.icon !== 'string' ||
    !candidate.icon.startsWith('data:image/')
  ) {
    return false;
  }
  if (
    candidate.methods !== undefined &&
    (!Array.isArray(candidate.methods) ||
      !candidate.methods.every((method) => typeof method === 'string'))
  ) {
    return false;
  }
  const providerObject = getProviderById(candidate.id) as { request?: unknown } | undefined;
  return typeof providerObject?.request === 'function';
}

export function getSelectableProviders(): SupportedWallet[] {
  const builtIns = getSupportedWallets();
  const knownIds = new Set(builtIns.map((provider) => provider.id));
  const discovered = getProviders()
    .filter(isValidDiscoveredProvider)
    .filter((provider) => {
      if (knownIds.has(provider.id)) return false;
      knownIds.add(provider.id);
      return true;
    })
    .map((provider) => ({ ...provider, isInstalled: true }));
  return [...builtIns, ...discovered];
}
