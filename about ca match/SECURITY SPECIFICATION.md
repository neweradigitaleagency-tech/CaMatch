Document ID: CM-SEC-001
Version: 1.0
Date: June 17, 2026
6.1 SECURITY ARCHITECTURE
1.1 Defense in Depth Model
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: NETWORK SECURITY                                    │
│ • Cloudflare WAF + DDoS protection                          │
│ • TLS 1.3 enforcement                                       │
│ • IP whitelisting for admin                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: APPLICATION SECURITY                                │
│ • Input validation (Zod schemas)                            │
│ • SQL injection prevention (parameterized queries)          │
│ • XSS prevention (React escaping)                           │
│ • CSRF protection (SameSite cookies)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: DATA SECURITY                                       │
│ • Row Level Security (RLS) on all tables                    │
│ • Encryption at rest (AES-256)                              │
│ • Encryption in transit (TLS 1.3)                           │
│ • PII hashing in logs                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: AUTHENTICATION & AUTHORIZATION                      │
│ • Phone OTP + JWT tokens                                    │
│ • Role-based access control (RBAC)                          │
│ • Principle of least privilege                              │
│ • Session management                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: MONITORING & INCIDENT RESPONSE                      │
│ • Real-time alerting (Sentry, Datadog)                      │
│ • Audit logging                                             │
│ • Anomaly detection                                         │
│ • Incident response playbook                                │
└─────────────────────────────────────────────────────────────┘ 
1.2 Security Principles
P1: Zero Trust
Never trust, always verify
Every request authenticated and authorized
No implicit trust based on network location
P2: Least Privilege
Users get minimum permissions needed
Service accounts scoped to specific functions
Time-limited access for sensitive operations
P3: Defense in Depth
Multiple layers of security controls
Failure of one layer doesn't compromise system
Redundant security mechanisms
P4: Security by Design
Security considered at architecture phase
Threat modeling for new features
Security reviews in code review process
P5: Assume Breach
Design for when (not if) breach occurs
Minimize blast radius
Fast detection and response
6.2 AUTHENTICATION
2.1 Authentication Flow
Phone OTP (Primary):
1. User enters phone number
2. Backend generates 6-digit OTP
3. OTP hashed with bcrypt (cost 12) and stored with 10-min expiry
4. OTP sent via SMS (Twilio)
5. User enters OTP
6. Backend verifies hash match
7. JWT issued (access + refresh tokens) 
Security Controls:
OTP: 6 digits, numeric only
OTP expiry: 10 minutes
Max attempts: 5 per OTP, then locked
Rate limit: 1 OTP per minute per phone
OTP hashed, never stored in plain text
SMS sent over HTTPS to Twilio
JWT Token Structure:
json
{
  "sub": "user_uuid",
  "role": "client",
  "phone": "+2250708091010",
  "iat": 1718620800,
  "exp": 1718624400,  // 1 hour
  "iss": "camatch"
} 
Refresh Token:
7-day expiration
Single-use (rotated on each use)
Stored securely (HttpOnly cookie on web, Keychain on mobile)
Revocable (for logout, suspicious activity)
2.2 Multi-Factor Authentication (MFA)
Required for:
Platform admin login
Financial operations (payouts >100,000 XOF)
Account recovery
Verification approvals
MFA Methods:
SMS OTP (primary)
Email OTP (fallback)
Authenticator app (future)
2.3 Session Management
Session Lifecycle:
Login → Active Session → Idle (30 min) → Expired (7 days) → Logout 
Session Security:
Access token: 1 hour, stored in memory (mobile) / HttpOnly cookie (web)
Refresh token: 7 days, rotated on use
Concurrent sessions: Max 3 devices per user
Session revocation: Immediate on password change, suspicious activity
Secure logout: Clear all tokens, invalidate refresh token
6.3 AUTHORIZATION
3.1 Role-Based Access Control (RBAC)
Roles & Permissions:
PLATFORM_SUPER_ADMIN
├── All permissions
└── System configuration

PLATFORM_SUPPORT
├── View users, jobs, disputes
├── Manage disputes (Tier 1-2)
└── Moderate content

PLATFORM_FINANCE
├── View all transactions
├── Manage payouts
└── Financial reports

PLATFORM_TRUST_SAFETY
├── Manage verifications
├── Moderate content
└── Manage disputes (all tiers)

ENTERPRISE_ADMIN
├── Manage sites, users
├── View financials
├── Approve quotes
└── Configure workflows

ENTERPRISE_SITE_MANAGER
├── Manage site requests
├── Approve quotes (site-level)
└── View site reports

BUSINESS_ADMIN
├── Manage team
├── View financials
└── Manage subscription

BUSINESS_DISPATCHER
├── Dispatch jobs
└── View team

