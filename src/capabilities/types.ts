import type { Capability } from 'src/provider';
import type { RequestOptions, RequestPayload } from '../types';

export interface GetCapabilitiesPayload extends RequestPayload {}

export type GetCapabilitiesResponse = Capability[];

export type GetCapabilitiesOptions = RequestOptions<
  GetCapabilitiesPayload,
  GetCapabilitiesResponse
>;
