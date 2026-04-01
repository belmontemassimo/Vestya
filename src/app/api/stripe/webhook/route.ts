import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, getPlanByPriceId, getPropertyLimit } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const data = event.data.object as unknown as Record<string, unknown>;

    switch (event.type) {
      case "checkout.session.completed": {
        const familyId = (data.metadata as Record<string, string>)?.familyId;
        const subscriptionRef = data.subscription as string | undefined;
        if (!familyId || !subscriptionRef) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionRef);
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : "free";
        const periodEnd = (sub as unknown as Record<string, number>).current_period_end;

        await prisma.subscription.upsert({
          where: { familyId },
          create: {
            familyId,
            stripeCustomerId: data.customer as string,
            stripeSubscriptionId: subscriptionRef,
            plan,
            propertyLimit: getPropertyLimit(plan),
            status: "active",
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
          update: {
            stripeSubscriptionId: subscriptionRef,
            plan,
            propertyLimit: getPropertyLimit(plan),
            status: "active",
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subId = data.id as string;
        const priceId = ((data.items as Record<string, unknown>)?.data as Array<{ price: { id: string } }>)?.[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : "free";
        const status = data.status as string;
        const periodEnd = data.current_period_end as number | undefined;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: {
            plan,
            propertyLimit: getPropertyLimit(plan),
            status: status === "active" ? "active" : status,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subId = data.id as string;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: {
            plan: "free",
            propertyLimit: 1,
            status: "cancelled",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const subRef = data.subscription as string | undefined;
        if (subRef) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subRef },
            data: { status: "past_due" },
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