BUSINESS_TECHNICIAN
├── Execute jobs
└── View own earnings 
3.2 Row Level Security (RLS)
RLS Implementation:
Enabled on all tables
Policies use auth.uid() for user context
Complex checks via helper functions
Service role key bypasses RLS (Edge Functions only)
Example Policies:
sql
-- Clients can only see their own requests
CREATE POLICY "Clients view own requests" 
ON service_requests 
FOR SELECT 
USING (client_id = auth.uid());

-- Pros can see requests in their category
CREATE POLICY "Pros view matching requests" 
ON service_requests 
FOR SELECT 
USING (
  professional_id = auth.uid() 
  OR (
    status IN ('pending', 'quoted') 
    AND category IN (
      SELECT category FROM professional_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Users can only see their own transactions
CREATE POLICY "Users view own transactions" 
ON transactions 
FOR SELECT 
USING (payer_id = auth.uid() OR payee_id = auth.uid()); 
3.3 API Authorization
Endpoint-Level Checks:
PostgREST enforces RLS automatically
Edge Functions use service role key (bypass RLS)
Custom authorization logic in Edge Functions
Example Edge Function Authorization:
typescript
// Check if user is platform admin
const isAdmin = await checkUserRole(userId, 'platform_admin');
if (!isAdmin) {
  return new Response('Forbidden', { status: 403 });
} 
6.4 DATA SECURITY
4.1 Encryption
At Rest:
Database: AES-256 encryption (Supabase managed via AWS KMS)
File storage: S3 server-side encryption (AES-256)
Backups: Encrypted at rest
In Transit:
All connections: TLS 1.3
Certificate: Let's Encrypt (auto-renewed)
HSTS: Enabled (max-age: 31536000)
Certificate pinning: Mobile apps (future)
4.2 PII Handling
PII Classification:
HIGH SENSITIVITY
├── Phone numbers
├── ID documents (CNI, passport)
├── Payment information
└── Location data (real-time)

MEDIUM SENSITIVITY
├── Names
├── Addresses
├── Email addresses
└── Transaction history

LOW SENSITIVITY
├── Profile photos
├── Job descriptions
└── Reviews 
PII Protection:
Phone numbers: Hashed in logs, encrypted in DB
ID documents: Deleted after verification, only hash retained
Location data: Deleted after 30 days (except active jobs)
Chat messages: Deleted after 1 year
Payment data: Never stored (tokenized by payment providers)
Data Minimization:
Collect only necessary data
Retain only as long as needed
Anonymize for analytics
4.3 Data Retention
Data Type
Retention
Disposal Method
User accounts
Until deletion
Soft delete (30 days), then hard delete
Transactions
5 years
Archive to cold storage
Chat messages
1 year
Automated deletion
GPS/location
30 days
Automated deletion
ID documents
Until verified
Deleted after verification
Audit logs
2 years
Archive, then delete
Backups
90 days
Automated rotation
4.4 Data Privacy Compliance
ARTCI (Côte d'Ivoire):
Register with ARTCI as data processor
Appoint local data protection officer
Comply with data localization requirements
GDPR Principles (Best Practice):
Lawful, fair, transparent processing
Purpose limitation
Data minimization
Accuracy
Storage limitation
Integrity and confidentiality
Accountability
User Rights:
Right to access: Export data as JSON
Right to rectification: Update profile
Right to erasure: Delete account
Right to portability: Data export
Right to object: Opt-out of marketing
6.5 APPLICATION SECURITY
5.1 Input Validation
Server-Side Validation:
All inputs validated via Zod schemas
Type checking, length limits, format validation
Sanitization for HTML/SQL injection
Example Zod Schema:
typescript
const createRequestSchema = z.object({
  category: z.enum(['electrician', 'plumber', 'ac_refrigeration', 'cleaner']),
  description: z.string().max(2000).optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()])
  }),
  address: z.string().min(5).max(200),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
  media_urls: z.array(z.string().url()).max(5).optional()
}); 
Client-Side Validation:
Fast feedback for users
Never trust client validation alone
Mirror server validation logic
5.2 SQL Injection Prevention
PostgREST:
All queries parameterized
No raw SQL in client code
RLS policies use safe functions
Edge Functions:
Use Supabase client library (parameterized)
Never concatenate SQL strings
Use prepared statements
5.3 XSS Prevention
React:
Automatic escaping of JSX
Never use dangerouslySetInnerHTML
Sanitize user-generated content
Content Security Policy (CSP):
http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://*.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://api.wave.com;
  frame-ancestors 'none'; 
