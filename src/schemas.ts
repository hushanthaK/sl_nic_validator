import { z } from 'zod';

import type { NICDetails, NICSchemaMode, NICSchemaOptions } from './interfaces.js';
import { getNICDetails, isFullValidNIC, isSimpleValidNIC } from './validator.js';

/**
 * Create a zod schema that validates a Sri Lankan NIC number.
 *
 * @param options - `mode`: 'simple' (format only) or 'full' (default, format + logical checks);
 *   `message`: custom error message (defaults to the validation error reason)
 * @returns zod string schema
 */
export function nicSchema(options: NICSchemaOptions = {}) {
  const { mode = 'full', message } = options;

  return z.string().superRefine((value, ctx) => {
    if (mode === 'simple') {
      if (!isSimpleValidNIC(value)) ctx.addIssue({ code: 'custom', message: message ?? 'NIC format is invalid' });
      return;
    }

    const { isValid, errorReason } = isFullValidNIC(value);
    if (!isValid) ctx.addIssue({ code: 'custom', message: message ?? (errorReason as string) });
  });
}

/** NIC schema with format validation only */
export const nicSimpleSchema = nicSchema({ mode: 'simple' });

/** NIC schema with format and logical validation */
export const nicFullSchema = nicSchema({ mode: 'full' });

/** NIC schema with full validation that outputs the NIC details */
export const nicDetailsSchema = nicFullSchema.transform((value): NICDetails => getNICDetails(value));

/**
 * Create a zod object schema with a single NIC field, e.g. for forms.
 *
 * @param fieldName - name of the NIC field ('nic' by default)
 * @param mode - 'simple' or 'full' ('full' by default)
 * @returns zod object schema
 */
export function createNICObjectSchema<K extends string = 'nic'>(
  fieldName: K = 'nic' as K,
  mode: NICSchemaMode = 'full'
) {
  return z.object({ [fieldName]: nicSchema({ mode }) } as Record<K, ReturnType<typeof nicSchema>>);
}
