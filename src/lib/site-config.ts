/** Public storefront configuration. */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "My Store",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || "",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "",
  facebook: process.env.NEXT_PUBLIC_STORE_FACEBOOK || "",
  instagram: process.env.NEXT_PUBLIC_STORE_INSTAGRAM || "",
  twitter: process.env.NEXT_PUBLIC_STORE_TWITTER || "",
};
