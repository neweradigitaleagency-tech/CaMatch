import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_USERS = [
  { email: "marie@camatch.ci", phone: "+2250102030405", password: "Test123456", meta: { role: "client", first_name: "Marie", last_name: "Kouadio" } },
  { email: "koffi@camatch.ci", phone: "+2250745881201", password: "Test123456", meta: { role: "professional", first_name: "Koffi", last_name: "Kouamé" } },
  { email: "ismael@camatch.ci", phone: "+2250532994402", password: "Test123456", meta: { role: "professional", first_name: "Ismaël", last_name: "Koné" } },
  { email: "mamadou@camatch.ci", phone: "+2250789451203", password: "Test123456", meta: { role: "professional", first_name: "Mamadou", last_name: "K." } },
  { email: "fatou@camatch.ci", phone: "+2250544112204", password: "Test123456", meta: { role: "professional", first_name: "Fatou", last_name: "Touré" } },
];

async function seed() {
  console.log("🌱 Seeding Ça Match database...\n");

  // 1. Create auth users
  const userIds: Record<string, string> = {};
  for (const u of SEED_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email, phone: u.phone, password: u.password,
      email_confirm: true, phone_confirm: true,
      user_metadata: u.meta,
    });
    if (error && !error.message.includes("already exists")) {
      console.log(`  ⚠️  ${u.email}: ${error.message}`);
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users.find((x) => x.email === u.email);
      if (found) { userIds[u.email] = found.id; console.log(`  → Found existing: ${found.id}`); }
      continue;
    }
    if (data) { userIds[u.email] = data.user.id; console.log(`  ✅ ${u.email}: ${data.user.id}`); }
  }

  // 2. public.users
  for (const u of SEED_USERS) {
    const id = userIds[u.email];
    if (!id) { console.log(`  ❌ No auth user for ${u.email}`); continue; }
    await supabase.from("users").upsert({
      id, email: u.email, phone_number: u.phone, phone_number_hash: u.phone,
      role: u.meta.role, is_active: true, is_verified: true,
    }, { onConflict: "id", ignoreDuplicates: false });
    console.log(`  ✅ public.users: ${u.email}`);
  }

  const clientId = userIds["marie@camatch.ci"];
  const proIds = [null, userIds["koffi@camatch.ci"], userIds["ismael@camatch.ci"], userIds["mamadou@camatch.ci"], userIds["fatou@camatch.ci"]];
  console.log(`\n  IDs — client: ${clientId}, pros: ${proIds.slice(1).join(", ")}`);

  // 3. Client profile
  if (clientId) {
    await supabase.from("client_profiles").upsert({
      user_id: clientId, first_name: "Marie", last_name: "Kouadio",
      default_address: "Cocody Riviera 3, Abidjan",
      notification_preferences: { push: true, sms: true, email: false, whatsapp: true },
    }, { onConflict: "user_id" });
    console.log("  ✅ client_profiles: Marie");
  }

  // 4. Pro profiles
  const pros = [
    { email: "koffi@camatch.ci", bn: "Koffi Électricité", fn: "Koffi", ln: "Kouamé", cat: "electrician", hr: 12000, bio: "Installations triphasées, dépannages haute et basse tension dans tout Cocody et Plateau. Diplômé de l'INP-HB.", rating: 4.9, jobs: 140, vl: "certified" },
    { email: "ismael@camatch.ci", bn: "Koné Plomberie", fn: "Ismaël", ln: "Koné", cat: "plumber", hr: 10000, bio: "Spécialisé en réparation de fuites, débouchages urgents, robinetteries suspendues et raccordements sanitaires.", rating: 4.8, jobs: 95, vl: "id" },
    { email: "mamadou@camatch.ci", bn: "Clim Expert CI", fn: "Mamadou", ln: "K.", cat: "ac_refrigeration", hr: 15000, bio: "Expert certifié avec 8+ ans d'expérience. Spécialiste Samsung, LG, Sharp, Carrier.", rating: 4.9, jobs: 120, vl: "certified" },
    { email: "fatou@camatch.ci", bn: "Fatou Cleaning", fn: "Fatou", ln: "Touré", cat: "cleaner", hr: 8000, bio: "Nettoyage résidentiel et de bureaux. Désinfection et remises au propre complètes.", rating: 4.7, jobs: 80, vl: "background" },
  ];
  for (const p of pros) {
    const id = userIds[p.email];
    if (!id) continue;
    await supabase.from("professional_profiles").upsert({
      user_id: id, business_name: p.bn, first_name: p.fn, last_name: p.ln,
      category: p.cat, bio: p.bio, hourly_rate: p.hr, min_job_price: 5000,
      verification_level: p.vl, rating: p.rating, total_jobs: p.jobs,
      total_earned: p.jobs * p.hr * 4, is_available: true, is_online: true,
      service_radius_km: 15, wallet_balance: p.jobs * p.hr * 2, pending_balance: p.jobs * p.hr,
    }, { onConflict: "user_id" });
    console.log(`  ✅ professional_profiles: ${p.bn}`);
  }

  // 5. Service Requests (direct SQL via service_role bypasses RLS)
  if (clientId && proIds[3]) {
    const { error: e1 } = await supabase.from("service_requests").insert({
      client_id: clientId, professional_id: proIds[3], category: "ac_refrigeration",
      description: "Le split ne souffle que de l'air chaud, besoin d'un diagnostic et recharge fréon si nécessaire.",
      address: "Cocody Riviera 3, Abidjan", location: "SRID=4326;POINT(-4.0083 5.3221)",
      status: "in_progress", urgency: "high",
      estimated_price_min: 25000, estimated_price_max: 45000, final_price: 35000,
    });
    if (e1) console.log(`  ❌ req1: ${e1.message}`); else console.log(`  ✅ req: Climatisation`);

    const { error: e2 } = await supabase.from("service_requests").insert({
      client_id: clientId, category: "electrician",
      description: "Prise dans la chambre principale ne fonctionne plus et fait des étincelles.",
      address: "Cocody Riviera 3, Abidjan", location: "SRID=4326;POINT(-4.0083 5.3221)",
      status: "pending", urgency: "emergency",
      estimated_price_min: 8000, estimated_price_max: 15000,
    });
    if (e2) console.log(`  ❌ req2: ${e2.message}`); else console.log(`  ✅ req: Prise grillée`);

    const { error: e3 } = await supabase.from("service_requests").insert({
      client_id: clientId, category: "cleaner",
      description: "Ménage complet pour appartement 3 pièces à Cocody. Produits inclus.",
      address: "Cocody Angré, Abidjan", location: "SRID=4326;POINT(-4.001 5.315)",
      status: "pending", urgency: "medium",
      estimated_price_min: 20000, estimated_price_max: 30000,
    });
    if (e3) console.log(`  ❌ req3: ${e3.message}`); else console.log(`  ✅ req: Nettoyage`);
  }

  // 6. Jobs, Conversations, Messages, Transactions
  if (clientId && proIds[3]) {
    const { data: reqs, error: reqsErr } = await supabase.from("service_requests").select("id, category").eq("client_id", clientId);
    if (reqsErr) console.log(`  ❌ fetch reqs: ${reqsErr.message}`);
    if (reqs) {
      const acReq = reqs.find((r) => r.category === "ac_refrigeration");
      if (acReq) {
        let { data: jobData, error: jobErr } = await supabase.from("jobs").insert({
          request_id: acReq.id,
          gps_check_in: "SRID=4326;POINT(-4.0083 5.3221)",
        }).select().maybeSingle();
        if (jobErr) {
          const { data: existing } = await supabase.from("jobs").select("id").eq("request_id", acReq.id).maybeSingle();
          jobData = existing;
        }
        if (jobErr) console.log(`  ❌ job: ${jobErr.message}`); else console.log(`  ✅ job: AC installation`);
        if (jobData) {
          const { data: conv, error: convErr } = await supabase.from("conversations").upsert({
            participant_1: clientId, participant_2: proIds[3],
            job_id: jobData.id, last_message_at: new Date().toISOString(),
          }, { onConflict: "participant_1, participant_2, job_id" }).select().single();
          if (convErr) console.log(`  ❌ conversation: ${convErr.message}`);
          if (conv) {
            console.log(`  ✅ conversation: Marie ↔ Mamadou`);
            const { error: msgErr } = await supabase.from("messages").insert([
              { conversation_id: conv.id, sender_id: proIds[3], content: "Bonjour Marie, je suis en route pour votre intervention climatisation.", created_at: new Date(Date.now() - 3600000).toISOString() },
              { conversation_id: conv.id, sender_id: clientId, content: "Parfait, je vous attends !", created_at: new Date(Date.now() - 3500000).toISOString() },
              { conversation_id: conv.id, sender_id: proIds[3], content: "J'arrive dans 15 minutes. Le trafic est un peu dense sur le boulevard.", is_read: false, created_at: new Date(Date.now() - 120000).toISOString() },
            ]);
            if (msgErr) console.log(`  ❌ messages: ${msgErr.message}`); else console.log("  ✅ messages: 3");
          }

          const { count: txCount } = await supabase.from("transactions").select("id", { count: "exact", head: true }).eq("job_id", jobData.id);
          if (txCount === 0) {
            const { error: txErr } = await supabase.from("transactions").insert({
              job_id: jobData.id, payer_id: clientId, payee_id: proIds[3],
              amount: 35000, platform_fee: 5250, net_amount: 29750,
              payment_method: "orange_money", status: "captured",
            });
            if (txErr) console.log(`  ❌ transaction: ${txErr.message}`); else console.log("  ✅ transaction: 35000 F CFA");
          } else {
            console.log(`  ✅ transaction: already exists`);
          }
        }
      }
    }
  }

  // 7. Verification requests
  for (let i = 1; i <= 4; i++) {
    const id = proIds[i];
    if (!id) continue;
    await supabase.from("verification_requests").upsert({
      user_id: id, level: i === 1 || i === 3 ? "certified" : i === 4 ? "background" : "id",
      document_type: "cni", document_url: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400&h=300&fit=crop",
      status: "approved",
    }, { onConflict: "user_id" });
  }
  console.log("  ✅ verification_requests inserted");

  console.log("\n🎉 Seed complete!");
}

seed().catch(console.error);
