import { z } from 'zod';

export const nameSchema = z.string()
  .min(1, "Name is required")
  .max(253, "Must be under 253 characters")
  .regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, "Must be lowercase alphanumeric or '-'");

export const namespaceSchema = z.string()
  .min(1, "Namespace is required")
  .regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/);

export const replicaSchema = z.coerce.number()
  .min(0, "Replicas must be at least 0")
  .max(1000, "Unreasonably high replica count")
  .int("Must be an integer");

export const imageSchema = z.string()
  .min(1, "Image is required")
  .regex(/^[a-zA-Z0-9.\-/_:]+$/, "Invalid docker image format");
