import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

// Auth tables for better-auth
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default('member'),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => new Date(),
  ),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  category: text('category'),
  imageUrl: text('image_url'),
  stock: integer('stock').default(0),
  sku: text('sku').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Cesworld membership tables
export const CesworldMembers = pgTable('Cesworld_members', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  tier: text('tier').notNull().default('member'),
  points: integer('points').notNull().default(0),
  annualSpending: text('annual_spending').notNull().default('0.00'),
  birthdayMonth: integer('birthday_month'),
  birthdayDay: integer('birthday_day'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastTierUpdate: timestamp('last_tier_update').notNull().defaultNow(),
});

export const CesworldTransactions = pgTable('Cesworld_transactions', {
  id: serial('id').primaryKey(),
  memberId: integer('member_id').notNull().references(() => CesworldMembers.id),
  type: text('type').notNull(),
  amount: text('amount').notNull(),
  points: integer('points').notNull(),
  description: text('description').notNull(),
  orderId: text('order_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const CesworldRewards = pgTable('Cesworld_rewards', {
  id: serial('id').primaryKey(),
  memberId: integer('member_id').notNull().references(() => CesworldMembers.id),
  rewardType: text('reward_type').notNull(),
  pointsCost: integer('points_cost').notNull(),
  amountOff: text('amount_off').notNull(),
  status: text('status').notNull().default('active'),
  redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
  usedAt: timestamp('used_at'),
  expiresAt: timestamp('expires_at').notNull(),
});

// Designers table
export const designers = pgTable('designers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  bio: text('bio'),
  portfolioUrl: text('portfolio_url'),
  specialties: text('specialties'),
  status: text('status').notNull().default('pending'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Designs table
export const designs = pgTable('designs', {
  id: serial('id').primaryKey(),
  designerId: integer('designer_id').notNull().references(() => designers.id),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  category: text('category'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Contracts table
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  designerId: integer('designer_id').notNull().references(() => designers.id),
  designId: integer('design_id').references(() => designs.id),
  title: text('title').notNull(),
  description: text('description'),
  amount: text('amount'),
  status: text('status').notNull().default('pending'),
  awardedAt: timestamp('awarded_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  envelopeId: text('envelope_id'),
  envelopeStatus: text('envelope_status').default('pending'),
  signedAt: timestamp('signed_at'),
  envelopeUrl: text('envelope_url'),
});

// Newsletter subscriptions table
export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  subscribedAt: timestamp('subscribed_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
  discountCode: text('discount_code'),
  discountUsed: boolean('discount_used').notNull().default(false),
});

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: "cascade" }),
  sessionId: text('session_id'), // For guest users
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer('quantity').notNull().default(1),
  size: text('size'),
  color: text('color'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Shipping addresses table
export const shippingAddresses = pgTable('shipping_addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  country: text('country').notNull().default('United States'),
  phone: text('phone'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => user.id, { onDelete: "set null" }),
  email: text('email').notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, shipped, delivered, cancelled
  subtotal: text('subtotal').notNull(),
  shipping: text('shipping').notNull().default('0.00'),
  tax: text('tax').notNull().default('0.00'),
  discount: text('discount').notNull().default('0.00'),
  total: text('total').notNull(),
  shippingAddressId: integer('shipping_address_id').references(() => shippingAddresses.id),
  shippingFirstName: text('shipping_first_name'),
  shippingLastName: text('shipping_last_name'),
  shippingAddressLine1: text('shipping_address_line1'),
  shippingAddressLine2: text('shipping_address_line2'),
  shippingCity: text('shipping_city'),
  shippingState: text('shipping_state'),
  shippingZipCode: text('shipping_zip_code'),
  shippingCountry: text('shipping_country'),
  shippingPhone: text('shipping_phone'),
  paymentMethod: text('payment_method'), // card, paypal, etc.
  paymentIntentId: text('payment_intent_id'), // Stripe payment intent ID
  trackingNumber: text('tracking_number'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  productImage: text('product_image'),
  price: text('price').notNull(),
  quantity: integer('quantity').notNull(),
  size: text('size'),
  color: text('color'),
  sku: text('sku'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});