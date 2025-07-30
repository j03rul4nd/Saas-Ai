import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { addPromptsToLimit } from '@/lib/promptLimits'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      default:
        console.warn(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (err) {
    const error = err as Error
    console.error(`Stripe webhook error: ${error.message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription || !session.customer) return

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  // Actualizar suscripción en la base de datos
  await prisma.user.update({
    where: { stripeCustomerId: session.customer as string },
    data: {
      subscription: {
        upsert: {
          create: mapSubscriptionData(subscription),
          update: mapSubscriptionData(subscription)
        }
      }
    }
  })

  // Obtener el usuario para actualizar sus límites de prompts
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: session.customer as string },
    select: { id: true }
  })

  if (user) {
    try {
      // Añadir 10 prompts adicionales al límite mensual
      await addPromptsToLimit(user.id, 10)
      console.log(`Added 10 prompts to user ${user.id} after successful checkout`)
    } catch (error) {
      console.error(`Error adding prompts to user ${user.id}:`, error)
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0]

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(firstItem.current_period_start * 1000),
      currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
      interval: firstItem.plan.interval,
      planId: firstItem.plan.id
    }
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.delete({
    where: { stripeSubscriptionId: subscription.id }
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  let subscriptionId: string | null = null

  if ('subscription' in invoice && invoice.subscription) {
    subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as Stripe.Subscription)?.id || null
  }

  if (!subscriptionId) {
    console.warn('No subscription Id found in invoice')
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const firstItem = subscription.items.data[0]

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id},
    data: {
      currentPeriodStart: new Date(firstItem.current_period_start * 1000),
      currentPeriodEnd: new Date(firstItem.current_period_end * 1000)
    }
  })

  // Obtener el usuario asociado a esta suscripción
  const subscriptionRecord = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { userId: true }
  })

  if (subscriptionRecord) {
    try {
      // Añadir 10 prompts adicionales al límite mensual por cada pago exitoso
      await addPromptsToLimit(subscriptionRecord.userId, 10)
      console.log(`Added 10 prompts to user ${subscriptionRecord.userId} after successful payment`)
    } catch (error) {
      console.error(`Error adding prompts to user ${subscriptionRecord.userId}:`, error)
    }
  }
}

function mapSubscriptionData(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0]

  return {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(firstItem.current_period_start * 1000),
    currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
    interval: firstItem.plan.interval,
    planId: firstItem.plan.id
  }
}