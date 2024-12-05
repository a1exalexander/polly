import { User } from '@supabase/auth-js';
import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success" | 'redirect_to',
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function getUserName(user?: (User & { raw_user_meta_data?: { name?: string, full_name?: string } }) | null) {
    const defaultName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    const providerName = user?.raw_user_meta_data?.name || user?.raw_user_meta_data?.full_name;

    return providerName || defaultName || 'cat';
}


