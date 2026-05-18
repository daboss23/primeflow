'use client'

// FILE: src/components/workflows/WorkflowsView.tsx

import React, { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, SectionLabel, Pill, StatusDot, tokens } from '@/components/ui'
import { WorkflowCustomerView, type WorkflowCustomer } from './WorkflowCustomerView'

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStatus = 'active' | 'paused' | 'draft'
type Channel = 'Email' | 'SMS' | 'Both'
type TriggerState =
  | 'abandoned_cart'
  | 'failed_payment'
  | 'dormant_buyer'
  | 'repeat_at_risk'
  | 'replenishment'
  | 'engaged_unconverted'

interface Workflow {
  id: string
  name: string
  trigger: TriggerState
  actionType: string
  channels: Channel
  status: WorkflowStatus
  enrolled: number
  converted: number
  revenue: number
  lastUpdated: string
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const BASE_WORKFLOWS: Workflow[] = [
  { id: '1', name: 'Abandoned Cart Recovery',   trigger: 'abandoned_cart',      actionType: 'Multi-step sequence', channels: 'Both',  status: 'active', enrolled: 142, converted: 31, revenue: 4820, lastUpdated: '2h ago'  },
  { id: '2', name: 'Failed Payment Recovery',   trigger: 'failed_payment',      actionType: 'Immediate outreach',  channels: 'Email', status: 'active', enrolled: 38,  converted: 19, revenue: 3140, lastUpdated: '5h ago'  },
  { id: '3', name: 'Dormant Customer Win-Back', trigger: 'dormant_buyer',       actionType: 'Win-back sequence',   channels: 'Both',  status: 'active', enrolled: 204, converted: 27, revenue: 6210, lastUpdated: '1d ago'  },
  { id: '4', name: 'VIP At-Risk Retention',     trigger: 'repeat_at_risk',      actionType: 'VIP concierge flow',  channels: 'Both',  status: 'paused', enrolled: 17,  converted: 9,  revenue: 8940, lastUpdated: '3d ago'  },
  { id: '5', name: 'Replenishment Reminder',    trigger: 'replenishment',       actionType: 'Predictive nudge',    channels: 'SMS',   status: 'active', enrolled: 89,  converted: 44, revenue: 2870, lastUpdated: '6h ago'  },
  { id: '6', name: 'Engaged But Unconverted',   trigger: 'engaged_unconverted', actionType: 'Conversion push',     channels: 'Email', status: 'draft',  enrolled: 0,   converted: 0,  revenue: 0,    lastUpdated: 'Never'   },
]

const TRIGGER_LABELS: Record<TriggerState, string> = {
  abandoned_cart:      'Abandoned Cart',
  failed_payment:      'Failed Payment',
  dormant_buyer:       'Dormant Buyer',
  repeat_at_risk:      'VIP At Risk',
  replenishment:       'Replenishment Due',
  engaged_unconverted: 'Engaged, Not Converted',
}

const TRIGGER_COLORS: Record<TriggerState, string> = {
  abandoned_cart:      '#ff4d6a',
  failed_payment:      '#ff7a3d',
  dormant_buyer:       '#a78bfa',
  repeat_at_risk:      '#ffaa00',
  replenishment:       '#00d4ff',
  engaged_unconverted: '#7c8cff',
}

const AI_AUTO = 'AI Decide' // sentinel value for auto-managed fields

const AI_DEFAULTS: Record<TriggerState, { style: string; channel: string; tone: string; timing: string; objective: string; urgency: string; offer: string }> = {
  abandoned_cart:      { style: 'Recovery',      channel: 'Email + SMS', tone: 'Friendly, direct',   timing: 'After 1 hour',   objective: 'Drive purchase',           urgency: 'Medium', offer: 'Free shipping or discount'  },
  failed_payment:      { style: 'Recovery',      channel: 'Email',       tone: 'Helpful, clear',     timing: 'Immediately',    objective: 'Recover failed payment',   urgency: 'High',   offer: 'Payment link + reassurance'  },
  dormant_buyer:       { style: 'Win-Back',      channel: 'Email + SMS', tone: 'Warm, nostalgic',    timing: 'After 3 days',   objective: 'Re-engage dormant buyer',  urgency: 'Low',    offer: 'Exclusive comeback offer'    },
  repeat_at_risk:      { style: 'VIP Retention', channel: 'Email + SMS', tone: 'Premium, personal',  timing: 'After 24 hours', objective: 'Prevent VIP churn',        urgency: 'High',   offer: 'VIP-only benefit or access'  },
  replenishment:       { style: 'Replenishment', channel: 'SMS',         tone: 'Concise, helpful',   timing: 'After 24 hours', objective: 'Trigger repeat purchase',   urgency: 'Medium', offer: 'Easy reorder link'           },
  engaged_unconverted: { style: 'Reminder',      channel: 'Email',       tone: 'Curious, gentle',    timing: 'After 3 hours',  objective: 'Convert browser to buyer', urgency: 'Low',    offer: 'Social proof + nudge'        },
}

const MESSAGE_PREVIEWS: Record<TriggerState, { subject: string; body: string; sms: string }> = {
  abandoned_cart:      { subject: "Sarah, your cart is waiting 🛒", body: `Hi Sarah,\n\nYou left something behind — and we wanted to make sure you didn't miss out.\n\nYour cart is still saved with the items you loved. We're holding them for you, but they won't last long.\n\nAs a little nudge, we're offering free shipping on your order if you complete it in the next 2 hours.\n\n→ Complete my order\n\nTalk soon,\nThe Team`, sms: "Hey Sarah! You left something in your cart 🛒 We're holding it for you + free shipping for the next 2hrs → [link]" },
  failed_payment:      { subject: "Action needed: Complete your recent order", body: `Hi Sarah,\n\nIt looks like there was a small issue processing your recent payment — don't worry, these things happen.\n\nYour order is still reserved. Just click below to update your payment details and we'll get it sorted straight away.\n\n→ Update payment & complete order\n\nIf you need any help, just reply to this email.\n\nBest,\nThe Team`, sms: "Hi Sarah, we had a small issue with your payment. Your order is still saved — update your details here: [link]" },
  dormant_buyer:       { subject: "We miss you, Sarah — here's something special", body: `Hi Sarah,\n\nIt's been a while since we've seen you, and we wanted to reach out.\n\nA lot has changed since your last visit — new arrivals, new collections, and a special offer we've put together just for customers like you.\n\nWe'd love to have you back.\n\n→ See what's new + claim your offer\n\nHope to see you soon,\nThe Team`, sms: "Hey Sarah, we miss you! We've saved a special offer just for you — come see what's new 👋 [link]" },
  repeat_at_risk:      { subject: "A personal note for you, Sarah", body: `Hi Sarah,\n\nAs one of our most valued customers, we wanted to reach out personally.\n\nWe noticed you haven't visited recently and wanted to check in — and make sure you're getting the full experience you deserve as a VIP.\n\nWe've unlocked early access to our new collection and a private offer just for you.\n\n→ Access your VIP offer\n\nWith gratitude,\nThe Team`, sms: "Hi Sarah, we've unlocked something special for you as a VIP customer. Your exclusive offer is ready 🎁 [link]" },
  replenishment:       { subject: "Time to restock, Sarah?", body: `Hi Sarah,\n\nBased on your last order, you're likely running low on your favourites.\n\nWe've made it easy — your previous order is saved and ready to go. One click to reorder.\n\n→ Reorder in one click\n\nAs always, free shipping on repeat orders over $50.\n\nTake care,\nThe Team`, sms: "Hey Sarah! Time to restock? Your last order is saved and ready to reorder in one tap 👇 [link]" },
  engaged_unconverted: { subject: "Still thinking it over, Sarah?", body: `Hi Sarah,\n\nWe noticed you've been browsing and wanted to reach out — sometimes a little more information is all it takes.\n\nThousands of customers love what you've been looking at, and we'd love to share why.\n\n→ See why customers love it\n\nIf you have any questions at all, just hit reply — we're here.\n\nWarmly,\nThe Team`, sms: "Hey Sarah, still thinking it over? Here's what other customers say about what you've been looking at 👇 [link]" },
}

const FALLBACK_RULES: Record<TriggerState, Array<{ condition: string; action: string; timing: string }>> = {
  abandoned_cart:      [{ condition: 'Not opened', action: 'Resend with stronger subject line', timing: '4 hours later' }, { condition: 'Opened, not clicked', action: 'Send different angle — social proof', timing: '8 hours later' }, { condition: 'Clicked, no purchase', action: 'Follow-up with urgency + offer', timing: '24 hours later' }, { condition: 'No engagement at all', action: 'Switch to SMS', timing: '48 hours later' }],
  failed_payment:      [{ condition: 'Not opened', action: 'Resend — plain text version', timing: '2 hours later' }, { condition: 'Opened, not resolved', action: 'Send payment update reminder', timing: '6 hours later' }, { condition: 'Still unresolved', action: 'Escalate to manual review', timing: '24 hours later' }, { condition: 'Channel fails', action: 'Switch to SMS payment link', timing: 'Immediately' }],
  dormant_buyer:       [{ condition: 'Not opened', action: 'Resend with personalised subject', timing: '3 days later' }, { condition: 'Opened, not clicked', action: 'Send curated product recommendation', timing: '5 days later' }, { condition: 'Clicked, no purchase', action: 'Send final win-back with offer', timing: '7 days later' }, { condition: 'No engagement', action: 'Pause — mark as churned', timing: '14 days later' }],
  repeat_at_risk:      [{ condition: 'Not opened', action: 'Personal SMS from founder', timing: '48 hours later' }, { condition: 'Opened, not clicked', action: 'Send VIP benefits reminder', timing: '3 days later' }, { condition: 'Clicked, no purchase', action: 'Concierge follow-up call flag', timing: '5 days later' }, { condition: 'No engagement', action: 'Escalate to high-value alert', timing: '7 days later' }],
  replenishment:       [{ condition: 'Not opened', action: 'Resend — different time of day', timing: '24 hours later' }, { condition: 'Opened, not clicked', action: 'Send low-stock nudge', timing: '48 hours later' }, { condition: 'No engagement', action: 'Switch to email reminder', timing: '3 days later' }, { condition: 'Channel fails', action: 'Fallback to email', timing: 'Immediately' }],
  engaged_unconverted: [{ condition: 'Not opened', action: 'Resend — curiosity subject line', timing: '6 hours later' }, { condition: 'Opened, not clicked', action: 'Send reviews + social proof', timing: '24 hours later' }, { condition: 'Clicked, no purchase', action: 'Send limited-time offer', timing: '48 hours later' }, { condition: 'No engagement', action: 'Remove from sequence', timing: '7 days later' }],
}

const WORKFLOW_CUSTOMERS: Record<string, WorkflowCustomer[]> = {
  '1': [
    { id: 'c1', name: 'Sarah Chen',    email: 'sarah.chen@email.com',    state: 'Abandoned Cart',    healthScore: 62, totalSpend: 1240, lastPurchase: '18 days ago',  entryReason: 'Cart abandoned with $340 value — no checkout within 1 hour', currentStep: 'Step 3 of 4', workflowStatus: 'active'    },
    { id: 'c2', name: 'James Park',    email: 'james.park@email.com',    state: 'Abandoned Cart',    healthScore: 44, totalSpend: 580,  lastPurchase: '32 days ago',  entryReason: 'Cart abandoned with $89 value — no checkout within 1 hour',  currentStep: 'Step 1 of 4', workflowStatus: 'active'    },
    { id: 'c3', name: 'Mia Torres',    email: 'mia.torres@email.com',    state: 'Converted',         healthScore: 85, totalSpend: 2100, lastPurchase: '2 days ago',   entryReason: 'Cart abandoned with $215 value — recovered via Email',       currentStep: 'Completed',   workflowStatus: 'converted' },
    { id: 'c4', name: 'Daniel Wright', email: 'daniel.wright@email.com', state: 'Abandoned Cart',    healthScore: 38, totalSpend: 310,  lastPurchase: '60 days ago',  entryReason: 'Cart abandoned with $145 value — no checkout within 1 hour', currentStep: 'Step 2 of 4', workflowStatus: 'active'    },
  ],
  '2': [
    { id: 'c5', name: 'Priya Nair',    email: 'priya.nair@email.com',    state: 'Failed Payment',    healthScore: 71, totalSpend: 940,  lastPurchase: '5 days ago',   entryReason: 'Card declined on $310 order — payment gateway timeout',      currentStep: 'Step 1 of 3', workflowStatus: 'active' },
    { id: 'c6', name: 'Tom Ellis',     email: 'tom.ellis@email.com',     state: 'Failed Payment',    healthScore: 55, totalSpend: 450,  lastPurchase: '12 days ago',  entryReason: 'Card declined on $89 order — expired card',                  currentStep: 'Step 2 of 3', workflowStatus: 'active' },
  ],
  '3': [
    { id: 'c7', name: 'Laura Kim',     email: 'laura.kim@email.com',     state: 'Dormant Buyer',     healthScore: 28, totalSpend: 1870, lastPurchase: '94 days ago',  entryReason: 'No purchase in 90+ days — previously high-frequency buyer',  currentStep: 'Step 2 of 4', workflowStatus: 'active' },
    { id: 'c8', name: 'Chris Mendez',  email: 'chris.mendez@email.com',  state: 'Dormant Buyer',     healthScore: 19, totalSpend: 620,  lastPurchase: '112 days ago', entryReason: 'No purchase in 90+ days — low engagement last 60 days',      currentStep: 'Step 3 of 4', workflowStatus: 'active' },
    { id: 'c9', name: 'Anya Osei',     email: 'anya.osei@email.com',     state: 'Dormant Buyer',     healthScore: 35, totalSpend: 3100, lastPurchase: '88 days ago',  entryReason: 'No purchase in 90+ days — VIP tier customer at risk',        currentStep: 'Step 1 of 4', workflowStatus: 'active' },
  ],
  '4': [
    { id: 'c10', name: 'Marcus Liu',   email: 'marcus.liu@email.com',    state: 'VIP At Risk',       healthScore: 52, totalSpend: 8400, lastPurchase: '28 days ago',  entryReason: 'VIP customer — 30-day inactivity after consistent monthly orders', currentStep: 'Step 2 of 3', workflowStatus: 'active' },
  ],
  '5': [
    { id: 'c11', name: 'Zoe Adams',    email: 'zoe.adams@email.com',     state: 'Replenishment Due', healthScore: 78, totalSpend: 2300, lastPurchase: '28 days ago',  entryReason: 'Predicted replenishment window — 30-day average order cycle', currentStep: 'Step 1 of 2', workflowStatus: 'active' },
    { id: 'c12', name: 'Raj Patel',    email: 'raj.patel@email.com',     state: 'Replenishment Due', healthScore: 65, totalSpend: 1100, lastPurchase: '31 days ago',  entryReason: 'Predicted replenishment window — 28-day average order cycle', currentStep: 'Step 1 of 2', workflowStatus: 'active' },
  ],
  '6': [],
}

const COLS = '2fr 1.3fr 1.3fr 0.8fr 0.85fr 0.65fr 0.65fr 0.8fr 0.7fr'

// ─── Workflow Context Descriptions ───────────────────────────────────────────

const WORKFLOW_CONTEXT: Record<TriggerState, {
  headline: string
  description: string
  keySignal: string
  primaryGoal: string
  avoidNote: string
  color: string
}> = {
  abandoned_cart: {
    headline: 'Abandoned Cart Recovery',
    description: 'Customer added items but left before completing checkout. They showed clear purchase intent — the goal is to remove the friction that stopped them.',
    keySignal: 'Cart value + time since abandonment',
    primaryGoal: 'Recover the incomplete checkout',
    avoidNote: 'Avoid sounding desperate — remind value, don\'t beg',
    color: '#ff4d4d',
  },
  failed_payment: {
    headline: 'Failed Payment Recovery',
    description: 'A payment attempt failed — card declined, gateway timeout, or expired card. The customer already decided to buy. Keep it calm, practical, and frictionless.',
    keySignal: 'Order value + payment failure reason',
    primaryGoal: 'Get payment resolved without causing embarrassment',
    avoidNote: 'Never imply blame — make it easy, not stressful',
    color: '#ff8c00',
  },
  dormant_buyer: {
    headline: 'Dormant Customer Win-Back',
    description: 'A previously active customer has gone quiet — no purchase in 90+ days. They already know and trust the brand. Re-engagement requires warmth and a reason to return now.',
    keySignal: 'Days since last purchase + purchase frequency history',
    primaryGoal: 'Reactivate a lapsed customer relationship',
    avoidNote: 'Don\'t feel salesy — reintroduce the brand, not a discount',
    color: '#a78bfa',
  },
  repeat_at_risk: {
    headline: 'VIP At-Risk Retention',
    description: 'A high-value, high-frequency customer is showing early signs of disengagement. These customers deserve a premium, personal experience — not a mass-market email.',
    keySignal: 'LTV tier + recency gap vs. historical purchase cadence',
    primaryGoal: 'Retain a high-value customer before they disengage',
    avoidNote: 'Must feel 1:1 and elevated — mass-market tone will backfire',
    color: '#f59e0b',
  },
  replenishment: {
    headline: 'Replenishment Reminder',
    description: 'Based on purchase history, this customer is likely running low on a consumable product. Timing and convenience are everything — this should feel helpful, not pushy.',
    keySignal: 'Average order cycle + days since last purchase',
    primaryGoal: 'Drive a frictionless repeat purchase at the right moment',
    avoidNote: 'Keep it simple — one CTA, low friction, no hard sell',
    color: '#00d4ff',
  },
  engaged_unconverted: {
    headline: 'Engaged But Unconverted',
    description: 'This customer has been browsing, clicking, or engaging repeatedly — but hasn\'t made a purchase. Something is holding them back. The job is to identify and remove that barrier.',
    keySignal: 'Browsing depth + engagement frequency + product viewed',
    primaryGoal: 'Convert genuine interest into a first purchase',
    avoidNote: 'Don\'t push with urgency too early — build confidence first',
    color: '#8b5cf6',
  },
}

// ─── Dynamic Intelligence Engine ──────────────────────────────────────────────

type StyleFamily = 'Recovery' | 'VIP' | 'WinBack' | 'Default'

function getStyleFamily(style: string): StyleFamily {
  if (style === 'VIP Retention' || style === 'Concierge') return 'VIP'
  if (style === 'Win-Back') return 'WinBack'
  if (style === 'Recovery') return 'Recovery'
  return 'Default'
}

// Subject lines: trigger × urgency
const PREVIEW_SUBJECTS: Record<TriggerState, Record<string, string>> = {
  abandoned_cart: {
    Low:      '{{first_name}}, your cart is still here when you\'re ready',
    Medium:   '{{first_name}}, your cart is waiting 🛒',
    High:     'Last chance — your cart expires soon, {{first_name}}',
    Critical: '⚠️ {{first_name}}, your cart expires in 1 hour',
  },
  failed_payment: {
    Low:      'A quick note about your recent order, {{first_name}}',
    Medium:   'Action needed: Complete your recent order',
    High:     'Urgent: Your order is currently on hold, {{first_name}}',
    Critical: '⚠️ Order at risk — action required immediately, {{first_name}}',
  },
  dormant_buyer: {
    Low:      'We\'ve been thinking about you, {{first_name}}',
    Medium:   'We miss you, {{first_name}} — here\'s something special',
    High:     '{{first_name}}, we\'d love to welcome you back',
    Critical: 'Final chance: Your exclusive offer expires today, {{first_name}}',
  },
  repeat_at_risk: {
    Low:      'A personal note for you, {{first_name}}',
    Medium:   '{{first_name}}, we wanted to reach out personally',
    High:     '{{first_name}}, we want to make sure you\'re taken care of',
    Critical: '{{first_name}} — your VIP status needs attention',
  },
  replenishment: {
    Low:      'Just checking in — time to restock, {{first_name}}?',
    Medium:   'Time to restock, {{first_name}}?',
    High:     'Running low? Let\'s get your order sorted, {{first_name}}',
    Critical: '⚡ Don\'t run out — reorder now, {{first_name}}',
  },
  engaged_unconverted: {
    Low:      'Still thinking it over, {{first_name}}?',
    Medium:   'Still thinking? Here\'s what others are saying, {{first_name}}',
    High:     '{{first_name}}, this offer won\'t last much longer',
    Critical: 'Last chance: This deal ends tonight, {{first_name}}',
  },
}

// Body copy: trigger × style family
const PREVIEW_BODIES: Record<TriggerState, Record<StyleFamily, string>> = {
  abandoned_cart: {
    Recovery: `Hi {{first_name}},\n\nYou left something behind — and we wanted to make sure you didn't miss out.\n\nYour cart is still saved with the items you loved. We're holding them for you, but they won't last long.\n\nAs a little nudge, we're offering free shipping if you complete your order in the next 2 hours.\n\n→ Complete my order\n\nTalk soon,\nThe Team`,
    VIP:      `Hi {{first_name}},\n\nWe noticed you left something in your cart — and as one of our valued customers, we wanted to reach out personally.\n\nYour items are reserved, and we've unlocked complimentary express shipping as a thank-you for your loyalty.\n\n→ Complete my order with VIP shipping\n\nWith care,\nThe Team`,
    WinBack:  `Hi {{first_name}},\n\nWe noticed your cart is still waiting — no rush, but we wanted to make sure everything felt right.\n\nIf anything made you hesitate, we're here to help. Sometimes a quick answer is all it takes.\n\n→ View my cart\n\nWarmly,\nThe Team`,
    Default:  `Hi {{first_name}},\n\nYour cart is still saved and ready for you.\n\nWe're holding your items — just click below when you're ready to complete your order.\n\n→ Complete my order\n\nTalk soon,\nThe Team`,
  },
  failed_payment: {
    Recovery: `Hi {{first_name}},\n\nIt looks like there was a small issue processing your recent payment — don't worry, these things happen.\n\nYour order is still reserved. Just click below to update your payment details and we'll get it sorted straight away.\n\n→ Update payment & complete order\n\nIf you need any help, just reply to this email.\n\nBest,\nThe Team`,
    VIP:      `Hi {{first_name}},\n\nAs a valued customer, we wanted to personally reach out about a small payment hiccup on your recent order.\n\nYour order is fully reserved. One click to update your details and everything will be on its way to you.\n\n→ Resolve & complete my order\n\nWe're here if you need anything,\nThe Team`,
    WinBack:  `Hi {{first_name}},\n\nWe just wanted to reach out about your recent order — there was a small snag with the payment, but it's an easy fix.\n\nWe'd love to get this sorted for you. Your order is still saved and ready.\n\n→ Update my payment\n\nWarmly,\nThe Team`,
    Default:  `Hi {{first_name}},\n\nThere was an issue with your recent payment. Your order is still reserved — update your payment details below to complete it.\n\n→ Update payment details\n\nThe Team`,
  },
  dormant_buyer: {
    Recovery: `Hi {{first_name}},\n\nIt's been a while since we've seen you, and we wanted to reach out.\n\nA lot has changed — new arrivals, new collections, and a special offer put together just for customers like you.\n\nWe'd love to have you back.\n\n→ See what's new + claim your offer\n\nHope to see you soon,\nThe Team`,
    VIP:      `Hi {{first_name}},\n\nWe've missed you — and because of your history with us, we wanted to make your return truly special.\n\nWe've unlocked an exclusive offer: early access to our new collection and a personal welcome-back reward, just for you.\n\n→ Claim your exclusive welcome-back offer\n\nWith warmth,\nThe Team`,
    WinBack:  `Hi {{first_name}},\n\nIt's been a little while, and honestly — we've been thinking about you.\n\nWe know life gets busy. When you're ready, we'd love to welcome you back with something special, just to say we missed you.\n\n→ See your welcome-back offer\n\nWarmly,\nThe Team`,
    Default:  `Hi {{first_name}},\n\nWe noticed it's been a while since your last visit. We've got new products and a special offer waiting for you.\n\n→ Come back and explore\n\nThe Team`,
  },
  repeat_at_risk: {
    Recovery: `Hi {{first_name}},\n\nAs one of our most valued customers, we wanted to reach out personally.\n\nWe noticed you haven't visited recently — we want to make sure you're getting the full experience you deserve as a VIP.\n\nWe've unlocked early access to our new collection and a private offer just for you.\n\n→ Access your VIP offer\n\nWith gratitude,\nThe Team`,
    VIP:      `Hi {{first_name}},\n\nThis is a personal note from our team to you.\n\nYou're one of our most important customers, and we'd never want you to feel anything less than exceptional. We've prepared something exclusive — early access and a private offer available to no one else.\n\n→ View your exclusive VIP access\n\nWith the highest regard,\nThe Team`,
    WinBack:  `Hi {{first_name}},\n\nWe wanted to reach out personally — you mean a lot to us, and we'd hate to think we've let you down.\n\nIf there's anything we can do better, we're genuinely listening. And in the meantime, we've set something special aside for you.\n\n→ See what we've prepared\n\nWith care,\nThe Team`,
    Default:  `Hi {{first_name}},\n\nWe've noticed you haven't visited recently and wanted to reach out. We have an exclusive offer reserved just for you.\n\n→ View your offer\n\nThe Team`,
  },
  replenishment: {
    Recovery: `Hi {{first_name}},\n\nBased on your last order, you're likely running low on your favourites.\n\nWe've made it easy — your previous order is saved and ready to go. One click to reorder.\n\n→ Reorder in one click\n\nAs always, free shipping on repeat orders over $50.\n\nTake care,\nThe Team`,
    VIP:      `Hi {{first_name}},\n\nAs one of our most loyal customers, we like to make sure you never run low.\n\nBased on your order history, it's time to restock — and we've made it effortless. Your last order is saved, your VIP discount is applied, and express delivery is ready.\n\n→ Reorder with VIP priority\n\nWith care,\nThe Team`,
    WinBack:  `Hi {{first_name}},\n\nJust a friendly nudge — based on your usual routine, you might be running low on your favourites.\n\nNo pressure at all — we just wanted to make sure you don't run out. Your last order is ready to go whenever you are.\n\n→ Reorder easily\n\nTake care,\nThe Team`,
    Default:  `Hi {{first_name}},\n\nTime to restock? Based on your last order, your supply may be running low.\n\n→ Reorder now\n\nThe Team`,
  },
  engaged_unconverted: {
    Recovery: `Hi {{first_name}},\n\nWe noticed you've been browsing and wanted to reach out — sometimes a little more information is all it takes.\n\nThousands of customers love what you've been looking at, and we'd love to share why.\n\n→ See why customers love it\n\nIf you have any questions, just hit reply — we're here.\n\nWarmly,\nThe Team`,
    VIP:      `Hi {{first_name}},\n\nWe noticed you've been exploring — great taste, by the way.\n\nOur team has put together a personalised recommendation based on exactly what you've been looking at, along with what our most discerning customers say.\n\n→ Get my personalised recommendation\n\nWarmly,\nThe Team`,
    WinBack:  `Hi {{first_name}},\n\nStill thinking it over? That's completely fine — we just didn't want you to miss out.\n\nHere's what people like you are saying about it. Sometimes hearing from real customers is all it takes.\n\n→ Read what others are saying\n\nWarmly,\nThe Team`,
    Default:  `Hi {{first_name}},\n\nWe noticed you've been browsing. We're here to help if you have any questions.\n\n→ Continue browsing\n\nThe Team`,
  },
}

// SMS: trigger × urgency
const PREVIEW_SMS: Record<TriggerState, Record<string, string>> = {
  abandoned_cart: {
    Low:      `Hey {{first_name}}, your cart is still saved whenever you're ready 🛒 → [link]`,
    Medium:   `Hey {{first_name}}! Your cart is saved + free shipping available for the next 2hrs → [link]`,
    High:     `{{first_name}}, your cart is about to expire! Grab it before it's gone + free shipping → [link]`,
    Critical: `⚠️ LAST CHANCE {{first_name}} — cart expires in 1hr. Complete now: [link]`,
  },
  failed_payment: {
    Low:      `Hi {{first_name}}, just a note — small issue with your payment. Easy fix here: [link]`,
    Medium:   `Hi {{first_name}}, we had a small issue with your payment. Order still saved — update details: [link]`,
    High:     `{{first_name}}, your order is on hold due to a payment issue. Resolve it here: [link]`,
    Critical: `⚠️ {{first_name}}, urgent: order will be cancelled unless payment is updated. Fix now: [link]`,
  },
  dormant_buyer: {
    Low:      `Hey {{first_name}}, been a while! We've saved something special for you → [link]`,
    Medium:   `Hey {{first_name}}, we miss you! We've saved a special offer just for you 👋 [link]`,
    High:     `{{first_name}}, your exclusive welcome-back offer is ready — don't let it expire → [link]`,
    Critical: `⏰ {{first_name}}, your comeback offer expires TODAY. Claim it now: [link]`,
  },
  repeat_at_risk: {
    Low:      `Hi {{first_name}}, we've unlocked something special for you as a VIP 🎁 [link]`,
    Medium:   `Hi {{first_name}}, we've unlocked something special as a VIP customer 🎁 [link]`,
    High:     `{{first_name}}, your VIP offer is ready and waiting. Don't miss it → [link]`,
    Critical: `{{first_name}}, VIP access expires soon. Claim your exclusive offer now: [link]`,
  },
  replenishment: {
    Low:      `Hey {{first_name}}, just a heads up — time to restock? Your last order is ready → [link]`,
    Medium:   `Hey {{first_name}}! Time to restock? Your last order is saved and ready in one tap 👇 [link]`,
    High:     `{{first_name}}, don't run low! Reorder your favourites now — takes 10 seconds → [link]`,
    Critical: `⚡ {{first_name}}, reorder NOW before you run out → [link]`,
  },
  engaged_unconverted: {
    Low:      `Hey {{first_name}}, still thinking? No rush — we're here if you have questions → [link]`,
    Medium:   `Hey {{first_name}}, still thinking it over? Here's what customers say about it 👇 [link]`,
    High:     `{{first_name}}, this offer won't last much longer. See what others are saying → [link]`,
    Critical: `⏰ {{first_name}}, last chance — this deal ends tonight. Don't miss out: [link]`,
  },
}

// ─── computeAIRecs ─────────────────────────────────────────────────────────────

function computeAIRecs(
  trigger: TriggerState,
  style: string,
  urgency: string,
  tone: string,
  offer: string,
  channels: string,
  objective: string
) {
  const base = { ...AI_DEFAULTS[trigger] }
  const rec = { ...base, channel: channels, objective }

  // Style-driven overrides
  if (style === 'VIP Retention' || style === 'Concierge') {
    rec.tone   = 'Premium, personal'
    rec.offer  = 'VIP-only benefit or access'
    rec.timing = trigger === 'replenishment' ? 'Before predicted run-out' : rec.timing
  } else if (style === 'Win-Back') {
    rec.tone   = 'Warm, nostalgic'
    rec.offer  = 'Exclusive comeback offer'
    rec.timing = 'After 3 days'
    rec.urgency = 'Low'
  } else if (style === 'Reminder') {
    rec.tone    = 'Concise, helpful'
    rec.urgency = 'Low'
    rec.timing  = base.timing === 'Immediately' ? 'After 3 hours' : base.timing
  } else if (style === 'Replenishment') {
    rec.tone  = 'Concise, helpful'
    rec.offer = 'Easy reorder link'
  }

  // Urgency-driven overrides
  if (urgency === 'Critical') {
    rec.timing  = 'Immediately'
    rec.urgency = 'Critical'
    if (!rec.offer.includes('urgent') && !rec.offer.includes('time-gate')) {
      rec.offer = rec.offer + ' + time-gate'
    }
  } else if (urgency === 'High') {
    rec.timing = rec.timing === 'After 3 days' ? 'After 24 hours' : rec.timing
  } else if (urgency === 'Low') {
    rec.timing = rec.timing === 'Immediately' ? 'After 3 hours' : rec.timing
  }

  return rec
}

// ─── computeInsights ──────────────────────────────────────────────────────────

function computeInsights(
  trigger: TriggerState,
  style: string,
  urgency: string,
  tone: string,
  offer: string,
  channels: string
): Array<{ type: 'positive' | 'warning' | 'tip'; text: string }> {
  const insights: Array<{ type: 'positive' | 'warning' | 'tip'; text: string }> = []

  // Channel vs urgency
  if ((urgency === 'High' || urgency === 'Critical') && channels === 'Email') {
    insights.push({ type: 'warning', text: `High urgency via email-only risks low open rates — adding SMS typically lifts recovery by 28%` })
  }
  if (urgency === 'Low' && channels.includes('SMS')) {
    insights.push({ type: 'tip', text: `Low urgency via SMS can feel intrusive — Email-first is recommended for softer outreach` })
  }

  // Style vs trigger alignment
  if (style === 'VIP Retention' && trigger === 'repeat_at_risk') {
    insights.push({ type: 'positive', text: `VIP Retention is highly aligned with this trigger — strong strategic match` })
  } else if (style === 'Recovery' && trigger === 'failed_payment') {
    insights.push({ type: 'positive', text: `Recovery style is the optimal choice for failed payment flows — direct and effective` })
  } else if (style === 'Win-Back' && trigger === 'dormant_buyer') {
    insights.push({ type: 'positive', text: `Win-Back is the recommended style for dormant buyer reactivation — warm and considered` })
  } else if (style === 'Replenishment' && trigger === 'replenishment') {
    insights.push({ type: 'positive', text: `Replenishment style perfectly matches this trigger — highest conversion alignment` })
  } else if (style === 'Win-Back' && trigger === 'failed_payment') {
    insights.push({ type: 'warning', text: `Win-Back style is low-urgency by design — Recovery or Concierge performs better for payment flows` })
  } else if (style === 'Recovery' && trigger === 'dormant_buyer') {
    insights.push({ type: 'tip', text: `Recovery style can feel abrupt for dormant customers — Win-Back creates a warmer re-entry` })
  } else if (style === 'VIP Retention' && trigger === 'abandoned_cart') {
    insights.push({ type: 'tip', text: `VIP style on cart recovery works best for carts over $150 — consider segmenting by cart value` })
  }

  // Tone vs offer conflict
  if (tone === 'Premium, personal' && offer.toLowerCase().includes('discount')) {
    insights.push({ type: 'warning', text: `Discount offers can feel off-brand with a premium tone — VIP access or early release aligns better` })
  }
  if (tone === 'Warm, nostalgic' && urgency === 'Critical') {
    insights.push({ type: 'warning', text: `Warm nostalgic tone may undercut critical urgency — consider a more direct voice` })
  }
  if (tone === 'Concise, helpful' && style === 'VIP Retention') {
    insights.push({ type: 'tip', text: `Concise tone can feel brief for VIP customers who expect personalised outreach` })
  }

  // Positive defaults
  if (insights.length === 0) {
    const tl = TRIGGER_LABELS[trigger]
    insights.push({ type: 'positive', text: `${style} style is a solid strategic fit for ${tl} flows` })
  }

  return insights.slice(0, 2)
}

// ─── generateFallback ─────────────────────────────────────────────────────────

function generateFallback(
  trigger: TriggerState,
  urgency: string,
  channels: string,
  style: string
): Array<{ condition: string; action: string; timing: string }> {
  const fast   = urgency === 'High' || urgency === 'Critical'
  const hasEmail = channels.includes('Email') || channels === 'Both'
  const hasSMS   = channels.includes('SMS')   || channels === 'Both'
  const isVIP    = style === 'VIP Retention' || style === 'Concierge'

  if (trigger === 'abandoned_cart') return [
    { condition: 'Not opened',          action: urgency === 'Critical' ? 'Resend immediately — stronger subject + emoji urgency' : 'Resend with stronger subject line', timing: fast ? '2 hours later' : '4 hours later' },
    { condition: 'Opened, not clicked', action: isVIP ? 'Send personalised concierge follow-up' : 'Send social proof angle — what others bought', timing: fast ? '4 hours later' : '8 hours later' },
    { condition: 'Clicked, no purchase', action: urgency === 'Critical' ? 'Flash discount — 30min time-gate' : urgency === 'High' ? 'Send urgency nudge with countdown offer' : 'Follow-up with gentle offer angle', timing: fast ? '12 hours later' : '24 hours later' },
    { condition: 'No engagement at all', action: hasSMS && hasEmail ? 'Switch channel — send SMS with shorter message' : 'Remove from sequence — suppress for 14 days', timing: fast ? '24 hours later' : '48 hours later' },
  ]

  if (trigger === 'failed_payment') return [
    { condition: 'Not opened',          action: 'Resend — plain text, no images, new subject', timing: fast ? '1 hour later' : '2 hours later' },
    { condition: 'Opened, not resolved', action: hasSMS ? 'Send SMS payment link — short and direct' : 'Resend payment reminder with updated CTA', timing: fast ? '3 hours later' : '6 hours later' },
    { condition: 'Still unresolved',    action: isVIP ? 'Escalate to human concierge outreach' : 'Flag for manual review — high-priority queue', timing: fast ? '12 hours later' : '24 hours later' },
    { condition: 'Channel fails',       action: hasSMS ? 'Fallback to SMS payment link immediately' : 'Flag for manual phone follow-up', timing: 'Immediately' },
  ]

  if (trigger === 'dormant_buyer') return [
    { condition: 'Not opened',          action: 'Resend with personalised subject — include first name + product name', timing: fast ? '2 days later' : '3 days later' },
    { condition: 'Opened, not clicked', action: style === 'VIP Retention' ? 'Send curated VIP-only product recommendation' : 'Send curated product recommendation', timing: fast ? '3 days later' : '5 days later' },
    { condition: 'Clicked, no purchase', action: urgency === 'Critical' ? 'Send final win-back — expiring exclusive offer' : 'Send final win-back offer with soft deadline', timing: fast ? '5 days later' : '7 days later' },
    { condition: 'No engagement',       action: 'Pause sequence — mark as churned, flag for 30-day re-evaluation', timing: fast ? '10 days later' : '14 days later' },
  ]

  if (trigger === 'repeat_at_risk') return [
    { condition: 'Not opened',          action: isVIP && hasSMS ? 'Personal SMS — warm, direct, from founder name' : 'Resend with highly personalised subject line', timing: fast ? '24 hours later' : '48 hours later' },
    { condition: 'Opened, not clicked', action: 'Send VIP benefits reminder — highlight exclusive access and perks', timing: fast ? '2 days later' : '3 days later' },
    { condition: 'Clicked, no purchase', action: isVIP ? 'Flag for personal concierge follow-up call' : 'Send concierge offer — 1:1 support prompt', timing: fast ? '3 days later' : '5 days later' },
    { condition: 'No engagement',       action: 'Escalate to high-value customer alert — notify account manager', timing: fast ? '5 days later' : '7 days later' },
  ]

  if (trigger === 'replenishment') return [
    { condition: 'Not opened',          action: 'Resend at a different time of day — test morning vs evening', timing: fast ? '12 hours later' : '24 hours later' },
    { condition: 'Opened, not clicked', action: urgency === 'Critical' ? 'Send low-stock urgency alert — scarcity trigger' : 'Send low-stock reminder with easy reorder CTA', timing: fast ? '24 hours later' : '48 hours later' },
    { condition: 'No engagement',       action: hasEmail && hasSMS ? 'Switch channel — send ' + (channels === 'SMS' ? 'email' : 'SMS') + ' reminder' : 'Pause — remove from replenishment sequence', timing: fast ? '2 days later' : '3 days later' },
    { condition: 'Channel fails',       action: 'Automatic fallback to ' + (hasSMS ? 'email' : 'SMS'), timing: 'Immediately' },
  ]

  if (trigger === 'engaged_unconverted') return [
    { condition: 'Not opened',          action: urgency === 'Critical' ? 'Resend — deadline-led subject, strong urgency' : 'Resend — curiosity-led subject, A/B test emoji vs no emoji', timing: fast ? '3 hours later' : '6 hours later' },
    { condition: 'Opened, not clicked', action: 'Send customer reviews + social proof — testimonials and star ratings', timing: fast ? '12 hours later' : '24 hours later' },
    { condition: 'Clicked, no purchase', action: urgency === 'High' || urgency === 'Critical' ? 'Send time-gated discount — 4-hour window' : 'Send limited-time offer with soft countdown', timing: fast ? '24 hours later' : '48 hours later' },
    { condition: 'No engagement',       action: 'Remove from sequence — suppress for 30 days, re-enter if re-engages', timing: fast ? '5 days later' : '7 days later' },
  ]

  return FALLBACK_RULES[trigger]
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: WorkflowStatus }) {
  const tone = (status === 'active' ? 'success' : status === 'paused' ? 'warn' : 'neutral') as 'success' | 'warn' | 'neutral'
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <Pill tone={tone}>
      <StatusDot tone={tone} size={5} glow={status === 'active'} />
      {label}
    </Pill>
  )
}

