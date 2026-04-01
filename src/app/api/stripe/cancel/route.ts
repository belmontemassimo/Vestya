import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { familyId: session.user.familyId },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    // Cancel the Stripe subscription immediately
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    // Reset to free in database
    await prisma.subscription.update({
      where: { familyId: session.user.familyId },
      data: {
        plan: "free",
        propertyLimit: 1,
        status: "active",
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Cancel]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
