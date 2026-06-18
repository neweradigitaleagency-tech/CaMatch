Document ID: CM-ARCH-001
Version: 1.0
Date: June 17, 2026
2.1 SYSTEM OVERVIEW
1.1 Architecture Style
Ça Match uses a modular monolith architecture initially, with clear boundaries for future microservices extraction. The system is built on a Backend-as-a-Service (BaaS) model using Supabase, which provides:
PostgreSQL database with extensions (PostGIS, pgvector)
Auto-generated REST API (PostgREST)
Real-time subscriptions (WebSockets)
Edge Functions (Deno) for custom logic
Authentication and authorization
File storage (S3-compatible)
1.2 High-Level Architecture Diagram
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Mobile App   │  │ Mobile App   │  │ Web Dashboard        │  │
│  │ (Client)     │  │ (Pro)        │  │ (Admin/Enterprise)   │  │
│  │ React Native │  │ React Native │  │ Next.js              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          └─────────────────┼──────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Cloudflare CDN │
                    │ + WAF + DDoS   │
                    └───────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼─────────┐ ┌────▼─────┐ ┌────────▼────────┐
│  Supabase API     │ │ Edge     │ │ Realtime        │
│  (PostgREST)      │ │ Functions│ │ (WebSockets)    │
│  REST + GraphQL   │ │ (Deno)   │ │                 │
└─────────┬─────────┘ └────┬─────┘ └────────┬────────┘
          │                │                 │
          └────────────────┼─────────────────┘
                           │
              ┌────────────▼────────────┐
              │   PostgreSQL Database   │
              │   + PostGIS + pgvector  │
              │   + Row Level Security  │
              └────────────┬────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