function ChannelBadge({ channel }: { channel: Channel }) {
  const tone = (channel === 'SMS' ? 'violet' : 'accent') as 'violet' | 'accent'
  return <Pill tone={tone}>{channel}</Pill>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-white/45 mb-2.5">{children}</label>
}

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide"
      style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.15)' }}>
      <svg width="8" height="8" fill="none" viewBox="0 0 16 16"><path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="currentColor"/></svg>
      AI
    </span>
  )
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────

function WorkflowActionsMenu({
  workflow, onEdit, onTogglePause, onDuplicate, onArchive, onClose,
}: {
  workflow: Workflow
  onEdit: () => void
  onTogglePause: () => void
  onDuplicate: () => void
  onArchive: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose])

  const isPaused = workflow.status === 'paused'
  const items = [
    {
      label: 'Edit',
      action: onEdit,
      color: 'rgba(255,255,255,0.55)',
      icon: <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>,
    },
    {
      label: isPaused ? 'Resume' : 'Pause',
      action: onTogglePause,
      color: isPaused ? '#00e676' : '#f59e0b',
      icon: isPaused
        ? <path d="M4 2l10 6-10 6V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        : <><rect x="3" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/></>,
    },
    {
      label: 'Duplicate',
      action: onDuplicate,
      color: 'rgba(255,255,255,0.55)',
      icon: <><rect x="6" y="2" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 6v8a2 2 0 002 2h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
    },
    {
      label: 'Archive',
      action: onArchive,
      color: 'rgba(255,80,80,0.75)',
      icon: <><path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v2H2V4z" stroke="currentColor" strokeWidth="1.3"/><path d="M2 6h12v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z" stroke="currentColor" strokeWidth="1.3"/><path d="M6 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
    },
  ]

  return (
    <div ref={ref} className="absolute right-0 top-8 z-50 w-40 rounded-xl overflow-hidden py-1"
      style={{ background: '#10101f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
      {items.map((item) => (
        <button key={item.label} onClick={() => { item.action(); onClose() }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-left transition-all hover:bg-white/[0.05]"
          style={{ color: item.color }}>
          <svg width="11" height="11" fill="none" viewBox="0 0 16 16">{item.icon}</svg>
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ─── Enrolled Customer List ───────────────────────────────────────────────────

function WorkflowCustomerListView({
  workflow, customers, onBack, onSelectCustomer,
}: {
  workflow: Workflow
  customers: WorkflowCustomer[]
  onBack: () => void
  onSelectCustomer: (c: WorkflowCustomer) => void
}) {
  const tc = TRIGGER_COLORS[workflow.trigger]
  return (
    <div>
      <div className="pl-7 pr-8 py-9 w-full">

        {/* Breadcrumb */}
        <button onClick={onBack} className="flex items-center gap-1.5 mb-5 transition-colors group" style={{ color: tokens.textTertiary }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16" className="transition-transform group-hover:-translate-x-0.5">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[12px] font-medium group-hover:text-white/85 transition-colors">Back to Workflows</span>
        </button>

        {/* Header */}
        <PageHeader
          eyebrow={TRIGGER_LABELS[workflow.trigger]}
          title={workflow.name}
          subtitle={`${workflow.enrolled} enrolled${workflow.enrolled > 0 ? ` · ${((workflow.converted / workflow.enrolled) * 100).toFixed(0)}% conversion` : ''}`}
          actions={<StatusPill status={workflow.status} />}
        />

        {/* Customer table */}
        <div className="rounded-[14px] overflow-hidden" style={{ border: `1px solid ${tokens.borderSubtle}`, background: tokens.surface }}>
          <div className="grid px-6 py-3.5" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', borderBottom: `1px solid ${tokens.borderSubtle}`, background: 'rgba(255,255,255,0.015)' }}>
            {['Customer', 'State', 'Health', 'Spend', 'Step', 'Status'].map((h) => (
              <span key={h} className="eyebrow" style={{ fontSize: 10.5 }}>{h}</span>
            ))}
          </div>

          {customers.length === 0 && (
            <div className="px-6 py-16 text-center text-[13px]" style={{ color: tokens.textMuted }}>No customers enrolled in this workflow yet.</div>
          )}

          {customers.map((c, i) => {
            const hColor = c.healthScore >= 70 ? '#3ddc97' : c.healthScore >= 45 ? '#ffaa00' : '#ff4d6a'
            const ws = c.workflowStatus
            const wsTone = (ws === 'converted' ? 'success' : ws === 'exited' ? 'neutral' : 'accent') as 'success'|'neutral'|'accent'
            return (
              <div key={c.id} className="grid px-6 py-3.5 cursor-pointer wf-row"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', borderBottom: i < customers.length - 1 ? `1px solid ${tokens.borderSubtle}` : undefined }}
                onClick={() => onSelectCustomer(c)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[10.5px] font-semibold flex-shrink-0"
                    style={{ background: `${tc}14`, color: tc, border: `1px solid ${tc}28` }}>
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium" style={{ color: tokens.textPrimary }}>{c.name}</div>
                    <div className="text-[11.5px] mt-0.5 truncate" style={{ color: tokens.textMuted }}>{c.email}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center h-5 px-2 rounded-[6px] text-[10.5px] font-medium" style={{ color: tc, background: `${tc}14`, border: `1px solid ${tc}28` }}>
                    {c.state}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="metric-num text-[13.5px]" style={{ color: hColor }}>{c.healthScore}</span>
                </div>
                <div className="flex items-center">
                  <span className="metric-num text-[13.5px]" style={{ color: tokens.textPrimary }}>${c.totalSpend.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[12px]" style={{ color: tokens.textSecondary }}>{c.currentStep}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Pill tone={wsTone}>
                    {ws === 'converted' ? 'Converted' : ws === 'exited' ? 'Exited' : 'Active'}
                  </Pill>
                  <svg width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ color: tokens.textMuted }}>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── 4-Step Centered Modal (Dynamic Intelligence) ─────────────────────────────

function NewWorkflowModal({ onClose, onLaunch }: { onClose: () => void; onLaunch: (wf: Workflow) => void }) {
  const [step,          setStep]          = useState(1)
  const [launched,      setLaunched]      = useState(false)
  const [workflowName,  setWorkflowName]  = useState('')
  const [trigger,       setTrigger]       = useState<TriggerState>('abandoned_cart')
  const [channels,      setChannels]      = useState<string>('Email + SMS')
  const [abTest,        setAbTest]        = useState(false)
  const [activePreview, setActivePreview] = useState<'email' | 'sms'>('email')

  // Step 2: strategy fields — default to AI_AUTO (let AI decide)
  const [msgStyle,   setMsgStyle]   = useState(AI_AUTO)
  const [urgency,    setUrgency]    = useState(AI_AUTO)
  const [objective,  setObjective]  = useState(AI_AUTO)
  const [offerAngle, setOfferAngle] = useState(AI_AUTO)
  const [tone,       setTone]       = useState(AI_AUTO)
  const [personalization, setPersonalization] = useState<string[]>(['First name', 'Last order date'])

  // Animation key — bumps when any strategy input changes
  const [recKey,       setRecKey]       = useState(0)
  const [showUpdated,  setShowUpdated]  = useState(false)
  const isFirstRender = useRef(true)

  // When trigger changes → reset all step 2 fields to AI_AUTO (re-let AI decide)
  useEffect(() => {
    setMsgStyle(AI_AUTO)
    setUrgency(AI_AUTO)
    setObjective(AI_AUTO)
    setOfferAngle(AI_AUTO)
    setTone(AI_AUTO)
    setRecKey((k: number) => k + 1)
  }, [trigger])

  // Animate rec panel when any strategy field changes
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setRecKey((k: number) => k + 1)
    setShowUpdated(true)
    const t = setTimeout(() => setShowUpdated(false), 1800)
    return () => clearTimeout(t)
  }, [msgStyle, urgency, objective, offerAngle, tone, channels])

  // Derived computed values
  const baseDefault   = AI_DEFAULTS[trigger as TriggerState]
  const aiRecs        = computeAIRecs(trigger, msgStyle, urgency, tone, offerAngle, channels, objective)
  const insights      = computeInsights(trigger, msgStyle, urgency, tone, offerAngle, channels)
  const styleFamily   = getStyleFamily(msgStyle)
  const previewBody   = PREVIEW_BODIES[trigger as TriggerState][styleFamily]
  const previewSubject = PREVIEW_SUBJECTS[trigger as TriggerState][urgency] ?? PREVIEW_SUBJECTS[trigger as TriggerState]['Medium']
  const previewSMS    = PREVIEW_SMS[trigger as TriggerState][urgency] ?? PREVIEW_SMS[trigger as TriggerState]['Medium']
  const fallback      = generateFallback(trigger, urgency, channels, msgStyle)

  // Check if a field is overriding the AI default
  function isOverride(currentVal: string, baseVal: string) {
    return currentVal.trim() !== baseVal.trim()
  }

  const STEPS = [{ n: 1, label: 'Setup' }, { n: 2, label: 'Strategy' }, { n: 3, label: 'Preview' }, { n: 4, label: 'Fallback' }]

  function handleLaunch() {
    const newWf: Workflow = {
      id: `${Date.now()}`,
      name: workflowName.trim() || `${TRIGGER_LABELS[trigger as TriggerState]} Recovery`,
      trigger: trigger as TriggerState,
      actionType: msgStyle === AI_AUTO ? (AI_DEFAULTS[trigger as TriggerState]?.style ?? 'Multi-step sequence') : msgStyle,
      channels: (channels as Channel) ?? 'Email',
      status: 'active',
      enrolled: 0,
      converted: 0,
      revenue: 0,
      lastUpdated: 'Just now',
    }
    onLaunch(newWf)
    setLaunched(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && onClose()}>
      <div className="w-[780px] max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#09091b', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 100px rgba(0,0,0,0.85)' }}>

        {/* Header */}
        <div className="flex-shrink-0 px-9 pt-8 pb-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #00d4ff, #7c3aed)' }} />
                <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/35">New Workflow</span>
              </div>
              <h2 className="text-[21px] font-semibold text-white">Configure Recovery Workflow</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all mt-1">
              <svg width="11" height="11" fill="none" viewBox="0 0 16 16"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <button onClick={() => setStep(s.n)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
                  style={step === s.n ? { background: 'rgba(0,212,255,0.08)' } : {}}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={step === s.n ? { background: '#00d4ff', color: '#000' } : s.n < step ? { background: 'rgba(0,212,255,0.2)', color: '#00d4ff' } : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>
                    {s.n < step ? '✓' : s.n}
                  </div>
                  <span className="text-[12px] font-medium whitespace-nowrap"
                    style={{ color: step === s.n ? '#00d4ff' : s.n < step ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)' }}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && <div className="w-5 h-px mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-9 py-8">

          {/* ── SUCCESS STATE ── */}
          {launched && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M5 12l5 5L19 7" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-[18px] font-semibold text-white mb-2">New Workflow Has Been Created</div>
              <div className="text-[13px] text-white/40 mb-8 max-w-[320px] leading-relaxed">
                Your workflow is now active and will begin enrolling customers automatically.
              </div>
              <button onClick={onClose}
                className="px-8 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(0,230,118,0.13)', color: '#00e676', border: '1px solid rgba(0,230,118,0.25)' }}>
                OK
              </button>
            </div>
          )}

          {/* ── STEP 1: Setup + Live AI Recommendations ── */}
          {!launched && step === 1 && (
            <div className="space-y-5">
              <div>
                <FieldLabel>Workflow Name</FieldLabel>
                <input type="text" value={workflowName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)} placeholder="e.g. Abandoned Cart Recovery — High Value" className="w-full mfi" />
              </div>
              <div>
                <FieldLabel>Trigger State</FieldLabel>
                <select className="w-full mfi" value={trigger} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTrigger(e.target.value as TriggerState)}>
                  <option value="abandoned_cart">Abandoned Cart</option>
                  <option value="failed_payment">Failed Payment</option>
                  <option value="dormant_buyer">Dormant Buyer</option>
                  <option value="repeat_at_risk">VIP At Risk</option>
                  <option value="replenishment">Replenishment Due</option>
                  <option value="engaged_unconverted">Engaged, Not Converted</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Trigger Condition</FieldLabel>
                  <select className="w-full mfi">
                    <option>Any customer matching state</option>
                    <option>Health score below 40</option>
                    <option>Health score below 60</option>
                    <option>LTV above $500</option>
                    <option>LTV above $1,000</option>
                    <option>No purchase in 60+ days</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Channels</FieldLabel>
                  <select className="w-full mfi" value={channels} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChannels(e.target.value)}>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>Email + SMS</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Approval Mode</FieldLabel>
                  <select className="w-full mfi">
                    <option>Autonomous (AI sends automatically)</option>
                    <option>Review before send</option>
                    <option>Review high-LTV only</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>A/B Testing</FieldLabel>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl h-9" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[12px] text-white/45">{abTest ? 'Enabled' : 'Disabled'}</span>
                    <button onClick={() => setAbTest(!abTest)} className="relative w-8 h-4 rounded-full transition-all duration-200 flex-shrink-0"
                      style={{ background: abTest ? 'rgba(0,212,255,0.22)' : 'rgba(255,255,255,0.07)', border: abTest ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                        style={{ left: abTest ? 'calc(100% - 14px)' : '2px', background: abTest ? '#00d4ff' : 'rgba(255,255,255,0.28)' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Live AI Recommendations — fires immediately from trigger + channels ── */}
              <div key={recKey} className="rec-panel rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.14)' }}>

                {/* Panel header */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(0,212,255,0.05)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 16 16"><path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="#00d4ff"/></svg>
                  <span className="text-[11px] font-semibold text-[#00d4ff]">AI Recommendations</span>
                  <span className="text-[10px] text-white/22 ml-1">— live · based on {TRIGGER_LABELS[trigger as TriggerState]}</span>
                  {showUpdated && (
                    <span className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-[#00d4ff]/55 rec-updated">
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1110.83-3.5M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Updated
                    </span>
                  )}
                </div>

                {/* Workflow context — headline + avoid note */}
                {(() => {
                  const ctx = WORKFLOW_CONTEXT[trigger as TriggerState]
                  return (
                    <div className="px-4 pt-3 pb-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ctx.color, boxShadow: `0 0 4px ${ctx.color}` }} />
                        <span className="text-[12px] font-semibold" style={{ color: ctx.color }}>{ctx.headline}</span>
                      </div>
                      <p className="text-[12px] text-white/42 leading-relaxed mb-3">{ctx.description}</p>
                    </div>
                  )
                })()}

                {/* 6-cell recommendation grid */}
                <div className="grid grid-cols-3 gap-2 px-4 pb-3">
                  {[
                    { label: 'Style',     rec: aiRecs.style   },
                    { label: 'Channel',   rec: aiRecs.channel },
                    { label: 'Tone',      rec: aiRecs.tone    },
                    { label: 'Timing',    rec: aiRecs.timing  },
                    { label: 'Urgency',   rec: aiRecs.urgency },
                    { label: 'Offer',     rec: aiRecs.offer   },
                  ].map(({ label, rec }) => (
                    <div key={label} className="px-2.5 py-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid transparent' }}>
                      <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'rgba(0,212,255,0.5)' }}>{label}</div>
                      <div className="text-[12px] font-medium text-white/80">{rec}</div>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                  <div className="space-y-1.5 px-4 pb-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {insights.map((ins, i) => {
                      const cfg = {
                        positive: { icon: '✓', color: '#00e676', bg: 'rgba(0,230,118,0.06)' },
                        warning:  { icon: '⚠', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
                        tip:      { icon: '→', color: '#00d4ff', bg: 'rgba(0,212,255,0.05)'  },
                      }[ins.type]
                      return (
                        <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: cfg.bg }}>
                          <span className="text-[11px] font-bold flex-shrink-0 mt-0.5" style={{ color: cfg.color }}>{cfg.icon}</span>
                          <span className="text-[11px] text-white/50 leading-relaxed">{ins.text}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="px-4 pb-3">
                  <p className="text-[10px] text-white/20">These defaults will be applied to Step 2 — refine any field or let the AI decide.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Message Strategy Refinement ── */}
          {!launched && step === 2 && (
            <div className="space-y-5">

              {/* Refinement header */}
              <div className="flex items-center gap-3.5 px-5 py-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="#00d4ff"/></svg>
                <div>
                  <div className="text-[13px] font-semibold text-white/80">Refine AI Strategy</div>
                  <div className="text-[12px] text-white/35 mt-1 leading-relaxed">AI recommendations from Step 1 are pre-filled. Override any field or leave as <span style={{ color: '#00d4ff' }}>AI Decide</span> to let the system adapt per-customer.</div>
                </div>
              </div>

              {/* Strategy fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FieldLabel>Message Style</FieldLabel>
                    <AiBadge />
                    {isOverride(msgStyle, AI_AUTO) && isOverride(msgStyle, baseDefault.style) && (
                      <span className="text-[8px] px-1 rounded font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.7)' }}>custom</span>
                    )}
                  </div>
                  <select className="w-full mfi" value={msgStyle} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMsgStyle(e.target.value)}>
                    <option value={AI_AUTO}>✦ AI Decide</option>
                    <option>Reminder</option>
                    <option>Recovery</option>
                    <option>Concierge</option>
                    <option>Replenishment</option>
                    <option>VIP Retention</option>
                    <option>Win-Back</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FieldLabel>Urgency Level</FieldLabel>
                    <AiBadge />
                    {isOverride(urgency, AI_AUTO) && isOverride(urgency, baseDefault.urgency) && (
                      <span className="text-[8px] px-1 rounded font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.7)' }}>custom</span>
                    )}
                  </div>
                  <select className="w-full mfi" value={urgency} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUrgency(e.target.value)}>
                    <option value={AI_AUTO}>✦ AI Decide</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FieldLabel>Message Objective</FieldLabel>
                  <AiBadge />
                  {isOverride(objective, AI_AUTO) && isOverride(objective, baseDefault.objective) && (
                    <span className="text-[8px] px-1 rounded font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.7)' }}>custom</span>
                  )}
                </div>
                <select className="w-full mfi" value={objective} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setObjective(e.target.value)}>
                  <option value={AI_AUTO}>✦ AI Decide</option>
                  <option>Drive purchase</option>
                  <option>Recover failed payment</option>
                  <option>Re-engage dormant customer</option>
                  <option>Prevent churn</option>
                  <option>Trigger replenishment order</option>
                  <option>Convert browser to buyer</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FieldLabel>Offer Angle</FieldLabel>
                  <AiBadge />
                  {isOverride(offerAngle, AI_AUTO) && isOverride(offerAngle, baseDefault.offer) && (
                    <span className="text-[8px] px-1 rounded font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.7)' }}>custom</span>
                  )}
                </div>
                <select className="w-full mfi" value={offerAngle} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOfferAngle(e.target.value)}>
                  <option value={AI_AUTO}>✦ AI Decide</option>
                  <option>Free shipping or discount</option>
                  <option>VIP-only benefit or access</option>
                  <option>Social proof + nudge</option>
                  <option>Payment link + reassurance</option>
                  <option>Exclusive comeback offer</option>
                  <option>Easy reorder link</option>
                  <option>Urgency + time gate</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FieldLabel>Tone</FieldLabel>
                  <AiBadge />
                  {isOverride(tone, AI_AUTO) && isOverride(tone, baseDefault.tone) && (
                    <span className="text-[8px] px-1 rounded font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.7)' }}>custom</span>
                  )}
                </div>
                <select className="w-full mfi" value={tone} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTone(e.target.value)}>
                  <option value={AI_AUTO}>✦ AI Decide</option>
                  <option>Friendly, direct</option>
                  <option>Helpful, clear</option>
                  <option>Warm, nostalgic</option>
                  <option>Premium, personal</option>
                  <option>Concise, helpful</option>
                  <option>Curious, gentle</option>
                </select>
              </div>

              {/* Personalization */}
              <div>
                <FieldLabel>Personalisation</FieldLabel>
                <div className="flex flex-wrap gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {['First name', 'Last order date', 'Cart value', 'Product name', 'LTV tier', 'Days since last purchase'].map((p) => {
                    const active = personalization.includes(p)
                    return (
                      <button key={p} onClick={() => setPersonalization((prev: string[]) => active ? prev.filter((x: string) => x !== p) : [...prev, p])}
                        className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all"
                        style={active
                          ? { background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
                          : { color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {active ? '✓ ' : ''}{p}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Brand Knowledge Vault */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="2.5" stroke="#a78bfa" strokeWidth="1.3"/>
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[11px] font-semibold text-[#a78bfa]">Brand Knowledge Vault Active</span>
                </div>
                <div className="space-y-2">
                  {[['Tone', 'Warm and conversational, never salesy'], ['Sign-off', '"The Team" or founder first name'], ['Avoid', 'Aggressive urgency, spam language, ALL CAPS'], ['Voice', 'Speak like a helpful friend, not a marketer']].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-[10px] font-semibold text-[#a78bfa]/60 w-24 flex-shrink-0 pt-0.5">{k}</span>
                      <span className="text-[11px] text-white/50">{v}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-[10px] text-[#a78bfa]/60 hover:text-[#a78bfa] transition-colors">Edit in Brand Settings →</button>
              </div>

              {/* Strategy summary */}
              <div key={recKey} className="rec-panel p-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#00d4ff]/60">Effective Strategy</span>
                  {showUpdated && (
                    <span className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-[#00d4ff]/55 rec-updated">
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1110.83-3.5M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Updated
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Style',   val: msgStyle   === AI_AUTO ? aiRecs.style   : msgStyle   },
                    { label: 'Urgency', val: urgency    === AI_AUTO ? aiRecs.urgency : urgency    },
                    { label: 'Tone',    val: tone       === AI_AUTO ? aiRecs.tone    : tone       },
                    { label: 'Channel', val: channels },
                    { label: 'Timing',  val: aiRecs.timing },
                    { label: 'Offer',   val: offerAngle === AI_AUTO ? aiRecs.offer   : offerAngle },
                  ].map(({ label, val }) => (
                    <div key={label} className="px-2.5 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="text-[9px] font-semibold tracking-wider uppercase text-white/22 mb-0.5">{label}</div>
                      <div className="text-[10px] font-medium text-white/60">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Message Preview (Dynamic) ── */}
          {!launched && step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-white/80">Sample Message Preview</div>
                  <div className="text-[11px] text-white/30 mt-0.5">
                    {msgStyle} · {urgency} urgency · {tone}
                  </div>
                </div>
                <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {(['email', 'sms'] as const).map((t) => (
                    <button key={t} onClick={() => setActivePreview(t)}
                      className="px-3 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wide transition-all"
                      style={activePreview === t
                        ? { background: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
                        : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy summary chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: TRIGGER_LABELS[trigger as TriggerState], color: TRIGGER_COLORS[trigger as TriggerState] },
                  { label: msgStyle,   color: '#00d4ff' },
                  { label: urgency,    color: urgency === 'Critical' ? '#ff4d4d' : urgency === 'High' ? '#f59e0b' : urgency === 'Low' ? '#a78bfa' : '#00d4ff' },
                  { label: channels,  color: 'rgba(255,255,255,0.4)' },
                ].map(({ label, color }) => (
                  <span key={label} className="px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: `${color}12`, color, border: `1px solid ${color}22` }}>
                    {label}
                  </span>
                ))}
              </div>

              {activePreview === 'email' && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-white/25">Subject</span>
                      <span className="text-[12px] font-medium text-white/80">{previewSubject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-white/25">From</span>
                      <span className="text-[12px] text-white/50">Your Brand &lt;hello@yourbrand.com&gt;</span>
                    </div>
                  </div>
                  <div className="p-4" style={{ background: 'rgba(255,255,255,0.015)' }}>
                    <div className="text-[12px] leading-relaxed text-white/60 whitespace-pre-line">{previewBody}</div>
                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-[10px] text-white/20">Sent via Revenue Recovery Engine · Unsubscribe</div>
                    </div>
                  </div>
                </div>
              )}

              {activePreview === 'sms' && (
                <div className="flex justify-center py-2">
                  <div className="w-[260px]">
                    <div className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                      </div>
                      <div className="rounded-2xl p-3 text-[12px] leading-relaxed text-white/75"
                        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.12)' }}>
                        {previewSMS}
                      </div>
                      <div className="text-center mt-3 text-[10px] text-white/20">SMS · {previewSMS.length} chars</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[10px] font-semibold tracking-wider uppercase text-white/25 mb-2">Personalisation Tokens</div>
                <div className="flex flex-wrap gap-1.5">
                  {personalization.map((p: string) => {
                    const token = `{{${p.toLowerCase().replace(/ /g, '_')}}}`
                    return (
                      <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>{token}</span>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.1)' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="#00e676" strokeWidth="1.3"/>
                  <path d="M5 8l2 2 4-4" stroke="#00e676" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[11px] text-white/50">Preview reflects your strategy selections. Final messages are generated per-customer at send time.</span>
              </div>
            </div>
          )}

          {/* ── STEP 4: Fallback Logic (Dynamic) ── */}
          {!launched && step === 4 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-white/85">Fallback Sequence</div>
                  <div className="text-[12px] text-white/35 mt-1">What happens if the first message doesn't convert</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
                    <svg width="9" height="9" fill="none" viewBox="0 0 16 16"><path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="#00d4ff"/></svg>
                    <span className="text-[9px] font-semibold text-[#00d4ff]/70">AI-generated from strategy</span>
                  </div>
                  <span className="text-[9px] text-white/20">{urgency} urgency · {channels}</span>
                </div>
              </div>

              <div className="space-y-2">
                {fallback.map((rule, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-semibold" style={{ color: '#f59e0b' }}>If:</span>
                        <span className="text-[11px] text-white/60">{rule.condition}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-[#00d4ff]">Then:</span>
                        <span className="text-[11px] text-white/60">{rule.action}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-[10px] text-white/25 whitespace-nowrap">{rule.timing}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 16 16">
                    <rect x="2" y="2" width="12" height="12" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3"/>
                    <path d="M8 5v6M5 8h6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white/30">End of sequence</div>
                  <div className="text-[11px] text-white/20 mt-0.5">Customer exits workflow. Health score updated. Outcome logged.</div>
                </div>
              </div>

              <div>
                <FieldLabel>Exit Condition</FieldLabel>
                <select className="w-full mfi">
                  <option>Customer completes purchase</option>
                  <option>Customer unsubscribes</option>
                  <option>End of sequence reached</option>
                  <option>Manual override</option>
                </select>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/25 mb-3">Workflow Summary</div>
                <div className="space-y-2">
                  {[
                    ['Trigger',         TRIGGER_LABELS[trigger as TriggerState]],
                    ['Channels',        channels],
                    ['Style',           msgStyle],
                    ['Urgency',         urgency],
                    ['Objective',       objective],
                    ['Offer Angle',     offerAngle],
                    ['Fallback Steps',  `${fallback.length} rules configured`],
                    ['A/B Testing',     abTest ? 'Enabled' : 'Disabled'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[12px] text-white/30">{k}</span>
                      <span className="text-[12px] text-white/65 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!launched && (
          <div className="flex-shrink-0 flex items-center justify-between px-9 py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-5 py-2.5 rounded-lg text-[13px] font-medium text-white/30 hover:text-white/55 hover:bg-white/[0.04] transition-all">
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-white/25">Step {step} of 4</span>
              <button onClick={() => step < 4 ? setStep(step + 1) : handleLaunch()}
                className="px-7 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={step === 4
                  ? { background: 'rgba(0,230,118,0.13)', color: '#00e676', border: '1px solid rgba(0,230,118,0.22)' }
                  : { background: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.22)' }}>
                {step < 4 ? 'Continue →' : '✓ Launch Workflow'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

const WORKFLOWS_STORAGE_KEY = 'primeflow_workflows'

export function WorkflowsView() {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(WORKFLOWS_STORAGE_KEY) : null
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return BASE_WORKFLOWS
  })
  const [showModal,        setShowModal]        = useState(false)
  const [filter,           setFilter]           = useState<WorkflowStatus | 'all'>('all')
  const [hoveredRow,       setHoveredRow]       = useState<string | null>(null)
  const [activeDropdown,   setActiveDropdown]   = useState<string | null>(null)
  const [view,             setView]             = useState<'list' | 'customers' | 'recovery'>('list')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<WorkflowCustomer | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows))
    } catch {}
  }, [workflows])

  const filtered       = filter === 'all' ? workflows : workflows.filter((w: Workflow) => w.status === filter)
  const totalEnrolled  = workflows.reduce((s: number, w: Workflow) => s + w.enrolled, 0)
  const totalRevenue   = workflows.reduce((s: number, w: Workflow) => s + w.revenue, 0)
  const totalConverted = workflows.reduce((s: number, w: Workflow) => s + w.converted, 0)
  const convRate       = totalEnrolled > 0 ? ((totalConverted / totalEnrolled) * 100).toFixed(1) : '0'
  const activeCount    = workflows.filter((w: Workflow) => w.status === 'active').length

  function handleTogglePause(id: string) {
    setWorkflows((prev: Workflow[]) => prev.map((w: Workflow) => w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w))
  }
  function handleDuplicate(wf: Workflow) {
    const copy: Workflow = { ...wf, id: `${Date.now()}`, name: `${wf.name} (Copy)`, status: 'draft', enrolled: 0, converted: 0, revenue: 0, lastUpdated: 'Just now' }
    setWorkflows((prev: Workflow[]) => [...prev, copy])
  }
  function handleArchive(id: string) {
    setWorkflows((prev: Workflow[]) => prev.filter((w: Workflow) => w.id !== id))
  }

  // Recovery conversation drill-down
  if (view === 'recovery' && selectedWorkflow && selectedCustomer) {
    return (
      <WorkflowCustomerView
        customer={selectedCustomer}
        workflowName={selectedWorkflow.name}
        workflowTrigger={selectedWorkflow.trigger}
        onBack={() => setView('customers')}
      />
    )
  }

  // Enrolled customer list
  if (view === 'customers' && selectedWorkflow) {
    return (
      <WorkflowCustomerListView
        workflow={selectedWorkflow}
        customers={WORKFLOW_CUSTOMERS[selectedWorkflow.id] ?? []}
        onBack={() => { setView('list'); setSelectedWorkflow(null) }}
        onSelectCustomer={(c) => { setSelectedCustomer(c); setView('recovery') }}
      />
    )
  }

  // Main workflow list
  return (
    <>
      <style>{`
        .mfi { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 13px; font-size: 13.5px; color: rgba(255,255,255,0.75); outline: none; transition: border-color 0.15s; appearance: none; -webkit-appearance: none; width: 100%; }
        .mfi:focus { border-color: rgba(0,212,255,0.35); }
        .mfi::placeholder { color: rgba(255,255,255,0.18); }
        .wf-row { transition: background 0.1s; }
        .wf-row:hover { background: rgba(255,255,255,0.022) !important; }
        @keyframes recFade { from { opacity: 0.35; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
        .rec-panel { animation: recFade 0.3s ease-out; }
        @keyframes updatedFade { 0% { opacity: 0; transform: translateX(4px); } 20% { opacity: 1; transform: translateX(0); } 80% { opacity: 1; } 100% { opacity: 0; } }
        .rec-updated { animation: updatedFade 1.8s ease-out forwards; }
      `}</style>

      <div className="min-h-full">
        <div className="pl-7 pr-8 pt-9 pb-16 w-full">

          {/* Header */}
          <PageHeader
            eyebrow="Recovery Operations"
            title="Workflows"
            subtitle="Automated multi-channel sequences triggered by customer health, lifecycle state, and behaviour."
            actions={
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[12.5px] font-medium transition-all
                  text-white border border-[rgba(0,212,255,0.35)] bg-[rgba(0,212,255,0.12)]
                  hover:bg-[rgba(0,212,255,0.18)] hover:border-[rgba(0,212,255,0.55)]"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                New Workflow
              </button>
            }
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-5 mb-7">
            {[
              { label: 'Active Workflows',   value: String(activeCount),                 sub: `${workflows.length} total configured`,  accent: '#00d4ff' },
              { label: 'Customers Enrolled', value: totalEnrolled.toLocaleString(),      sub: 'across all active workflows',            accent: '#a78bfa' },
              { label: 'Recovered Revenue',  value: `$${totalRevenue.toLocaleString()}`, sub: 'attributed this period',                 accent: '#3ddc97' },
              { label: 'Conversion Rate',    value: `${convRate}%`,                      sub: `${totalConverted} customers converted`,  accent: '#ffaa00' },
            ].map(({ label, value, sub, accent }) => (
              <Card key={label} padded={false} className="px-6 py-6">
                <SectionLabel className="mb-4">{label}</SectionLabel>
                <div className="metric-num text-[30px] leading-none tracking-tight mb-2.5" style={{ color: accent }}>{value}</div>
                <div className="text-[12px]" style={{ color: tokens.textMuted }}>{sub}</div>
              </Card>
            ))}
          </div>

          {/* Table */}
          <div
            className="rounded-[14px] overflow-hidden"
            style={{ border: `1px solid ${tokens.borderSubtle}`, background: tokens.surface }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: `1px solid ${tokens.borderSubtle}` }}
            >
              <div className="flex items-center gap-2">
                <SectionLabel>Recovery Campaigns</SectionLabel>
                <Pill tone="accent">{filtered.length}</Pill>
              </div>
              <div
                className="flex items-center gap-0.5 p-0.5 rounded-[10px]"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.borderSubtle}` }}
              >
                {(['all', 'active', 'paused', 'draft'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="h-7 px-3 rounded-[7px] text-[11.5px] font-medium capitalize transition-all"
                    style={
                      filter === f
                        ? { background: 'rgba(0,212,255,0.10)', color: '#00d4ff', boxShadow: '0 0 0 1px rgba(0,212,255,0.25) inset' }
                        : { color: tokens.textTertiary, background: 'transparent' }
                    }
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div className="grid px-6 py-4" style={{ gridTemplateColumns: COLS, borderBottom: `1px solid ${tokens.borderSubtle}`, background: 'rgba(255,255,255,0.015)' }}>
              {['Workflow', 'Trigger', 'Action', 'Channels', 'Status', 'Enrolled', 'Conv.', 'Revenue', ''].map((h, i) => (
                <span key={i} className="eyebrow" style={{ fontSize: 11 }}>{h}</span>
              ))}
            </div>

            {filtered.map((wf: Workflow, i: number) => {
              const convPct = wf.enrolled > 0 ? `${((wf.converted / wf.enrolled) * 100).toFixed(0)}%` : null
              const tc = TRIGGER_COLORS[wf.trigger as TriggerState]
              return (
                <div key={wf.id} className="wf-row grid px-6 py-5 cursor-pointer relative"
                  style={{ gridTemplateColumns: COLS, borderBottom: i < filtered.length - 1 ? `1px solid ${tokens.borderSubtle}` : undefined, background: 'transparent' }}
                  onMouseEnter={() => setHoveredRow(wf.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => { setSelectedWorkflow(wf); setView('customers') }}>
                  <div className="flex items-center gap-3 pr-3">
                    <div className="w-[2px] h-10 rounded-full flex-shrink-0"
                      style={{ background: tc, opacity: wf.status === 'draft' ? 0.30 : 0.85, boxShadow: wf.status === 'active' ? `0 0 6px ${tc}66` : undefined }} />
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium leading-tight truncate" style={{ color: tokens.textPrimary }}>{wf.name}</div>
                      {wf.status === 'active' && (
                        <div className="text-[12px] mt-1" style={{ color: tokens.textMuted }}>Running · {WORKFLOW_CUSTOMERS[wf.id]?.length ?? 0} customers</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center h-5 px-2 rounded-[6px] text-[11px] font-medium tracking-wide"
                      style={{ color: tc, background: `${tc}14`, border: `1px solid ${tc}28` }}>
                      {TRIGGER_LABELS[wf.trigger as TriggerState]}
                    </span>
                  </div>
                  <div className="flex items-center"><span className="text-[13.5px]" style={{ color: tokens.textSecondary }}>{wf.actionType}</span></div>
                  <div className="flex items-center"><ChannelBadge channel={wf.channels} /></div>
                  <div className="flex items-center"><StatusPill status={wf.status} /></div>
                  <div className="flex items-center"><span className="metric-num text-[13.5px]" style={{ color: tokens.textPrimary }}>{wf.enrolled > 0 ? wf.enrolled.toLocaleString() : '—'}</span></div>
                  <div className="flex items-center gap-1.5">
                    <span className="metric-num text-[13.5px]" style={{ color: tokens.textPrimary }}>{wf.converted > 0 ? wf.converted : '—'}</span>
                    {convPct && <span className="text-[11px]" style={{ color: tokens.textMuted }}>{convPct}</span>}
                  </div>
                  <div className="flex items-center">
                    <span className="metric-num text-[13.5px]" style={{ color: wf.revenue > 0 ? '#3ddc97' : tokens.textMuted }}>
                      {wf.revenue > 0 ? `$${wf.revenue.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  {/* Actions column */}
                  <div className="flex items-center justify-end relative" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        opacity: hoveredRow === wf.id || activeDropdown === wf.id ? 1 : 0,
                        color: activeDropdown === wf.id ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                        background: activeDropdown === wf.id ? 'rgba(0,212,255,0.08)' : 'transparent',
                      }}
                      onClick={() => setActiveDropdown(activeDropdown === wf.id ? null : wf.id)}>
                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                        <circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/>
                      </svg>
                    </button>
                    {activeDropdown === wf.id && (
                      <WorkflowActionsMenu
                        workflow={wf}
                        onEdit={() => setShowModal(true)}
                        onTogglePause={() => handleTogglePause(wf.id)}
                        onDuplicate={() => handleDuplicate(wf)}
                        onArchive={() => handleArchive(wf.id)}
                        onClose={() => setActiveDropdown(null)}
                      />
                    )}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="px-6 py-16 text-center text-[13px]" style={{ color: tokens.textMuted }}>
                No workflows match this filter.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-5">
            <span className="w-1 h-1 rounded-full" style={{ background: tokens.textMuted }} />
            <p className="text-[11.5px]" style={{ color: tokens.textMuted }}>
              Workflows run automatically based on customer health scores updated every 6 hours. Click any workflow to view enrolled customers.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <NewWorkflowModal
          onClose={() => setShowModal(false)}
          onLaunch={(wf: Workflow) => setWorkflows((prev: Workflow[]) => [wf, ...prev])}
        />
      )}
    </>
  )
}
