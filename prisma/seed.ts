import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data in reverse dependency order
  await prisma.dashboardLayout.deleteMany();
  await prisma.message.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.occupancyRecord.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.documentLink.deleteMany();
  await prisma.document.deleteMany();
  await prisma.event.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.propertyContact.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.property.deleteMany();
  await prisma.familyInvitation.deleteMany();
  await prisma.familyMembership.deleteMany();
  await prisma.family.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ------------------------------------------------------------------
  // Users
  // ------------------------------------------------------------------
  const passwordHash = await bcrypt.hash("Vestya2024!", 10);

  const massimo = await prisma.user.create({
    data: {
      name: "Massimo Belmont",
      email: "massimo@vestya.net",
      passwordHash,
    },
  });

  const sophie = await prisma.user.create({
    data: {
      name: "Sophie Belmont",
      email: "sophie@vestya.net",
      passwordHash,
    },
  });

  const lucas = await prisma.user.create({
    data: {
      name: "Lucas Belmont",
      email: "lucas@vestya.net",
      passwordHash,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Marie Guest",
      email: "marie@vestya.net",
      passwordHash,
    },
  });

  // ------------------------------------------------------------------
  // Family
  // ------------------------------------------------------------------
  const family = await prisma.family.create({
    data: {
      name: "The Belmont Family",
      slug: "belmont",
      createdBy: massimo.id,
    },
  });

  // ------------------------------------------------------------------
  // Memberships
  // ------------------------------------------------------------------
  await prisma.familyMembership.createMany({
    data: [
      { familyId: family.id, userId: massimo.id, role: "ADMIN" },
      { familyId: family.id, userId: sophie.id, role: "ADMIN" },
      { familyId: family.id, userId: lucas.id, role: "MEMBER" },
      { familyId: family.id, userId: viewer.id, role: "MEMBER" },
    ],
  });

  // ------------------------------------------------------------------
  // Properties
  // ------------------------------------------------------------------
  const chalet = await prisma.property.create({
    data: {
      familyId: family.id,
      name: "Mountain Chalet",
      propertyType: "CABIN",
      addressLine1: "42 Route des Alpes",
      city: "Chamonix",
      region: "Haute-Savoie",
      postalCode: "74400",
      country: "France",
      timezone: "Europe/Paris",
      status: "ACTIVE",
      latitude: 45.9237,
      longitude: 6.8694,
      notes:
        "Primary vacation property, sleeps 8. Pool heated May-September.",
    },
  });

  const apartment = await prisma.property.create({
    data: {
      familyId: family.id,
      name: "Paris Apartment",
      propertyType: "APARTMENT",
      addressLine1: "15 Rue de Rivoli",
      city: "Paris",
      region: "Ile-de-France",
      postalCode: "75004",
      country: "France",
      timezone: "Europe/Paris",
      status: "ACTIVE",
      latitude: 48.8566,
      longitude: 2.3522,
      notes: "City apartment, 3 bedrooms. Rented out seasonally.",
    },
  });

  const villa = await prisma.property.create({
    data: {
      familyId: family.id,
      name: "Cote d'Azur Villa",
      propertyType: "VILLA",
      addressLine1: "8 Boulevard de la Croisette",
      city: "Cannes",
      region: "PACA",
      postalCode: "06400",
      country: "France",
      timezone: "Europe/Paris",
      status: "ACTIVE",
      latitude: 43.5528,
      longitude: 7.0174,
      notes: "Summer villa with private garden and sea view.",
    },
  });

  // ------------------------------------------------------------------
  // Contacts
  // ------------------------------------------------------------------
  const plumber = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Jean-Pierre Martin",
      company: "Plomberie Martin & Fils",
      category: "PLUMBER",
      phones: ["+33 6 12 34 56 78"],
      emails: ["jp.martin@plomberie.fr"],
      notes: "Reliable, available weekends. Rate: 60EUR/h",
    },
  });

  const electrician = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Marc Dubois",
      company: "Electricite Dubois",
      category: "ELECTRICIAN",
      phones: ["+33 6 98 76 54 32"],
      emails: ["marc@elec-dubois.fr"],
      notes: "Certified for pool electrical systems",
    },
  });

  const cleaner = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Maria Santos",
      category: "CLEANER",
      phones: ["+33 6 11 22 33 44"],
      emails: ["maria.s@gmail.com"],
      notes: "Cleans chalet every Thursday, villa biweekly",
    },
  });

  const gardener = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Alain Verte",
      company: "Jardins d'Alain",
      category: "GARDENER",
      phones: ["+33 6 55 66 77 88"],
      emails: ["alain@jardins.fr"],
    },
  });

  const insurance = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Claire Rousseau",
      company: "AXA Assurances",
      category: "INSURANCE",
      phones: ["+33 1 40 50 60 70"],
      emails: ["c.rousseau@axa.fr"],
    },
  });

  const agent = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Philippe Leroy",
      company: "Barnes Immobilier",
      category: "REAL_ESTATE_AGENT",
      phones: ["+33 6 44 55 66 77"],
      emails: ["p.leroy@barnes.fr"],
      notes: "Manages Paris apartment rentals",
    },
  });

  const locksmith = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Thomas Ferrand",
      company: "Serrurerie Ferrand",
      category: "LOCKSMITH",
      phones: ["+33 6 33 44 55 66"],
      emails: ["t.ferrand@serr.fr"],
      notes: "24/7 emergency locksmith",
    },
  });

  const painter = await prisma.contact.create({
    data: {
      familyId: family.id,
      name: "Isabelle Blanc",
      company: "Peintures Blanc",
      category: "PAINTER",
      phones: ["+33 6 77 88 99 00"],
      emails: ["isabelle@peintures-blanc.fr"],
      notes: "Interior and exterior painting",
    },
  });

  // ------------------------------------------------------------------
  // Property-Contact links
  // ------------------------------------------------------------------
  await prisma.propertyContact.createMany({
    data: [
      {
        propertyId: chalet.id,
        contactId: plumber.id,
        relationshipType: "service_provider",
      },
      {
        propertyId: chalet.id,
        contactId: cleaner.id,
        relationshipType: "service_provider",
      },
      {
        propertyId: chalet.id,
        contactId: gardener.id,
        relationshipType: "service_provider",
      },
      {
        propertyId: apartment.id,
        contactId: electrician.id,
        relationshipType: "service_provider",
      },
      {
        propertyId: apartment.id,
        contactId: agent.id,
        relationshipType: "rental_agent",
      },
      {
        propertyId: villa.id,
        contactId: cleaner.id,
        relationshipType: "service_provider",
      },
      {
        propertyId: villa.id,
        contactId: gardener.id,
        relationshipType: "service_provider",
      },
    ],
  });

  // ------------------------------------------------------------------
  // Tasks
  // ------------------------------------------------------------------
  await prisma.task.createMany({
    data: [
      {
        familyId: family.id,
        propertyId: chalet.id,
        title: "Fix leaking bathroom faucet",
        description:
          "Master bathroom faucet dripping constantly. Jean-Pierre notified.",
        category: "REPAIR",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assignedTo: lucas.id,
        assignedContact: plumber.id,
        dueAt: new Date("2026-04-10"),
        estimatedCost: 150,
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: chalet.id,
        title: "Annual pool opening",
        description:
          "Pool needs to be uncovered, cleaned, and chemical balance checked. Typically done early May.",
        category: "SEASONAL",
        priority: "MEDIUM",
        status: "TODO",
        dueAt: new Date("2026-05-01"),
        estimatedCost: 400,
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        title: "Repaint living room",
        description:
          "Walls have marks from tenants. Need fresh coat of white paint.",
        category: "RENOVATION",
        priority: "LOW",
        status: "TODO",
        dueAt: new Date("2026-06-15"),
        estimatedCost: 800,
        createdBy: sophie.id,
      },
      {
        familyId: family.id,
        propertyId: villa.id,
        title: "Garden irrigation system check",
        description:
          "Check all sprinkler heads and timers before summer.",
        category: "MAINTENANCE",
        priority: "MEDIUM",
        status: "TODO",
        assignedContact: gardener.id,
        dueAt: new Date("2026-04-20"),
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        title: "Boiler annual inspection",
        description:
          "Mandatory annual gas boiler inspection. Must be done before October.",
        category: "INSPECTION",
        priority: "HIGH",
        status: "TODO",
        dueAt: new Date("2026-09-30"),
        createdBy: sophie.id,
      },
      {
        familyId: family.id,
        propertyId: chalet.id,
        title: "Replace smoke detectors",
        description:
          "All smoke detectors are 10 years old. Need replacement per regulation.",
        category: "MAINTENANCE",
        priority: "URGENT",
        status: "TODO",
        dueAt: new Date("2026-04-05"),
        estimatedCost: 120,
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        title: "Renew home insurance policies",
        description:
          "All three properties insurance policies expire end of June.",
        category: "INSURANCE",
        priority: "HIGH",
        status: "TODO",
        assignedContact: insurance.id,
        dueAt: new Date("2026-06-01"),
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: villa.id,
        title: "Deep cleaning before summer",
        description:
          "Full property deep clean before family arrives for summer.",
        category: "CLEANING",
        priority: "MEDIUM",
        status: "TODO",
        assignedContact: cleaner.id,
        dueAt: new Date("2026-06-20"),
        estimatedCost: 350,
        createdBy: sophie.id,
      },
    ],
  });

  // ------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------
  await prisma.event.createMany({
    data: [
      {
        familyId: family.id,
        propertyId: chalet.id,
        title: "Easter Family Weekend",
        description: "Family gathering at the chalet",
        startAt: new Date("2026-04-05"),
        endAt: new Date("2026-04-07"),
        allDay: true,
        visibilityLevel: "FAMILY",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        title: "Tenant Check-out",
        description: "Current tenant leaving, inspection needed",
        startAt: new Date("2026-04-30T10:00:00"),
        endAt: new Date("2026-04-30T12:00:00"),
        linkedContactId: agent.id,
        visibilityLevel: "ADMINS_ONLY",
        createdBy: sophie.id,
      },
      {
        familyId: family.id,
        propertyId: villa.id,
        title: "Summer Season Opening",
        startAt: new Date("2026-06-15"),
        endAt: new Date("2026-06-15"),
        allDay: true,
        visibilityLevel: "FAMILY",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        title: "Insurance Review Meeting",
        description: "Annual review with AXA",
        location: "AXA Office, Paris",
        startAt: new Date("2026-05-15T14:00:00"),
        endAt: new Date("2026-05-15T15:30:00"),
        linkedContactId: insurance.id,
        visibilityLevel: "OWNERS_ONLY",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: chalet.id,
        title: "Pool Maintenance Visit",
        startAt: new Date("2026-05-01T09:00:00"),
        endAt: new Date("2026-05-01T12:00:00"),
        visibilityLevel: "FAMILY",
        createdBy: massimo.id,
      },
    ],
  });

  // ------------------------------------------------------------------
  // Financial records
  // ------------------------------------------------------------------
  await prisma.financialRecord.createMany({
    data: [
      {
        familyId: family.id,
        propertyId: chalet.id,
        category: "INSURANCE",
        amount: 1200,
        currency: "EUR",
        recordType: "EXPENSE",
        paymentStatus: "PAID",
        date: new Date("2026-01-15"),
        notes: "Annual home insurance - Chalet",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        category: "RENT_INCOME",
        amount: 2500,
        currency: "EUR",
        recordType: "INCOME",
        paymentStatus: "PAID",
        date: new Date("2026-03-01"),
        notes: "March rent from tenant",
        paidToContact: agent.id,
        createdBy: sophie.id,
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        category: "RENT_INCOME",
        amount: 2500,
        currency: "EUR",
        recordType: "INCOME",
        paymentStatus: "PAID",
        date: new Date("2026-02-01"),
        notes: "February rent",
        createdBy: sophie.id,
      },
      {
        familyId: family.id,
        propertyId: chalet.id,
        category: "MAINTENANCE",
        amount: 250,
        currency: "EUR",
        recordType: "EXPENSE",
        paymentStatus: "PAID",
        paidToContact: plumber.id,
        date: new Date("2026-02-20"),
        notes: "Emergency pipe repair",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: villa.id,
        category: "MAINTENANCE",
        amount: 180,
        currency: "EUR",
        recordType: "EXPENSE",
        paymentStatus: "PAID",
        paidToContact: gardener.id,
        date: new Date("2026-03-10"),
        notes: "March garden maintenance",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        category: "TAX",
        amount: 3500,
        currency: "EUR",
        recordType: "EXPENSE",
        paymentStatus: "PENDING",
        date: new Date("2026-04-15"),
        notes: "Property tax 2026",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: chalet.id,
        category: "UTILITY",
        amount: 320,
        currency: "EUR",
        recordType: "EXPENSE",
        paymentStatus: "PAID",
        date: new Date("2026-03-05"),
        notes: "Electricity Jan-Mar",
        createdBy: sophie.id,
      },
      {
        familyId: family.id,
        propertyId: villa.id,
        category: "INSURANCE",
        amount: 1800,
        currency: "EUR",
        recordType: "EXPENSE",
        paymentStatus: "PAID",
        date: new Date("2026-01-20"),
        notes: "Annual home insurance - Villa",
        createdBy: massimo.id,
      },
      {
        familyId: family.id,
        propertyId: chalet.id,
        category: "SALARY",
        amount: 600,
        currency: "EUR",
        recordType: "EXPENSE",
        paymentStatus: "PAID",
        paidToContact: cleaner.id,
        date: new Date("2026-03-31"),
        notes: "Cleaning service March",
        createdBy: sophie.id,
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        category: "RENT_INCOME",
        amount: 2500,
        currency: "EUR",
        recordType: "INCOME",
        paymentStatus: "PENDING",
        date: new Date("2026-04-01"),
        notes: "April rent expected",
        createdBy: sophie.id,
      },
    ],
  });

  // ------------------------------------------------------------------
  // Occupancy records
  // ------------------------------------------------------------------
  await prisma.occupancyRecord.createMany({
    data: [
      {
        familyId: family.id,
        propertyId: chalet.id,
        type: "OWNER_OCCUPIED",
        startDate: new Date("2026-04-05"),
        endDate: new Date("2026-04-07"),
        notes: "Easter family weekend",
      },
      {
        familyId: family.id,
        propertyId: apartment.id,
        type: "RENTED",
        startDate: new Date("2025-09-01"),
        endDate: new Date("2026-08-31"),
        notes: "12-month lease",
        linkedContactId: agent.id,
      },
      {
        familyId: family.id,
        propertyId: villa.id,
        type: "VACANT",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2026-06-14"),
        notes: "Closed for winter",
      },
      {
        familyId: family.id,
        propertyId: villa.id,
        type: "OWNER_OCCUPIED",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-09-15"),
        notes: "Summer season",
      },
    ],
  });

  // ------------------------------------------------------------------
  // Notifications
  // ------------------------------------------------------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: massimo.id,
        familyId: family.id,
        title: "Task Due Soon",
        message: "Replace smoke detectors is due on April 5th",
        link: "/tasks",
      },
      {
        userId: massimo.id,
        familyId: family.id,
        title: "New Financial Record",
        message: "Sophie added a rent payment for March",
        link: "/spending",
        read: true,
      },
      {
        userId: sophie.id,
        familyId: family.id,
        title: "Task Assigned",
        message:
          "You have been assigned to review apartment repaint",
        link: "/tasks",
      },
    ],
  });

  // ------------------------------------------------------------------
  // Activity logs
  // ------------------------------------------------------------------
  await prisma.activityLog.createMany({
    data: [
      {
        familyId: family.id,
        userId: massimo.id,
        entityType: "property",
        entityId: chalet.id,
        action: "created",
        metadata: { name: "Mountain Chalet" },
      },
      {
        familyId: family.id,
        userId: massimo.id,
        entityType: "property",
        entityId: apartment.id,
        action: "created",
        metadata: { name: "Paris Apartment" },
      },
      {
        familyId: family.id,
        userId: massimo.id,
        entityType: "property",
        entityId: villa.id,
        action: "created",
        metadata: { name: "Cote d'Azur Villa" },
      },
      {
        familyId: family.id,
        userId: sophie.id,
        entityType: "task",
        entityId: "seed-placeholder-task",
        action: "created",
        metadata: { title: "Repaint living room" },
      },
      {
        familyId: family.id,
        userId: massimo.id,
        entityType: "contact",
        entityId: plumber.id,
        action: "created",
        metadata: { name: "Jean-Pierre Martin" },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Messages (family chat)
  // ------------------------------------------------------------------

  await prisma.message.createMany({
    data: [
      {
        familyId: family.id,
        userId: massimo.id,
        content: "I've scheduled the plumber for next Thursday at the chalet. Jean-Pierre will look at the bathroom faucet.",
        createdAt: new Date("2026-03-28T10:30:00"),
      },
      {
        familyId: family.id,
        userId: sophie.id,
        content: "Great, thanks! I also need to call the insurance agent before June.",
        createdAt: new Date("2026-03-28T11:15:00"),
      },
      {
        familyId: family.id,
        userId: lucas.id,
        content: "Should I check the smoke detectors at the chalet this weekend?",
        createdAt: new Date("2026-03-29T09:00:00"),
      },
      {
        familyId: family.id,
        userId: massimo.id,
        content: "Yes please! They all need replacing. I ordered new ones, they should arrive Friday.",
        createdAt: new Date("2026-03-29T09:22:00"),
      },
      {
        familyId: family.id,
        userId: sophie.id,
        content: "The Paris tenant confirmed check-out on April 30. I'll coordinate the inspection with Philippe.",
        createdAt: new Date("2026-03-30T14:05:00"),
      },
      {
        familyId: family.id,
        userId: massimo.id,
        content: "Perfect. Let's plan the villa opening for mid-June as usual. Maria can do a deep clean the week before.",
        createdAt: new Date("2026-03-31T08:40:00"),
      },
    ],
  });

  console.log("Seed data created successfully!");
  console.log(
    "Login credentials: any user email with password 'Vestya2024!'",
  );
  console.log(
    "Users: massimo@vestya.net, sophie@vestya.net, lucas@vestya.net, marie@vestya.net",
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