5.4 CSRF Protection
Web:
SameSite=Strict cookies
CSRF tokens for state-changing operations
Origin header validation
Mobile:
JWT in Authorization header (not cookies)
No CSRF risk
6.6 PAYMENT SECURITY
6.1 PCI DSS Compliance
Scope Reduction:
No card data stored (mobile money only)
Payment processing delegated to providers
PCI DSS Level 1 compliance via Wave/Orange
Security Controls:
Tokenization: Payment providers handle sensitive data
Encryption: TLS 1.3 for all payment communications
Access control: Limited staff access to payment systems
Monitoring: Real-time fraud detection
6.2 Payment Fraud Prevention
Fraud Detection:
Velocity checks (multiple transactions in short time)
Geographic anomalies (IP vs. phone location mismatch)
Device fingerprinting
Behavioral analysis
Risk Scoring:
LOW RISK (0-30)
├── Verified user
├── Normal transaction pattern
└── Known device

MEDIUM RISK (31-70)
├── New user
├── Unusual amount
└── New device

HIGH RISK (71-100)
├── Multiple failed attempts
├── Geographic mismatch
├── Suspicious pattern
└── Requires manual review 
Actions:
Low: Process normally
Medium: Additional verification (SMS OTP)
High: Hold transaction, manual review
6.3 Escrow Security
Escrow Implementation:
Funds held in segregated trust account
Separate from operating funds
Daily reconciliation
Audit trail for all movements
Release Conditions:
Job marked complete by professional
Client confirms completion (or 48h auto-release)
No active dispute
All parties notified
Dispute Freeze:
Funds frozen immediately on dispute
Released per resolution
Audit log of all actions
6.7 INFRASTRUCTURE SECURITY
7.1 Cloud Security
Supabase:
SOC 2 Type II certified
AWS infrastructure (eu-west-3 Paris)
Automated backups and disaster recovery
DDoS protection
Cloudflare:
WAF rules (OWASP Top 10)
DDoS protection (L3/L4/L7)
Bot management
Rate limiting
7.2 Secrets Management
Secrets Storage:
Supabase secrets (environment variables)
GitHub secrets (CI/CD)
Never committed to repository
Rotated regularly (90 days)
Secret Types:
API keys (OpenAI, Twilio, Wave, Orange)
Database credentials (managed by Supabase)
JWT signing keys (managed by Supabase)
Webhook secrets
7.3 Network Security
Firewall Rules:
Allow: 443 (HTTPS), 5432 (PostgreSQL, internal only)
Deny: All other inbound
Egress: Restricted to known endpoints
IP Whitelisting:
Admin dashboard: Office IPs only
Database: Supabase IPs only
Webhooks: Provider IPs only
6.8 MONITORING & INCIDENT RESPONSE
8.1 Security Monitoring
Tools:
Sentry: Error tracking, performance monitoring
Datadog: Infrastructure monitoring, logs
Supabase: Database monitoring, auth logs
Cloudflare: WAF logs, security events
Alerts:
Critical: Error rate >1%, downtime, security breach
Warning: Unusual activity, failed login attempts
Info: Daily security digest
8.2 Incident Response Plan
Incident Severity:
SEVERITY 1 (Critical)
├── Data breach
├── Payment fraud
├── System compromise
└── Response: <15 minutes

SEVERITY 2 (High)
├── Service outage
├── Security vulnerability
├── DDoS attack
└── Response: <1 hour

SEVERITY 3 (Medium)
├── Suspicious activity
├── Failed intrusion attempt
├── Policy violation
└── Response: <4 hours

SEVERITY 4 (Low)
├── Minor security event
├── Configuration issue
└── Response: <24 hours Response Process:
1. DETECTION
   └── Automated alert or manual report

2. TRIAGE
   └── Assess severity, assign incident commander

3. CONTAINMENT
   └── Isolate affected systems
   └── Preserve evidence

4. ERADICATION
   └── Remove threat
   └── Patch vulnerability

5. RECOVERY
   └── Restore systems
   └── Verify integrity

6. POST-INCIDENT
   └── Root cause analysis
   └── Lessons learned
   └── Update procedures 
Communication:
Internal: Slack #incidents channel
External: Status page, email to affected users
Regulatory: ARTCI notification within 72 hours (if data breach)
8.3 Security Testing
Regular Testing:
Vulnerability scans: Weekly (automated)
Penetration testing: Quarterly (third-party)
Code review: Every PR (security checklist)
Dependency scanning: Daily (Dependabot/Snyk)
Bug Bounty Program (Future):
Platform: HackerOne
Scope: Web and mobile apps
Rewards: $100-$10,000 based on severity
6.9 SECURITY CHECKLIST
Pre-Launch
RLS enabled on all tables
Input validation on all endpoints
HTTPS enforced everywhere
Secrets not in code
CORS configured correctly
Rate limiting implemented
Error messages don't leak info
Logging doesn't include PII
Backup and recovery tested
Incident response plan documented
Security monitoring configured
Terms of service and privacy policy published
ARTCI registration complete
Ongoing
Dependency updates (weekly)
Vulnerability scans (weekly)
Penetration testing (quarterly)
Security training (quarterly)
Access review (quarterly)
Incident response drill (bi-annually)
Policy review (annually)