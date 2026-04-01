import { NextResponse } from "next/server";
import { stripe, getPlanByPriceId, getPropertyLimit } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.error("[Stripe Webhook] Missing signature or secret");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown";
    console.error("[Stripe Webhook] Signature failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[Stripe Webhook] Event:", event.type, event.id);

  try {
    const data = event.data.object as unknown as Record<string, unknown>;

    switch (event.type) {
      case "checkout.session.completed": {
        const familyId = (data.metadata as Record<string, string>)?.familyId;
        const subscriptionRef = data.subscription as string | undefined;
        const customerId = data.customer as string;

        if (!familyId || !subscriptionRef) {
          console.log("[Stripe Webhook] Missing familyId or subscription in checkout");
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subscriptionRef);
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : "free";
        const periodEnd = (sub as unknown as Record<string, number>)
          .current_period_end;

        await prisma.subscription.upsert({
          where: { familyId },
          create: {
            familyId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionRef,
            plan,
            propertyLimit: getPropertyLimit(plan),
            status: "active",
            currentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionRef,
            plan,
            propertyLimit: getPropertyLimit(plan),
            status: "active",
            currentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
          },
        });

        console.log("[Stripe Webhook] Subscription updated:", familyId, plan);
        break;
      }

      case "customer.subscription.updated": {
        const subId = data.id as string;
        const items = data.items as { data: Array<{ price: { id: string } }> };
        const priceId = items?.data?.[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : "free";
        const status = data.status as string;
        const periodEnd = data.current_period_end as number | undefined;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: {
            plan,
            propertyLimit: getPropertyLimit(plan),
            status: status === "active" ? "active" : status,
            currentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
          },
        });

        console.log("[Stripe Webhook] Subscription updated via event:", subId, plan);
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
        console.log("[Stripe Webhook] Subscription cancelled:", subId);
        break;
      }

      case "invoice.payment_failed": {
        const subRef = data.subscription as string | undefined;
        if (subRef) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subRef },
            data: { status: "past_due" },
          });
          console.log("[Stripe Webhook] Payment failed:", subRef);
        }
        break;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    console.error("[Stripe Webhook] Processing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
