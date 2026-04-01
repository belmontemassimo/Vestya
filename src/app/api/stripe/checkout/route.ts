import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, type PlanKey, getPlanByPriceId, getPropertyLimit } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = (await request.json()) as { plan: PlanKey };
    const planConfig = PLANS[plan];

    if (!planConfig?.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { familyId: session.user.familyId },
    });

    let customerId: string;

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          familyId: session.user.familyId,
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      subscription = await prisma.subscription.upsert({
        where: { familyId: session.user.familyId },
        create: {
          familyId: session.user.familyId,
          stripeCustomerId: customerId,
          plan: "free",
          propertyLimit: 1,
        },
        update: { stripeCustomerId: customerId },
      });
    }

    // If user already has an active Stripe subscription, update it (swap plan)
    if (subscription.stripeSubscriptionId) {
      const existingSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      if (existingSub.status === "active" || existingSub.status === "trialing") {
        // Swap the price on the existing subscription
        const updated = await stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          {
            items: [
              {
                id: existingSub.items.data[0].id,
                price: planConfig.priceId,
              },
            ],
            proration_behavior: "create_prorations",
          },
        );

        // Update database immediately
        const newPriceId = updated.items.data[0]?.price.id;
        const newPlan = newPriceId ? getPlanByPriceId(newPriceId) : plan;

        await prisma.subscription.update({
          where: { familyId: session.user.familyId },
          data: {
            plan: newPlan,
            propertyLimit: getPropertyLimit(newPlan),
            status: "active",
          },
        });

        // Redirect back to pricing with success
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vestya.net";
        return NextResponse.json({ url: `${appUrl}/en/dashboard?upgraded=true` });
      }
    }

    // No existing subscription — create a new checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vestya.net";
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/en/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/en/pricing`,
      metadata: {
        familyId: session.user.familyId,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