┌─────────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ External APIs  │ │ AI Services │ │ Payments    │
│ - Wave         │ │ - OpenAI    │ │ - Orange    │
│ - Orange Money │ │ - Whisper   │ │ - MTN       │
│ - Twilio       │ │             │ │             │
│ - Firebase     │ │             │ │             │
└────────────────┘ └─────────────┘ └─────────────┘ 
1.3 Key Architectural Principles
P1: Mobile-First, Offline-First
All mobile apps designed for 3G networks and intermittent connectivity
Local data caching with conflict resolution
Optimistic UI updates with rollback capability
P2: Security by Design
Row Level Security (RLS) on all database tables
No business logic in client code
All sensitive operations via Edge Functions with service role key
P3: Scalability Through Simplicity
Stateless Edge Functions for horizontal scaling
Database connection pooling
CDN for static assets and media
P4: Cost Optimization
Serverless architecture (pay-per-use)
Aggressive caching (Redis, CDN)
Image compression and lazy loading
P5: Observability
Structured logging (JSON)
Distributed tracing
Real-time monitoring and alerting
2.2 COMPONENT ARCHITECTURE
2.1 Client Applications
2.1.1 Mobile App (Client)
Framework: React Native with Expo
State Management: React Query (server state) + Zustand (client state)
Navigation: React Navigation (bottom tabs + stack)
Offline Storage: WatermelonDB (SQLite-based)
Key Features:
Geolocation-based search
AI-powered request creation (text/voice/image)
Real-time job tracking
Mobile money payments
In-app chat with translation
2.1.2 Mobile App (Professional)
Framework: React Native with Expo
Offline-First: Local job queue, photo capture, sync on reconnect
Battery Optimization: Background location only during active jobs
Key Features:
Job acceptance/rejection with countdown timers
Turn-by-turn navigation
Job execution checklists
Photo proof capture
Earnings dashboard
Team management (for business accounts)
2.1.3 Web Dashboard (Admin/Enterprise)
Framework: Next.js 14 (App Router)
UI Library: shadcn/ui + Tailwind CSS
Charts: Recharts + D3.js
Maps: Mapbox GL JS
Key Features:
Real-time metrics dashboard
User and job management
Financial reconciliation
Content moderation queue
Multi-site enterprise management
2.2 Backend Services
2.2.1 Supabase Platform
Database Layer:
PostgreSQL 15+: Core relational database
PostGIS 3.3+: Geospatial queries and indexing
pgvector 0.5+: Vector embeddings for AI search
Extensions: uuid-ossp, pgcrypto, pg_trgm
API Layer:
PostgREST: Auto-generated REST API from database schema
Filtering: Query parameters (e.g., ?category=eq.electrician&rating=gte.4.5)
Pagination: Limit/offset or cursor-based
Embedding: Foreign key relationships (e.g., ?select=*,professional_profiles(*))
Full-Text Search: tsvector columns with GIN indexes
Edge Functions:
Runtime: Deno (TypeScript)
Use Cases:
AI request categorization
Payment webhook processing
Complex matching algorithms
Scheduled jobs (cron)
Deployment: Supabase CLI + GitHub Actions
Realtime:
Protocol: WebSockets
Channels:
job_updates:{job_id} - Job status changes
chat:{conversation_id} - New messages
job_requests:{commune} - New job broadcasts
Authorization: RLS policies applied to subscriptions
Storage:
Buckets:
avatars - User profile pictures
job-media - Before/after photos, videos
documents - ID cards, certifications, invoices
Access Control: Signed URLs with expiration
CDN: Cloudflare caching
Authentication:
Methods: Phone OTP, Email/Password, Magic Link
Sessions: JWT tokens (7-day expiration)
MFA: SMS OTP for sensitive operations
Integration: RLS policies use auth.uid()
2.2.2 External Service Integrations
Payment Gateways:
Wave: Primary (zero-fee, deep links)
Orange Money: Secondary (wider reach)
MTN Mobile Money: Tertiary (USSD fallback)
Integration Pattern:
Create payment intent in database
Call provider API to initiate
Receive webhook on completion
Update database and notify users
Communication Services:
Firebase Cloud Messaging: Push notifications
Twilio: SMS (OTP, fallback notifications)
WhatsApp Business API: High-engagement notifications
SendGrid: Email (invoices, reports)
AI/ML Services:
OpenAI GPT-4o-mini: Text categorization, chat support
OpenAI Whisper: Voice note transcription
OpenAI GPT-4o Vision: Image analysis (damage assessment, quality scoring)
Custom Models: XGBoost for pricing prediction (hosted on AWS SageMaker)
Mapping and Location:
Mapbox GL: Maps and geocoding
Native Location Services: GPS tracking
PostGIS: Spatial queries and indexing
2.3 DATA ARCHITECTURE
3.1 Database Schema Overview
Core Tables:
users - Authentication and basic profile
client_profiles - Client-specific data
professional_profiles - Professional-specific data
service_requests - Job requests from clients
quotes - Price quotes from professionals
jobs - Execution details and proof
reviews - Ratings and feedback
transactions - Payment ledger
conversations & messages - Chat system
notifications - Notification log
Business/Enterprise Tables:
business_profiles - SME professional accounts
enterprise_profiles - Enterprise client accounts
enterprise_sites - Multi-site management
AI Tables:
ai_request_embeddings - Vector embeddings for semantic search
ai_pricing_models - ML model weights and versions
ai_professional_rankings - Match scoring results
System Tables:
audit_logs - Immutable audit trail
roles & user_roles - RBAC implementation
3.2 Data Flow Patterns
3.2.1 Service Request Flow:
Client App → Edge Function (AI categorization) → service_requests table
→ Matching Algorithm → ai_professional_rankings table
→ Notifications → Professional Apps
→ Quote Submission → quotes table
→ Client Acceptance → jobs table + payment_intents table
→ Job Execution → jobs table (photos, checklist)
→ Completion → transactions table + payouts table 
3.2.2 Payment Flow:
Client initiates payment → payment_intents table (status: pending)
→ Payment Provider API → Provider holds funds
→ Webhook received → Edge Function validates signature
→ payment_intents table (status: captured)
→ Job completed → Escrow released
→ payouts table (status: processing)
→ Payment Provider API → Funds transferred to professional
→ Webhook received → payouts table (status: completed) 
3.2.3 Real-Time Updates:
Database change → Supabase Realtime → WebSocket broadcast
→ Client/Pro apps receive update → UI re-render 
3.3 Data Partitioning and Archival
Partitioning Strategy:
service_requests: Partition by created_at (monthly)
transactions: Partition by created_at (monthly)
audit_logs: Partition by created_at (quarterly)
Archival Policy:
Hot data (last 3 months): Primary database
Warm data (3-12 months): Read replicas
Cold data (>12 months): Archived to S3, deleted from DB
Chat messages: Deleted after 1 year
GPS data: Deleted after 30 days
3.4 Backup and Recovery
Backup Strategy:
Point-in-Time Recovery (PITR): Continuous WAL archiving
Daily Snapshots: Full database backup at 2 AM UTC
Retention: 30 days for PITR, 90 days for snapshots
Off-site: Backups replicated to different AWS region
Recovery Objectives:
RPO (Recovery Point Objective): <5 minutes (PITR)
RTO (Recovery Time Objective): <1 hour
2.4 SECURITY ARCHITECTURE
4.1 Defense in Depth
Layer 1: Network Security
Cloudflare WAF (Web Application Firewall)
DDoS protection
IP whitelisting for admin endpoints
TLS 1.3 enforcement
Layer 2: Application Security
Input validation (Zod schemas)
SQL injection prevention (parameterized queries via PostgREST)
XSS prevention (React escaping)
CSRF protection (SameSite cookies)
Layer 3: Data Security
Row Level Security (RLS) on all tables
Encryption at rest (AES-256, managed by Supabase/AWS)
Encryption in transit (TLS 1.3)
PII hashing in logs
Layer 4: Authentication & Authorization
Phone OTP for login
JWT tokens with short expiration
Role-based access control (RBAC)
Principle of least privilege
Layer 5: Monitoring & Incident Response
Real-time alerting (Sentry, Datadog)
Audit logging for all sensitive operations
Automated anomaly detection
Incident response playbook
4.2 API Security
Authentication:
All API requests require valid JWT in Authorization: Bearer <token> header
Edge Functions use service role key (never exposed to client)
Rate Limiting:
Implemented at Cloudflare and Edge Function levels
Limits vary by endpoint (see PRD Section 17)
Exponential backoff for retries
Webhook Security:
All webhooks include HMAC-SHA256 signature in header
Signature verified before processing
Replay attack prevention (timestamp validation)
4.3 Data Privacy
PII Handling:
Phone numbers: Hashed in logs, encrypted in database
ID documents: Deleted after verification, only hash retained
Location data: Deleted after 30 days
Chat messages: Deleted after 1 year
User Rights:
Data export: JSON download via app settings
Account deletion: Soft delete (30-day grace period), then hard delete
Consent management: Granular opt-in for notifications, marketing
Compliance:
ARTCI (Côte d'Ivoire telecom regulator)
GDPR principles (as best practice)
BCEAO (financial regulations)
2.5 SCALABILITY ARCHITECTURE
5.1 Horizontal Scaling
Stateless Components:
Edge Functions: Auto-scale based on request volume
Web servers: Load balanced via Cloudflare
WebSocket connections: Distributed across Supabase Realtime nodes
Database Scaling:
Read Replicas: For read-heavy workloads (search, dashboards)
Connection Pooling: PgBouncer (managed by Supabase)
Partitioning: Large tables partitioned by date
Indexing: Strategic indexes on high-query columns
Caching Strategy:
CDN: Cloudflare for static assets, images, API responses
Application Cache: React Query (5-minute stale-while-revalidate)
Database Cache: PostgreSQL shared buffers (25% of RAM)
5.2 Geographic Scaling
Multi-Region Deployment:
Phase 1: Single region (AWS eu-west-3 Paris for low latency to Abidjan)
Phase 2: Add region in West Africa (when expanding to Dakar, Accra)
Phase 3: Multi-region active-active (for pan-African scale)
Data Localization:
User data stored in region of residence (for compliance)
Cross-region replication for disaster recovery
Geo-routing via Cloudflare
5.3 Performance Optimization
Frontend:
Code splitting (React.lazy)
Image optimization (WebP, lazy loading)
Bundle size <500KB (gzipped)
Skeleton screens for perceived performance
Backend:
Database query optimization (EXPLAIN ANALYZE)
N+1 query prevention (eager loading)
Background jobs for heavy operations (AI processing, email sending)
Async/await for I/O-bound operations
Mobile:
Offline-first architecture
Aggressive caching (WatermelonDB)
Image compression before upload
Minimal re-renders (React.memo, useMemo)
2.6 DEPLOYMENT ARCHITECTURE
6.1 CI/CD Pipeline
GitHub Actions Workflow:
yaml
name: Deploy Ça Match

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Supabase Staging
        run: npx supabase deploy --project-ref ${{ secrets.SUPABASE_PROJECT_STAGING }}
      
  deploy-prod:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Supabase Production
        run: npx supabase deploy --project-ref ${{ secrets.SUPABASE_PROJECT_PROD }} Deployment Steps:
Run unit and integration tests
Run database migrations
Deploy Edge Functions
Deploy web app (Vercel)
Deploy mobile apps (Expo EAS)
Run smoke tests
Monitor for errors (Sentry)
6.2 Environment Management
Environments:
Development: Local Supabase instance, test data
Staging: Supabase staging project, anonymized prod data
Production: Supabase production project, real data
Secrets Management:
Supabase secrets (via dashboard or CLI)
GitHub secrets (for CI/CD)
Never committed to repository
Feature Flags:
PostHog for feature flagging
Gradual rollout (10% → 50% → 100%)
Instant rollback capability
6.3 Monitoring and Observability
Metrics:
Application: Request rate, error rate, latency (Sentry)
Infrastructure: CPU, memory, disk, network (Supabase dashboard)
Business: GMV, active users, conversion rate (PostHog)
Logging:
Structured JSON logs
Correlation IDs for request tracing
Log levels: ERROR, WARN, INFO, DEBUG
Retention: 30 days in Supabase, 90 days in Datadog
Alerting:
Critical: Error rate >1%, latency >2s, downtime (PagerDuty)
Warning: Error rate >0.5%, latency >1s (Slack)
Info: Daily digest emails
2.7 DISASTER RECOVERY
7.1 Failure Scenarios
Scenario 1: Database Corruption
Detection: Automated integrity checks
Recovery: Restore from PITR to last known good state
RTO: <1 hour
Scenario 2: Payment Provider Outage
Detection: Webhook failures, API timeouts
Recovery:
Switch to backup provider (Wave ↔ Orange Money)
Enable cash payment mode
Queue transactions for retry
RTO: <5 minutes (automatic failover)
Scenario 3: AI Service Outage
Detection: OpenAI API errors
Recovery:
Fallback to rule-based categorization
Queue AI requests for retry
Manual triage queue
RTO: Immediate (graceful degradation)
Scenario 4: Regional Outage (AWS Paris)
Detection: Supabase health checks
Recovery:
Failover to backup region (AWS Frankfurt)
DNS update via Cloudflare
Data replication lag <5 minutes
RTO: <30 minutes
7.2 Backup Strategy
Database Backups:
Continuous: WAL archiving (PITR)
Daily: Full snapshot at 2 AM UTC
Weekly: Off-site backup to different cloud provider
Monthly: Archived to cold storage (S3 Glacier)
File Storage Backups:
Continuous: S3 versioning enabled
Daily: Cross-region replication
Retention: 90 days
Configuration Backups:
Infrastructure as Code: Terraform/Supabase CLI
Secrets: Encrypted backups in AWS Secrets Manager
Version Control: All configs in Git