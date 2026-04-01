import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getPlanByPriceId, getPropertyLimit } from "@/lib/stripe";

/**
 * Called after successful checkout to sync subscription state.
 * This is a fallback in case the webhook hasn't processed yet.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { familyId: session.user.familyId },
    });

    if (!sub?.stripeCustomerId) {
      return NextResponse.json({ plan: "free" });
    }

    // Fetch latest subscription from Stripe
    const stripeSubs = await stripe.subscriptions.list({
      customer: sub.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    const activeSub = stripeSubs.data[0];
    if (!activeSub) {
      return NextResponse.json({ plan: sub.plan });
    }

    const priceId = activeSub.items.data[0]?.price.id;
    const plan = priceId ? getPlanByPriceId(priceId) : "free";
    const periodEnd = (activeSub as unknown as Record<string, number>)
      .current_period_end;

    // Update database
    await prisma.subscription.update({
      where: { familyId: session.user.familyId },
      data: {
        stripeSubscriptionId: activeSub.id,
        plan,
        propertyLimit: getPropertyLimit(plan),
        status: "active",
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });

    return NextResponse.json({ plan, synced: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    console.error("[Stripe Sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
