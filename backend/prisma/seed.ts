import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // ─── 0. Clean existing data (order matters for FK constraints) ────────────
    await prisma.pointsTransaction.deleteMany();
    await prisma.savedRoom.deleteMany();
    await prisma.report.deleteMany();
    await prisma.adminAction.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.roomAmenity.deleteMany();
    await prisma.roomImage.deleteMany();
    await prisma.room.deleteMany();
    await prisma.amenity.deleteMany();
    await prisma.userDocument.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    console.log("🧹 Cleaned existing data");

    // ─── 1. Hash password ────────────────────────────────────────────────────
    const hash = await bcrypt.hash("password123", 10);

    // ─── 2. Users ─────────────────────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            full_name: "Admin User",
            email: "admin@pgnexus.com",
            password_hash: hash,
            role: "admin",
            account_status: "active",
            email_verified_at: new Date(),
        },
    });

    const owner1 = await prisma.user.create({
        data: {
            full_name: "Ahmed Khan",
            email: "owner@pgnexus.com",
            password_hash: hash,
            role: "owner",
            mobile_number: "03001234567",
            city: "Lahore",
            account_status: "active",
            email_verified_at: new Date(),
        },
    });

    const owner2 = await prisma.user.create({
        data: {
            full_name: "Sara Ali",
            email: "sara@pgnexus.com",
            password_hash: hash,
            role: "owner",
            mobile_number: "03009876543",
            city: "Karachi",
            account_status: "active",
            email_verified_at: new Date(),
        },
    });

    const tenant1 = await prisma.user.create({
        data: {
            full_name: "Zain Malik",
            email: "tenant@pgnexus.com",
            password_hash: hash,
            role: "tenant",
            mobile_number: "03111234567",
            city: "Lahore",
            account_status: "active",
            email_verified_at: new Date(),
        },
    });

    const tenant2 = await prisma.user.create({
        data: {
            full_name: "Fatima Rizvi",
            email: "fatima@pgnexus.com",
            password_hash: hash,
            role: "tenant",
            mobile_number: "03219876543",
            city: "Karachi",
            account_status: "active",
            email_verified_at: new Date(),
        },
    });

    console.log("✅ Users created");


    // ─── 3. Amenities ─────────────────────────────────────────────────────────
    const amenityNames = ["WiFi", "AC", "Parking", "Kitchen", "Pool", "Gym", "CCTV", "Power Backup"];
    const amenities = await Promise.all(
        amenityNames.map((name) =>
            prisma.amenity.create({ data: { name, category: "standard" } })
        )
    );
    console.log("✅ Amenities created");

    // ─── 4. Rooms ─────────────────────────────────────────────────────────────
    const roomImages = [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800",
    ];

    const room1 = await prisma.room.create({
        data: {
            owner_id: owner1.id,
            title: "Luxury Private Room in DHA",
            description: "Fully furnished, air-conditioned private room in a premium DHA society. Includes all utilities, WiFi, and 24/7 security.",
            city: "Lahore",
            address: "House 42, Block A, DHA Phase 6, Lahore",
            locality: "DHA Phase 6",
            room_type: "Private Room",
            furnished_status: "fully_furnished",
            beds: 1,
            baths: 1,
            size_value: 250,
            price: 25000,
            rent_amount: 25000,
            price_unit: "month",
            security_deposit_amount: 50000,
            available_for: "males",
            gender_preference: "male",
            status: "active",
            is_verified: true,
            is_boosted: true,
            views: 342,
            amenities_list: ["WiFi", "AC", "CCTV"],
            images: {
                create: [
                    { file_url: roomImages[0] ?? "", sort_order: 0, moderation_status: "approved" },
                    { file_url: roomImages[1] ?? "", sort_order: 1, moderation_status: "approved" },
                ],
            },
        },
    });

    const room2 = await prisma.room.create({
        data: {
            owner_id: owner1.id,
            title: "Modern Studio Apartment - Gulberg",
            description: "Contemporary studio with premium furniture. Located in the heart of Gulberg, walking distance from main market.",
            city: "Lahore",
            address: "Flat 5B, Gulberg III, Lahore",
            locality: "Gulberg III",
            room_type: "Studio Apartment",
            furnished_status: "fully_furnished",
            beds: 1,
            baths: 1,
            size_value: 400,
            price: 35000,
            rent_amount: 35000,
            price_unit: "month",
            security_deposit_amount: 70000,
            available_for: "any",
            gender_preference: "any",
            status: "active",
            is_verified: true,
            is_featured: true,
            views: 215,
            amenities_list: ["WiFi", "AC", "Kitchen", "Parking"],
            images: {
                create: [
                    { file_url: roomImages[2] ?? "", sort_order: 0, moderation_status: "approved" },
                ],
            },
        },
    });

    const room3 = await prisma.room.create({
        data: {
            owner_id: owner2.id,
            title: "Sea-View Shared Room - Clifton",
            description: "Beautiful shared room near sea view. Split with one other person, separate bathrooms. Ideal for working professionals.",
            city: "Karachi",
            address: "Block 5, Clifton, Karachi",
            locality: "Clifton",
            room_type: "Shared Room",
            furnished_status: "semi_furnished",
            beds: 2,
            baths: 1,
            size_value: 350,
            price: 15000,
            rent_amount: 15000,
            price_unit: "month",
            security_deposit_amount: 30000,
            available_for: "females",
            gender_preference: "female",
            status: "active",
            is_verified: true,
            views: 189,
            amenities_list: ["WiFi", "AC", "CCTV"],
            images: {
                create: [
                    { file_url: roomImages[3] ?? "", sort_order: 0, moderation_status: "approved" },
                ],
            },
        },
    });

    const room4 = await prisma.room.create({
        data: {
            owner_id: owner2.id,
            title: "2BR Apartment - Defence Karachi",
            description: "Spacious 2-bedroom apartment in Defense Phase 2. Ideal for couples or working professionals sharing.",
            city: "Karachi",
            address: "Flat 3A, Defence Phase 2, Karachi",
            locality: "Defence Phase 2",
            room_type: "Entire Apartment",
            furnished_status: "fully_furnished",
            beds: 2,
            baths: 2,
            size_value: 900,
            price: 55000,
            rent_amount: 55000,
            price_unit: "month",
            security_deposit_amount: 110000,
            available_for: "any",
            gender_preference: "any",
            status: "pending",
            views: 0,
            amenities_list: ["WiFi", "AC", "Parking", "Gym"],
            images: {
                create: [
                    { file_url: roomImages[4] ?? "", sort_order: 0, moderation_status: "approved" },
                ],
            },
        },
    });

    const room5 = await prisma.room.create({
        data: {
            owner_id: owner1.id,
            title: "Budget Room - Johar Town",
            description: "Affordable room for students and fresh graduates. Close to universities and public transport.",
            city: "Lahore",
            address: "House 12, Sector B, Johar Town, Lahore",
            locality: "Johar Town",
            room_type: "Shared Room",
            furnished_status: "semi_furnished",
            beds: 1,
            baths: 1,
            size_value: 150,
            price: 8000,
            rent_amount: 8000,
            price_unit: "month",
            security_deposit_amount: 16000,
            available_for: "males",
            gender_preference: "male",
            status: "rejected",
            rejected_reason: "Images are not clear. Please upload better quality photos.",
            views: 45,
            amenities_list: ["WiFi", "Power Backup"],
            images: {
                create: [
                    { file_url: roomImages[1] ?? "", sort_order: 0, moderation_status: "approved" },
                ],
            },
        },
    });

    console.log("✅ Rooms created");

    // ─── 5. Bookings ──────────────────────────────────────────────────────────
    const booking1 = await prisma.booking.create({
        data: {
            room_id: room1.id,
            tenant_id: tenant1.id,
            owner_id: owner1.id,
            request_type: "inquiry",
            status: "approved",
            message: "Hi, I am interested in the room. Can we schedule a visit?",
            owner_note: "Approved. Please visit on Saturday between 2-5 PM.",
        },
    });

    const booking2 = await prisma.booking.create({
        data: {
            room_id: room2.id,
            tenant_id: tenant2.id,
            owner_id: owner1.id,
            request_type: "booking",
            status: "pending",
            message: "I would like to book this studio from next month.",
        },
    });

    const booking3 = await prisma.booking.create({
        data: {
            room_id: room3.id,
            tenant_id: tenant2.id,
            owner_id: owner2.id,
            request_type: "inquiry",
            status: "rejected",
            message: "Is this still available?",
            owner_note: "Sorry, already taken.",
        },
    });

    console.log("✅ Bookings created");

    // ─── 6. Conversations & Messages ──────────────────────────────────────────
    const conv1 = await prisma.conversation.create({
        data: {
            room_id: room1.id,
            tenant_id: tenant1.id,
            owner_id: owner1.id,
        },
    });

    await prisma.message.createMany({
        data: [
            {
                conversation_id: conv1.id,
                sender_id: tenant1.id,
                receiver_id: owner1.id,
                message_body: "Hi! I saw your listing for the DHA room. Is it still available?",
                delivery_status: "read",
                read_at: new Date(),
            },
            {
                conversation_id: conv1.id,
                sender_id: owner1.id,
                receiver_id: tenant1.id,
                message_body: "Yes, it is available! The room is fully furnished and ready to move in.",
                delivery_status: "read",
                read_at: new Date(),
            },
            {
                conversation_id: conv1.id,
                sender_id: tenant1.id,
                receiver_id: owner1.id,
                message_body: "Can I schedule a visit this weekend?",
                delivery_status: "delivered",
            },
        ],
    });

    const conv2 = await prisma.conversation.create({
        data: {
            room_id: room3.id,
            tenant_id: tenant2.id,
            owner_id: owner2.id,
        },
    });

    await prisma.message.createMany({
        data: [
            {
                conversation_id: conv2.id,
                sender_id: tenant2.id,
                receiver_id: owner2.id,
                message_body: "Hello Sara! Is the sea-view room still available for females?",
                delivery_status: "read",
                read_at: new Date(),
            },
            {
                conversation_id: conv2.id,
                sender_id: owner2.id,
                receiver_id: tenant2.id,
                message_body: "Yes it is! It's a lovely room. When would you like to visit?",
                delivery_status: "sent",
            },
        ],
    });

    console.log("✅ Conversations and messages created");

    // ─── 7. Points Transactions ───────────────────────────────────────────────
    await prisma.pointsTransaction.createMany({
        data: [
            {
                owner_id: owner1.id,
                room_id: room1.id,
                transaction_type: "EARNED",
                points: 500,
                reason_code: "room_approved",
                balance_after: 500,
            },
            {
                owner_id: owner1.id,
                room_id: room2.id,
                transaction_type: "EARNED",
                points: 500,
                reason_code: "room_approved",
                balance_after: 1000,
            },
            {
                owner_id: owner1.id,
                room_id: room1.id,
                transaction_type: "SPENT",
                points: -300,
                reason_code: "room_boost",
                balance_after: 700,
            },
        ],
    });

    await prisma.pointsTransaction.createMany({
        data: [
            {
                owner_id: owner2.id,
                room_id: room3.id,
                transaction_type: "EARNED",
                points: 500,
                reason_code: "room_approved",
                balance_after: 500,
            },
        ],
    });

    console.log("✅ Points transactions created");

    // ─── 8. Saved Rooms ───────────────────────────────────────────────────────
    await prisma.savedRoom.createMany({
        data: [
            { user_id: tenant1.id, room_id: room1.id },
            { user_id: tenant1.id, room_id: room2.id },
            { user_id: tenant2.id, room_id: room3.id },
        ],
    });

    console.log("✅ Saved rooms created");

    // ─── 9. Reports ───────────────────────────────────────────────────────────
    await prisma.report.create({
        data: {
            reporter_id: tenant1.id,
            target_type: "room",
            target_id: room5.id,
            reason_code: "misleading_info",
            description: "The room photos don't match what was shown in person.",
            status: "pending",
        },
    });

    console.log("✅ Reports created");

    console.log("\n🎉 Seed complete!");
    console.log("\n📋 Test Accounts:");
    console.log("  Admin:  admin@pgnexus.com / password123");
    console.log("  Owner:  owner@pgnexus.com / password123");
    console.log("  Owner2: sara@pgnexus.com  / password123");
    console.log("  Tenant: tenant@pgnexus.com / password123");
    console.log("  Tenant2: fatima@pgnexus.com / password123");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
