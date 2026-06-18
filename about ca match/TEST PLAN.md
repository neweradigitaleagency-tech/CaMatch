Document ID: CM-TEST-001
Version: 1.0
Date: June 17, 2026
7.1 TEST STRATEGY
1.1 Testing Philosophy
Principles:
Shift Left: Test early, test often
Automation First: Automate repetitive tests
Risk-Based: Focus on critical paths
User-Centric: Test real user scenarios
Continuous: Integrate testing into CI/CD
1.2 Test Levels
┌─────────────────────────────────────────┐
│ Level 4: ACCEPTANCE TESTING             │
│ • UAT with real users                   │
│ • Beta testing                          │
│ • Business validation                   │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│ Level 3: SYSTEM TESTING                 │
│ • End-to-end flows                      │
│ • Integration testing                   │
│ • Performance testing                   │
│ • Security testing                      │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│ Level 2: INTEGRATION TESTING            │
│ • API integration                       │
│ • Database integration                  │
│ • Third-party services                  │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│ Level 1: UNIT TESTING                   │
│ • Functions and components              │
│ • Business logic                        │
│ • Database functions                    │
└─────────────────────────────────────────┘ 
1.3 Test Types
Functional Testing:
Unit tests
Integration tests
System tests
Acceptance tests
Non-Functional Testing:
Performance testing
Load testing
Security testing
Usability testing
Accessibility testing
Compatibility testing
Specialized Testing:
Payment flow testing
Offline mode testing
Real-time updates testing
AI model testing
Localization testing
7.2 TEST ENVIRONMENTS
2.1 Environment Strategy
Development:
Local Supabase instance
Mock external services
Test data seeded
Purpose: Developer testing
Staging:
Supabase staging project
Anonymized production data
Real external services (sandbox mode)
Purpose: Integration testing, QA
Production:
Supabase production project
Real data
Real external services
Purpose: Live system
2.2 Test Data Management
Data Generation:
Factories for all entities (users, jobs, transactions)
Realistic Ivorian names, addresses, phone numbers
Geographic distribution across Abidjan communes
Data Seeding:
typescript
// Example: Seed test professionals
const seedProfessionals = async () => {
  const categories = ['electrician', 'plumber', 'ac_refrigeration', 'cleaner'];
  const communes = ['Cocody', 'Plateau', 'Yopougon', 'Abobo', 'Marcory'];
  
  for (let i = 0; i < 100; i++) {
    await supabase.from('professional_profiles').insert({
      user_id: uuidv4(),
      first_name: ivorianNames[Math.floor(Math.random() * ivorianNames.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      location: generateRandomPoint(abidjanBounds),
      // ...
    });
  }
}; 
Data Isolation:
Each test run uses unique data
Cleanup after tests
No shared state between tests
7.3 UNIT TESTING
3.1 Coverage Targets
Overall: 80% code coverage
Critical paths: 95% (payments, auth, matching)
Edge Functions: 90%
Database functions: 100%
3.2 Unit Test Examples
Client App (React Native + Jest):
typescript
// __tests__/components/ProCard.test.tsx
describe('ProCard', () => {
  it('renders professional info correctly', () => {
    const pro = {
      name: 'Kouassi Électricien',
      rating: 4.9,
      distance: '1.2 km',
      price: '2 500 XOF/h'
    };
    
    const { getByText } = render(<ProCard pro={pro} />);
    
    expect(getByText('Kouassi Électricien')).toBeTruthy();
    expect(getByText('⭐ 4.9')).toBeTruthy();
    expect(getByText('1.2 km')).toBeTruthy();
  });
  
  it('shows verification badge', () => {
    const pro = { /* ... */ verification_level: 'certified' };
    const { getByTestId } = render(<ProCard pro={pro} />);
    expect(getByTestId('verification-badge')).toBeTruthy();
  });
}); 
Edge Function (Deno + Jest):
typescript
// tests/edge-functions/ai-categorize.test.ts
describe('AI Categorization', () => {
  it('categorizes plumbing request correctly', async () => {
    const input = {
      text_input: 'Fuite d'eau sous l'évier',
      image_urls: []
    };
    
    const result = await categorizeRequest(input);
    
    expect(result.category).toBe('plumber');
    expect(result.confidence_score).toBeGreaterThan(0.8);
  });
  
  it('handles low confidence with fallback', async () => {
    const input = {
      text_input: 'Problème bizarre',
      image_urls: []
    };
    
    const result = await categorizeRequest(input);
    
    expect(result.confidence_score).toBeLessThan(0.7);
    expect(result.needs_manual_review).toBe(true);
  });
}); 
Database Function (PL/pgSQL):
sql
-- tests/sql/test_get_nearby_pros.sql
BEGIN;

-- Setup test data
INSERT INTO professional_profiles (user_id, category, location, ...)
VALUES 
  ('pro1', 'electrician', ST_MakePoint(-3.98, 5.35)::geography, ...),
  ('pro2', 'electrician', ST_MakePoint(-3.97, 5.36)::geography, ...),
  ('pro3', 'plumber', ST_MakePoint(-3.98, 5.35)::geography, ...);

-- Test: Get nearby electricians
SELECT * FROM get_nearby_pros(
  ST_MakePoint(-3.98, 5.35)::geography,
  'electrician',
  10,
  10
) AS result;

-- Assertions
-- Should return 2 electricians, not the plumber
-- Should be ordered by distance

-- Cleanup
DELETE FROM professional_profiles WHERE user_id IN ('pro1', 'pro2', 'pro3');

COMMIT; 7.4 INTEGRATION TESTING
4.1 API Integration Tests
Test Framework: Jest + Supertest
typescript
// tests/integration/api/service-requests.test.ts
describe('Service Requests API', () => {
  let clientToken: string;
  let clientId: string;
  
  beforeAll(async () => {
    // Create test client
    const { token, user } = await createTestUser('client');
    clientToken = token;
    clientId = user.id;
  });
  
  describe('POST /rest/v1/service_requests', () => {
    it('creates request successfully', async () => {
      const response = await request(app)
        .post('/rest/v1/service_requests')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          client_id: clientId,
          category: 'plumber',
          description: 'Fuite d'eau',
          location: { type: 'Point', coordinates: [-3.98, 5.35] },
          address: 'Cocody, Rue des Jardins'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('pending');
    });
    
    it('rejects invalid category', async () => {
      const response = await request(app)
        .post('/rest/v1/service_requests')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          category: 'invalid_category',
          // ...
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/rest/v1/service_requests')
        .send({ /* ... */ });
      
      expect(response.status).toBe(401);
    });
  });
}); 4.2 Payment Integration Tests
Test Framework: Jest + Mock payment providers
typescript
// tests/integration/payments/wave-payment.test.ts
describe('Wave Payment Flow', () => {
  it('completes full payment cycle', async () => {
    // 1. Create payment intent
    const intent = await createPaymentIntent({
      job_id: testJobId,
      amount: 20000,
      method: 'wave'
    });
    
    expect(intent.status).toBe('pending');
    
    // 2. Simulate Wave webhook (payment completed)
    const webhookPayload = {
      event: 'payment.completed',
      transaction_id: 'wave_test_123',
      amount: 20000,
      metadata: { intent_id: intent.id }
    };
    
    const webhookResponse = await request(app)
      .post('/functions/v1/webhook-wave')
      .set('X-Wave-Signature', generateSignature(webhookPayload))
      .send(webhookPayload);
    
    expect(webhookResponse.status).toBe(200);
    
    // 3. Verify payment intent updated
    const updatedIntent = await getPaymentIntent(intent.id);
    expect(updatedIntent.status).toBe('captured');
    
    // 4. Verify transaction created
    const transaction = await getTransactionByJob(testJobId);
    expect(transaction.amount).toBe(20000);
    expect(transaction.platform_fee).toBe(2400); // 12%
  });
  
  it('handles payment failure', async () => {
    // Simulate failure webhook
    // Verify status updated to 'failed'
    // Verify user notified
  });
}); 
4.3 Real-Time Integration Tests
Test Framework: Jest + Supabase Realtime client
typescript
// tests/integration/realtime/job-updates.test.ts
describe('Real-Time Job Updates', () => {
  it('broadcasts job status changes', async () => {
    const client = createSupabaseClient(clientToken);
    
    // Subscribe to job updates
    const updates: any[] = [];
    client
      .channel('job-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', table: 'service_requests', filter: `id=eq.${testJobId}` },
        (payload) => updates.push(payload.new)
      )
      .subscribe();
    
    // Wait for subscription
    await delay(1000);
    
    // Update job status
    await supabase
      .from('service_requests')
      .update({ status: 'in_progress' })
      .eq('id', testJobId);
    
    // Wait for broadcast
    await delay(2000);
    
    // Verify received update
    expect(updates.length).toBe(1);
    expect(updates[0].status).toBe('in_progress');
  });
}); 
7.5 END-TO-END TESTING
5.1 E2E Test Framework
Tool: Detox (React Native) + Playwright (Web)
5.2 Critical User Flows
Flow 1: Client Books Service
typescript
// e2e/flows/client-booking.spec.ts
describe('Client Booking Flow', () => {
  it('completes full booking journey', async () => {
    // 1. Login
    await loginAsClient();
    
    // 2. Search for electrician
    await element(by.id('search-bar')).tap();
    await element(by.id('search-input')).typeText('électricien');
    await element(by.id('search-button')).tap();
    
    // 3. Select professional
    await element(by.id('pro-card-0')).tap();
    
    // 4. View profile
    await expect(element(by.id('pro-profile'))).toBeVisible();
    
    // 5. Create request
    await element(by.id('book-button')).tap();
    await element(by.id('description-input')).typeText('Installation prises');
    await element(by.id('submit-request')).tap();
    
    // 6. Receive quote
    await waitFor(element(by.id('quote-card')))
      .toBeVisible()
      .withTimeout(10000);
    
    // 7. Accept quote
    await element(by.id('accept-quote')).tap();
    
    // 8. Pay
    await element(by.id('pay-wave')).tap();
    await confirmPayment(); // Simulate Wave payment
    
    // 9. Verify booking confirmed
    await expect(element(by.id('booking-confirmed'))).toBeVisible();
  });
}); 
Flow 2: Professional Executes Job
typescript
// e2e/flows/pro-job-execution.spec.ts
describe('Professional Job Execution', () => {
  it('completes job from acceptance to payment', async () => {
    // 1. Login as pro
    await loginAsProfessional();
    
    // 2. Receive job alert
    await waitFor(element(by.id('job-alert')))
      .toBeVisible()
      .withTimeout(10000);
    
    // 3. Accept job
    await element(by.id('accept-job')).tap();
    
    // 4. Navigate to client
    await element(by.id('navigate-button')).tap();
    // Verify maps app opened
    
    // 5. Check in
    await element(by.id('check-in-button')).tap();
    await takeBeforePhotos(); // Simulate camera
    
    // 6. Complete job
    await completeChecklist();
    await takeAfterPhotos();
    await element(by.id('complete-job')).tap();
    
    // 7. Verify payment received
    await waitFor(element(by.id('payment-received')))
      .toBeVisible()
      .withTimeout(10000);
  });
}); 
7.6 PERFORMANCE TESTING
6.1 Load Testing
Tool: k6
Scenarios:
javascript
// k6-scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay
    { duration: '2m', target: 200 },  // Ramp up more
    { duration: '5m', target: 200 },  // Stay
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  // Simulate search
  const searchRes = http.get('https://api.camatch.ci/rest/v1/professional_profiles?category=eq.electrician');
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
    'search time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
  
  // Simulate request creation
  const createRes = http.post(
    'https://api.camatch.ci/rest/v1/service_requests',
    JSON.stringify({ /* ... */ }),
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
  );
  check(createRes, {
    'create status 201': (r) => r.status === 201,
    'create time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(2);
} 
Performance Targets:
API response time: <500ms (95th percentile)
Search: <300ms
Matching algorithm: <500ms
Mobile app load: <3s on 3G
Concurrent users: 10,000
6.2 Stress Testing
Goal: Find breaking point
Gradually increase load until system fails
Identify bottlenecks
Test recovery
7.7 SECURITY TESTING
7.1 Automated Security Scans
Tools:
Snyk: Dependency vulnerabilities
SonarQube: Code quality + security
OWASP ZAP: Web app scanning
Frequency:
Dependency scan: Every PR
Code scan: Every PR
Full scan: Weekly
7.2 Penetration Testing
Scope:
Web application
Mobile apps
APIs
Authentication/authorization
Payment flows
Frequency: Quarterly (third-party)
7.3 Security Test Cases
typescript
// tests/security/authentication.test.ts
describe('Authentication Security', () => {
  it('prevents brute force OTP attempts', async () => {
    const phone = '+2250708091010';
    
    // Attempt 6 wrong OTPs
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/auth/v1/verify')
        .send({ phone, token: '000000' });
    }
    
    // 7th attempt should be blocked
    const response = await request(app)
      .post('/auth/v1/verify')
      .send({ phone, token: '000000' });
    
    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('RATE_LIMITED');
  });
  
  it('prevents JWT token reuse after refresh', async () => {
    const { accessToken, refreshToken } = await login();
    
    // Use refresh token
    const refreshRes = await request(app)
      .post('/auth/v1/refresh')
      .send({ refresh_token: refreshToken });
    
    expect(refreshRes.status).toBe(200);
    
    // Try to use old refresh token again
    const reuseRes = await request(app)
      .post('/auth/v1/refresh')
      .send({ refresh_token: refreshToken });
    
    expect(reuseRes.status).toBe(401);
  });
}); 
7.8 ACCEPTANCE TESTING
8.1 User Acceptance Testing (UAT)
Participants:
20 clients (diverse demographics)
20 professionals (mix of independent and business)
5 enterprise users
5 admin users
Duration: 2 weeks before launch
Process:
Onboarding session (1 hour)
Guided scenarios (2 hours)
Free exploration (1 week)
Feedback collection (surveys, interviews)
Success Criteria:
80% task completion rate
NPS > 40
Critical bugs < 5
No blockers for launch
8.2 Beta Testing
Closed Beta:
100 users (50 clients, 50 pros)
Cocody only
4 weeks duration
Weekly feedback sessions
Open Beta:
1000 users
All Abidjan
4 weeks duration
In-app feedback
7.9 TEST AUTOMATION
9.1 CI/CD Integration
GitHub Actions Workflow:
yaml
name: Test

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run unit tests
        run: npm test
      - name: Upload coverage
        run: npm run coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - name: Run integration tests
        run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - name: Run E2E tests
        run: npm run test:e2e
      
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Run Snyk scan
        uses: snyk/actions/node@master
      - name: Run OWASP ZAP
        uses: zaproxy/action-full-scan@v0.4.0 
9.2 Test Reports
Metrics:
Test coverage (%)
Pass/fail rate
Execution time
Flaky tests
Bug detection rate
Reporting:
Daily summary to Slack
Weekly report to stakeholders
Dashboard in CI/CD