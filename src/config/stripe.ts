import Stripe from "stripe";
import config from ".";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing in .env");
}

// apiVersion must match a version supported by the installed "stripe" package.
// Check node_modules/stripe/package.json or the Stripe dashboard if this throws a type error.

export const stripe = new Stripe(config.stripe_secret_key, {
  apiVersion: "2026-06-24.dahlia",
});
