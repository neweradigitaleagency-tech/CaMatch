import { createClient } from "@supabase/supabase-js"
import { randomBytes } from "crypto"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? "traorehiram07@gmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? randomBytes(24).toString("hex")
const ADMIN_PASSWORD_GENERATED = !process.env.ADMIN_SEED_PASSWORD

async function createAdmin() {
  console.log("Creating super admin...\n")

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      role: "platform_admin",
      first_name: "Hiram",
      last_name: "Traoré",
    },
  })

  let userId: string | null = null

  if (authError) {
    if (authError.message.includes("already exists") || authError.message.includes("already been registered")) {
      console.log(`  ℹ️  ${ADMIN_EMAIL} already exists in Auth, looking up...`)
      const { data: users } = await supabase.auth.admin.listUsers()
      const found = users?.users.find((u) => u.email === ADMIN_EMAIL)
      if (found) {
        userId = found.id
        console.log(`  → Found existing: ${userId}`)
      }
    } else {
      console.error(`  ❌ Auth error: ${authError.message}`)
      process.exit(1)
    }
  } else if (authData) {
    userId = authData.user.id
    console.log(`  ✅ Auth user created: ${userId}`)
  }

  if (!userId) {
    console.error("  ❌ No user ID available")
    process.exit(1)
  }

  // 2. Insert into public.users
  const { error: userError } = await supabase.from("users").upsert({
    id: userId,
    email: ADMIN_EMAIL,
    phone_number: "+2250000000000",
    phone_number_hash: "+2250000000000",
    role: "platform_admin",
    is_active: true,
    is_verified: true,
  }, { onConflict: "id", ignoreDuplicates: false })
  if (userError) {
    console.error(`  ❌ public.users: ${userError.message}`)
    process.exit(1)
  }
  console.log("  ✅ public.users: traorehiram07@gmail.com")

  // 3. Get super admin role ID
  const { data: roles, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "platform_super_admin")
    .single()
  if (roleError || !roles) {
    console.error(`  ❌ Could not find platform_super_admin role: ${roleError?.message}`)
    process.exit(1)
  }
  console.log(`  ✅ Found role: platform_super_admin (${roles.id})`)

  // 4. Insert into user_roles
  const { error: urError } = await supabase.from("user_roles").upsert({
    user_id: userId,
    role_id: roles.id,
    scope_type: "platform",
  }, { onConflict: "user_id, role_id, scope_id", ignoreDuplicates: false })
  if (urError) {
    console.error(`  ❌ user_roles: ${urError.message}`)
    process.exit(1)
  }
  console.log("  ✅ user_roles: platform_super_admin")

  // 5. Insert into admins table
  const { error: adminError } = await supabase.from("admins").upsert({
    id: userId,
    email: ADMIN_EMAIL,
    firstname: "Hiram",
    lastname: "Traoré",
    status: "active",
  }, { onConflict: "id", ignoreDuplicates: false })
  if (adminError) {
    console.error(`  ❌ admins table: ${adminError.message}`)
    process.exit(1)
  }
  console.log("  ✅ admins table: Hiram Traoré")

  console.log("\n🎉 Super admin created successfully!")
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  if (ADMIN_PASSWORD_GENERATED) {
    console.log(`   Password: ${ADMIN_PASSWORD}  (généré — à enregistrer immédiatement, il ne sera jamais ré-affiché)`)
  } else {
    console.log("   Password: (fourni via ADMIN_SEED_PASSWORD, non affiché)")
  }
  console.log(`   Login at: /admin/login`)
}

createAdmin().catch(console.error)
