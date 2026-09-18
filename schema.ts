import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
  "partial_delivered",
  "returned",
  "cancelled",
  "incomplete",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  invoice: text("invoice").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  altPhone: text("alt_phone"),
  address: text("address").notNull(),
  area: text("area"),
  district: text("district").notNull().default("Dhaka"),
  division: text("division"),
  note: text("note"),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull().default(0),
  deliveryCharge: integer("delivery_charge").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(0),
  source: text("source").notNull().default("landing"),
  status: text("status").notNull().default("pending"),
  isFake: boolean("is_fake").notNull().default(false),
  isIncomplete: boolean("is_incomplete").notNull().default(false),
  courierId: integer("courier_id"),
  consignmentId: text("consignment_id"),
  trackingCode: text("tracking_code"),
  courierStatus: text("courier_status"),
  courierNote: text("courier_note"),
  courierError: text("courier_error"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  raw: jsonb("raw"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const couriers = pgTable("couriers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull().default("steadfast"),
  baseUrl: text("base_url"),
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  priority: integer("priority").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  event: text("event").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
