/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-nocheck
import { pgTable, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

// Define custom database enums corresponding to our system roles & statuses
export const roleEnum = pgEnum("user_role", ["client", "pro"]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "accepted",
  "en_route",
  "in_progress",
  "completed",
  "cancelled"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "wave",
  "orange_money",
  "mtn_momo",
  "cash"
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "successful",
  "failed"
]);

// 1. Users table (Stores basic user data for both Clients and Pros)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  role: roleEnum("role").notNull().default("client"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Pros details table (One-to-one link to hold specialized professional data)
export const professionalDetails = pgTable("professional_details", {
  id: text("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'electricity' | 'plumbing' | 'ac' | 'cleaning'
  title: text("title").notNull(), // e.g. "Maître Électricien"
  bio: text("bio").notNull(),
  experienceYears: integer("experience_years").notNull(),
  rating: integer("rating").notNull().default(5), // stored out of 50 (e.g. 48 for 4.8) to handle decimals simply
  reviewCount: integer("review_count").notNull().default(0),
  hourlyRateXOF: integer("hourly_rate_xof").notNull(), // Strict integer currency
  locationNeighborhood: text("location_neighborhood").notNull(), // e.g., "Cocody", "Marcory", "Yopougon"
  isVerified: boolean("is_verified").notNull().default(false),
  completedInterventions: integer("completed_interventions").notNull().default(0),
  availabilityStatus: text("availability_status").notNull().default("available"), // 'available' | 'busy' | 'offline'
});

// 3. Services table (Lists individual offerings by pros)
export const services = pgTable("services", {
  id: text("id").primaryKey(),
  proId: text("pro_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Recharge Fréon"
  description: text("description").notNull(),
  priceEstimateXOF: integer("price_estimate_xof").notNull(), // Strict integer
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Service Requests table (Core state machine tracker for order progress)
export const serviceRequests = pgTable("service_requests", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => users.id),
  proId: text("pro_id").notNull().references(() => users.id),
  serviceId: text("service_id").notNull().references(() => services.id),
  serviceName: text("service_name").notNull(),
  status: requestStatusEnum("status").notNull().default("pending"),
  travelFeeXOF: integer("travel_fee_xof").notNull().default(0),
  laborFeeXOF: integer("labor_fee_xof").notNull().default(0),
  totalFeeXOF: integer("total_fee_xof").notNull().default(0),
  locationDetails: text("location_details").notNull(),
  estimatedArrivalMinutes: integer("estimated_arrival_minutes"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Transactions table (Handles XOF monetary state with zero decimals)
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => serviceRequests.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => users.id),
  proId: text("pro_id").notNull().references(() => users.id),
  amountXOF: integer("amount_xof").notNull(), // No decimal values for CFA Franc (XOF)
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  status: transactionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
