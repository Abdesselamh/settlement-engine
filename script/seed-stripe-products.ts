import { getUncachableStripeClient } from "../server/stripeClient";

async function createProducts() {
  const stripe = await getUncachableStripeClient();
  console.log("Creating InstantSettlement.ai products in Stripe...");

  const tiers = [
    {
      name: "Essential",
      description: "Up to $1B Monthly Volume. Standard T+0 Settlement. Basic Compliance Suite.",
      amount: 500000, // $5,000/mo in cents
      metadata: { tier: "essential", volume_limit: "1B" }
    },
    {
      name: "Professional",
      description: "Up to $50B Monthly Volume. Priority Settlement Routing. Advanced AI Fraud Shield. 24/7 Dedicated Support.",
      amount: 2500000, // $25,000/mo in cents
      metadata: { tier: "professional", volume_limit: "50B" }
    },
  ];

  for (const tier of tiers) {
    const existing = await stripe.products.search({ query: `name:'${tier.name}'` });
    if (existing.data.length > 0) {
      console.log(`Product '${tier.name}' already exists: ${existing.data[0].id}`);
      continue;
    }

    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
      metadata: tier.metadata,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.amount,
      currency: "usd",
      recurring: { interval: "month" },
    });

    console.log(`Created '${tier.name}': product=${product.id}, price=${price.id}`);
  }

  console.log("Done! Webhooks will sync to database automatically.");
}

createProducts().catch(console.error);
