Document ID: CM-SRS-001
Version: 1.0
Date: June 17, 2026
Project: Ça Match - Service Marketplace & OS for Africa
1.1 INTRODUCTION
1.1.1 Purpose
This Software Requirements Specification (SRS) provides a complete description of the behavior, performance, and constraints for the Ça Match platform. It serves as the contractual agreement between stakeholders and the development team.
1.1.2 Scope
Ça Match is a multi-sided platform connecting service clients with verified professionals in Côte d'Ivoire, starting with Abidjan. The system encompasses:
Client-facing mobile and web applications
Professional-facing mobile application
Enterprise management portal
Admin dashboard
AI-powered matching and automation layer
Mobile money payment integration
Real-time communication system
1.1.3 Definitions, Acronyms, and Abbreviations
GMV: Gross Merchandise Value
XOF: West African CFA Franc
MoMo: Mobile Money
SLA: Service Level Agreement
OTP: One-Time Password
RLS: Row Level Security
CRUD: Create, Read, Update, Delete
API: Application Programming Interface
1.1.4 References
PRD Document: CM-PRD-001 v1.0
Supabase Documentation: https://supabase.com/docs
React Native Documentation: https://reactnative.dev/docs
OpenAI API Reference: https://platform.openai.com/docs
1.2 OVERALL DESCRIPTION
2.1 Product Perspective
Ça Match is a new, standalone platform that integrates with:
External Payment Systems: Wave, Orange Money, MTN Mobile Money
Communication Services: Firebase Cloud Messaging, Twilio SMS, WhatsApp Business API
AI Services: OpenAI GPT-4o-mini, Whisper (speech-to-text)
Mapping Services: Mapbox GL
Authentication: Supabase Auth (Phone OTP, Email)
2.2 Product Functions
The system provides the following core functions:
Client Functions:
F01: Search and filter professionals by category, location, rating
F02: Submit service requests via text, voice, or image
F03: Receive and compare quotes from professionals
F04: Book and schedule appointments
F05: Pay securely via mobile money or cash
F06: Communicate with professionals via in-app chat
F07: Rate and review completed services
F08: Track job status in real-time
F09: Manage disputes and request refunds
F10: View transaction history and invoices
Professional Functions:
F11: Create and manage business profile
F12: Receive job requests and quotes
F13: Accept/reject jobs and manage schedule
F14: Navigate to job locations
F15: Execute jobs with checklists and photo proof
F16: Generate and send invoices
F17: Track earnings and request payouts
F18: Manage team members (for business accounts)
F19: Access training and certification modules
F20: View performance analytics
Enterprise Functions:
F21: Manage multiple sites/locations
F22: Configure approval workflows
F23: Set budgets and track spending
F24: Monitor SLA compliance
F25: Generate consolidated reports
F26: Manage vendor compliance and certifications
Admin Functions:
F27: Monitor platform metrics and health
F28: Verify professional credentials
F29: Moderate content (reviews, messages, profiles)
F30: Manage disputes and escalations
F31: Configure platform settings and fees
F32: Oversee financial transactions and reconciliations
2.3 User Classes and Characteristics
Client Users:
Urban Professionals (30%): Tech-savvy, high income, value convenience and speed
Small Business Owners (40%): Moderate tech comfort, price-sensitive, need reliability
Property Managers (20%): High volume, need batch operations and reporting
Enterprise Users (10%): Require SLAs, compliance, and multi-site management
Professional Users:
Independent Workers (70%): Low-end smartphones, limited data, basic literacy
Small Business Owners (30%): Mid-range devices, team management needs
Admin Users:
Platform Admins (5%): Technical, full system access
Support Staff (15%): Customer service focused, limited financial access
Finance Team (5%): Payment reconciliation and reporting
Trust & Safety (5%): Verification and dispute resolution
2.4 Operating Environment
Mobile: iOS 14+, Android 8.0+ (API 26+)
Web: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
Backend: Supabase (PostgreSQL 15+, PostGIS 3.3+, pgvector 0.5+)
Network: 3G minimum, optimized for intermittent connectivity
2.5 Design and Implementation Constraints
Performance: App must load in <3 seconds on 3G
Storage: Mobile app <50MB initial download
Data: Offline-first architecture with sync capability
Accessibility: WCAG 2.1 AA compliance
Localization: French primary, Nouchi secondary
Compliance: ARTCI (Côte d'Ivoire telecom regulator), GDPR principles
2.6 Assumptions and Dependencies
A1: Mobile money providers maintain API stability
A2: Internet penetration in Abidjan remains >60%
A3: Smartphone adoption continues to grow
D1: Supabase platform availability (99.9% SLA)
D2: OpenAI API availability and rate limits
D3: Firebase Cloud Messaging delivery
1.3 SPECIFIC REQUIREMENTS
3.1 Functional Requirements
3.1.1 User Authentication and Authorization
FR-AUTH-001: Phone Number Registration
Priority: P0
Description: Users register with phone number and receive OTP via SMS
Input: Phone number (E.164 format: +225XXXXXXXX)
Processing:
Validate phone number format
Generate 6-digit OTP
Send OTP via SMS (Twilio)
Store OTP hash with 10-minute expiration
Output: OTP sent, user prompted to enter code
Error Handling: Invalid format, rate limiting (5 attempts/minute)
FR-AUTH-002: OTP Verification
Priority: P0
Description: Verify OTP and create/authenticate user session
Input: Phone number, OTP code
Processing:
Retrieve stored OTP hash
Compare with provided OTP
If match: create JWT session, return user profile
If no match: increment failed attempts, lock after 5 failures
Output: JWT token, refresh token, user profile
Security: OTP expires after 10 minutes, max 5 verification attempts
FR-AUTH-003: Role-Based Access Control
Priority: P0
Description: Enforce permissions based on user role
Roles: client, professional, business_admin, enterprise_admin, platform_admin
Implementation: Row Level Security (RLS) policies in PostgreSQL
Example Policy:
sql
CREATE POLICY "Clients can view own requests" 
ON service_requests 
FOR SELECT 
USING (client_id = auth.uid()); 
3.1.2 Service Request Management
FR-REQ-001: Create Service Request
Priority: P0
Description: Client submits a service request with description, location, and media
Input:
category (enum: electrician, plumber, ac_refrigeration, cleaner)
description (text, max 2000 chars)
location (geography point)
address (text)
media_urls (array of image/video URLs, max 5)
urgency (enum: low, medium, high, emergency)
Processing:
Validate input data
Call AI categorization function (if description provided)
Calculate estimated price range
Create service_request record
Trigger matching algorithm
Send notifications to nearby professionals
Output: service_request object with ID and status
Validation: Category required, location required, max 5 media files
FR-REQ-002: AI-Powered Request Categorization
Priority: P1
Description: Automatically categorize and extract details from unstructured input
Input: Text description, voice transcription, and/or images
Processing:
If voice: transcribe using Whisper API
Send text/images to GPT-4o-mini with structured prompt
Parse JSON response
Validate confidence score (>0.7 threshold)
Store extracted features
Output:
json
{
  "category": "ac_refrigeration",
  "sub_category": "repair",
  "urgency": "high",
  "estimated_complexity": "medium",
  "detected_parts": ["compressor"],
  "confidence_score": 0.92
}

Fallback: If confidence <0.7, flag for manual review
FR-REQ-003: Professional Matching Algorithm
Priority: P0
Description: Rank and select professionals based on 7-factor scoring
Input: service_request_id
Processing:
Query professionals within service radius using PostGIS
Calculate match score for each professional:
Geographic proximity (25% weight)
Skill match (20% weight)
Price alignment (15% weight)
Quality rating (20% weight)
Availability (10% weight)
Response speed (5% weight)
Current capacity (5% weight)
Rank professionals by score
Select top 3 (Push mode) or broadcast to all (Pull mode)
Store rankings in ai_professional_rankings table
Output: List of matched professionals with scores
Performance: <500ms response time
3.1.3 Quote and Booking System
FR-QUOTE-001: Submit Quote
Priority: P0
Description: Professional submits itemized quote for service request
Input:
request_id (UUID)
labor_cost (integer, XOF)
material_cost (integer, XOF)
notes (text, optional)
valid_until (timestamp, default 24 hours)
Processing:
Validate professional is matched to request
Calculate total_cost = labor_cost + material_cost
Create quote record
Update service_request status to 'quoted'
Notify client
Output: quote object with ID
Validation: Costs must be >0, valid_until must be future date
FR-QUOTE-002: Accept Quote
Priority: P0
Description: Client accepts a quote and proceeds to booking
Input: quote_id
Processing:
Validate quote is still valid (not expired)
Update quote status to 'accepted'
Update service_request status to 'accepted'
Assign professional to request
Create job record
Initiate payment intent (escrow)
Notify professional
Output: Updated service_request and job objects
Side Effects: Payment authorization, professional schedule block
FR-BOOK-001: Schedule Appointment
Priority: P0
Description: Client and professional agree on appointment time
Input:
job_id
scheduled_at (timestamp)
notes (text, optional)
Processing:
Validate time is in future
Check professional availability
Update job with scheduled time
Send calendar invites (optional)
Schedule reminder notifications (24h, 1h before)
Output: Updated job object
Conflict Resolution: If professional unavailable, suggest alternative times
3.1.4 Payment Processing
FR-PAY-001: Mobile Money Payment (Wave)
Priority: P0
Description: Process payment via Wave mobile money
Input:
job_id
amount (integer, XOF)
client_phone (E.164 format)
Processing:
Create payment_intent record with status 'pending'
Call Wave API to initiate payment
Receive deep link or USSD push
Client confirms payment on their phone
Wave webhook confirms payment
Update payment_intent status to 'captured'
Funds held in escrow
Output: payment_intent object with provider_reference
Timeout: 15 minutes for client confirmation
Error Handling: Insufficient funds, network error, timeout
FR-PAY-002: Cash Payment Verification
Priority: P1
Description: Verify cash payment completion via PIN
Input:
job_id
pin (6-digit code)
Processing:
Professional generates 6-digit PIN after job completion
Client provides PIN to professional after cash payment
Professional enters PIN in app
System validates PIN matches
Mark job as paid
Add platform fee to professional's negative balance
Output: Job marked as paid, professional balance updated
Security: PIN expires after 1 hour, single use
FR-PAY-003: Professional Payout
Priority: P0
Description: Transfer funds to professional's mobile money account
Input:
professional_id
amount (integer, XOF)
method (wave, orange_money, mtn)
Processing:
Validate professional balance >= amount
Check hold period (48h for new pros, instant for elite)
Create payout record
Call payment provider API
Deduct from professional balance
Update payout status on webhook
Output: payout object with status
Fees: Wave (0%), Orange Money (1.5%), MTN (2%)
3.1.5 Communication System
FR-COM-001: In-App Chat
Priority: P0
Description: Real-time messaging between client and professional
Input:
conversation_id
content (text, max 5000 chars)
media_url (optional, image/voice note)
Processing:
Validate both users are participants
Create message record
Broadcast via Supabase Realtime
Send push notification if recipient offline
Transcribe voice notes (if applicable)
Output: message object
Features: Read receipts, typing indicators, media attachments
FR-COM-002: Push Notifications
Priority: P0
Description: Send push notifications for key events
Triggers:
New job request (professional)
Quote received (client)
Job started (client)
Payment received (professional)
Review submitted (both)
Processing:
Check user notification preferences
Format message in user's language
Send via Firebase Cloud Messaging
Log delivery status
Fallback: SMS if push fails after 5 minutes
3.1.6 Review and Rating System
FR-REV-001: Submit Review
Priority: P0
Description: Client and professional rate each other after job completion
Input:
job_id
rating (1-5 stars)
comment (text, max 1000 chars, optional)
Processing:
Validate job is completed and paid
Check user hasn't already reviewed
Create review record (is_visible = false for dual-blind)
If both reviews submitted or 7 days passed: set is_visible = true
Update professional's average rating
Run AI sentiment analysis on comment
Output: review object
Anti-Gaming: Velocity checks, sentiment analysis, verified-only
FR-REV-002: Review Moderation
Priority: P1
Description: Automatically flag inappropriate reviews
Processing:
Check for profanity (regex + word list)
Check for PII (phone numbers, addresses)
Analyze sentiment consistency (rating vs text)
Check for copied/spam content
If flagged: set status to 'pending_review', notify admin
Output: review status (approved, rejected, pending_review)
3.1.7 Dispute Resolution
FR-DIS-001: Raise Dispute
Priority: P1
Description: Client or professional raises a dispute for a completed job
Input:
job_id
reason (enum: no_show, poor_quality, overcharge, other)
description (text)
evidence_urls (array of images/videos)
Processing:
Validate job is completed within last 7 days
Freeze payment in escrow
Create dispute record
Notify both parties
Assign to Tier 1 support (AI mediation)
Output: dispute object with ID
SLA: Resolution within 24 hours
FR-DIS-002: AI Mediation
Priority: P2
Description: Automated dispute resolution using AI analysis
Processing:
Analyze chat logs for context
Review photo evidence (before/after)
Check GPS data (did professional arrive?)
Generate resolution recommendation (e.g., 50% refund)
Send to both parties for acceptance
If both accept: execute resolution
If rejected: escalate to Tier 2 (human)
Output: Resolution recommendation or escalation
3.2 Non-Functional Requirements
3.2.1 Performance Requirements
NFR-PERF-001: Response Time
Requirement: 95% of API requests complete in <500ms
Measurement: Monitor via Sentry and PostgREST logs
Critical Paths:
Search: <300ms
Matching: <500ms
Payment initiation: <1000ms
NFR-PERF-002: Mobile App Performance
Requirement: App loads in <3 seconds on 3G network
Measurement: Firebase Performance Monitoring
Optimizations:
Aggressive image compression (WebP)
Lazy loading
Offline caching
Skeleton screens
NFR-PERF-003: Concurrent Users
Requirement: Support 10,000 concurrent users
Measurement: Load testing with k6
Infrastructure:
Supabase auto-scaling
CDN for static assets
Database connection pooling
3.2.2 Reliability Requirements
NFR-REL-001: Availability
Requirement: 99.9% uptime (8.76 hours downtime/year allowed)
Measurement: Uptime monitoring (Pingdom/Datadog)
Redundancy:
Supabase multi-AZ deployment
Payment provider fallbacks
SMS gateway redundancy
NFR-REL-002: Data Durability
Requirement: Zero data loss for transactions
Implementation:
Point-in-time recovery (PITR)
Daily backups to S3
Write-ahead logging (WAL)
NFR-REL-003: Offline Capability
Requirement: Professionals can complete jobs offline
Implementation:
Local SQLite database
Queue mutations for sync
Conflict resolution on reconnect
3.2.3 Security Requirements
NFR-SEC-001: Data Encryption
Requirement: All PII encrypted at rest and in transit
Implementation:
TLS 1.3 for all connections
AES-256 encryption at rest (Supabase managed)
Phone numbers hashed in logs
NFR-SEC-002: Authentication
Requirement: Multi-factor authentication for sensitive operations
Implementation:
Phone OTP for login
Email confirmation for password reset
Session tokens with 7-day expiration
NFR-SEC-003: Authorization
Requirement: Principle of least privilege
Implementation:
Row Level Security (RLS) on all tables
Role-based access control (RBAC)
API rate limiting
NFR-SEC-004: Payment Security
Requirement: PCI DSS compliance for payment processing
Implementation:
No card data stored (mobile money only)
Tokenization via payment providers
Webhook signature verification
3.2.4 Scalability Requirements
NFR-SCA-001: Horizontal Scaling
Requirement: System scales to 100,000 users without architecture changes
Implementation:
Stateless Edge Functions
Database read replicas
CDN for media assets
NFR-SCA-002: Geographic Expansion
Requirement: Support multiple cities/countries
Implementation:
Multi-tenant architecture
Currency localization
Timezone handling
3.2.5 Usability Requirements
NFR-USA-001: Accessibility
Requirement: WCAG 2.1 AA compliance
Implementation:
Screen reader support
Keyboard navigation
High contrast mode
Minimum touch target 48x48dp
NFR-USA-002: Localization
Requirement: Support French and Nouchi languages
Implementation:
i18n framework (react-intl)
RTL support (for future Arabic expansion)
Cultural date/number formatting
NFR-USA-003: Low Literacy Support
Requirement: Interface usable by users with basic literacy
Implementation:
Icon-heavy design
Voice input/output
Video tutorials
Simplified mode option
1.4 EXTERNAL INTERFACE REQUIREMENTS
4.1 User Interfaces
UI-001: Mobile App (Client)
Platform: iOS and Android (React Native)
Screens: Home, Search, Pro Profile, Request, Chat, Jobs, Profile
Navigation: Bottom tab bar (5 tabs)
Design System: Material Design 3 + custom Ça Match theme
UI-002: Mobile App (Professional)
Platform: iOS and Android (React Native)
Screens: Dashboard, Jobs, Schedule, Finance, Profile
Navigation: Bottom tab bar (4 tabs)
Special: Large buttons, offline indicators, voice commands
UI-003: Web Dashboard (Admin/Enterprise)
Platform: Responsive web (Next.js)
Screens: Overview, Users, Jobs, Finance, Settings
Navigation: Sidebar + top bar
Features: Data tables, charts, filters, bulk actions
4.2 Hardware Interfaces
HW-001: GPS/Location
Requirement: Accurate location tracking for matching and navigation
Implementation:
Native location services (iOS/Android)
Background location for active jobs
Battery optimization
HW-002: Camera
Requirement: Photo/video capture for job proof
Implementation:
Native camera API
Image compression before upload
EXIF data stripping for privacy
HW-003: Microphone
Requirement: Voice note recording
Implementation:
Native audio recording
Compression (AAC format)
Transcription via Whisper API
4.3 Software Interfaces
SI-001: Supabase API
Type: REST (PostgREST)
Authentication: JWT Bearer token
Endpoints: Auto-generated from database schema
Documentation: https://supabase.com/docs/guides/api
SI-002: OpenAI API
Type: REST
Authentication: API key
Endpoints:
/v1/chat/completions (GPT-4o-mini)
/v1/audio/transcriptions (Whisper)
Rate Limits: 10,000 tokens/minute
SI-003: Wave API
Type: REST
Authentication: API key + webhook signature
Endpoints:
POST /v1/payments (initiate)
POST /v1/payouts (disburse)
Webhook: /webhooks/wave (callbacks)
Documentation: https://developer.wave.com
SI-004: Orange Money API
Type: REST
Authentication: OAuth 2.0
Endpoints:
POST /webpayment/v2 (initiate)
Webhook: /webhooks/orange (callbacks)
Documentation: Provided by Orange CI
SI-005: Firebase Cloud Messaging
Type: REST
Authentication: Service account key
Endpoint: POST https://fcm.googleapis.com/v1/projects/{project}/messages:send
Documentation: https://firebase.google.com/docs/cloud-messaging
4.4 Communication Interfaces
CI-001: HTTPS
Protocol: TLS 1.3
Ports: 443 (standard)
Certificate: Let's Encrypt (auto-renewed)
CI-002: WebSockets
Protocol: WSS (WebSocket Secure)
Port: 443
Use Case: Real-time chat, job updates
Implementation: Supabase Realtime
CI-003: Webhooks
Protocol: HTTPS
Authentication: HMAC-SHA256 signature
Endpoints:
/webhooks/wave
/webhooks/orange
/webhooks/mtn
Retry Policy: Exponential backoff (1s, 5s, 30s, 5m)
1.5 OTHER REQUIREMENTS
5.1 Legal Requirements
LEG-001: Data Privacy
Regulation: ARTCI (Côte d'Ivoire), GDPR principles
Requirements:
User consent for data collection
Right to access, rectify, delete data
Data portability (JSON export)
Breach notification within 72 hours
LEG-002: Financial Compliance
Regulation: BCEAO (Central Bank of West African States)
Requirements:
KYC for professionals (ID verification)
Transaction reporting for amounts >1,000,000 XOF
Anti-money laundering (AML) checks
LEG-003: Consumer Protection
Regulation: Côte d'Ivoire Consumer Code
Requirements:
Clear pricing display
7-day refund policy for disputes
Transparent terms of service
5.2 Audit Requirements
AUD-001: Audit Logging
Scope: All CRUD operations on sensitive tables
Tables: users, service_requests, transactions, reviews
Fields:
user_id (who performed action)
action (INSERT, UPDATE, DELETE)
entity_type, entity_id
old_values, new_values (JSON)
timestamp, IP address
Retention: 2 years
AUD-002: Financial Audit Trail
Scope: All payment transactions
Requirements:
Immutable ledger (no deletes)
Reconciliation reports (daily)
Export to accounting software (CSV, QuickBooks)