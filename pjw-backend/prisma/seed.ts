import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
//have kept table in file to avoid module conflicts/ERR_REQUIRE_ESM errors
const MOCK_DELIVERY_EVENTS = [
  { id: 1, timestamp: "2026-02-12T14:00:00Z", lat: 30.2850878, lng: -97.7419413, notes: "Notes: Usually the same singular man, or collection of 3 men on a bench at this street corner." },
  { id: 2, timestamp: "2026-02-12T14:00:00Z", lat: 30.286301, lng: -97.741841, notes: "Note: Occasionally we see homeless people down this stretch of guad, but it isnt as consistent as other markers." },
  { id: 3, timestamp: "2026-02-12T14:00:00Z", lat: 30.2877866, lng: -97.7414015, notes: "There is often a person or two on the steps outside the church here whom we try to feed." },
  { id: 4, timestamp: "2026-02-12T14:00:00Z", lat: 30.2876426, lng: -97.7418909, notes: "Often a person or two around this corner who we are able to feed" },
  { id: 5, timestamp: "2026-02-12T14:00:00Z", lat: 30.2888374, lng: -97.7419425, notes: "On Mondays, there are a large congregation of Homeless here for a weekly clothing drive that occurs at 5pm, we will be feeding them there next semester" },
  { id: 6, timestamp: "2026-02-12T14:00:00Z", lat: 30.2901841, lng: -97.7414667, notes: "There is sometimes a person or two seated at the bench outside moxie who we can feed" },
  { id: 7, timestamp: "2026-02-12T14:00:00Z", lat: 30.2905661, lng: -97.7418717, notes: "There are always people outside the seven eleven directly, and in the alley" },
  { id: 8, timestamp: "2026-02-12T14:00:00Z", lat: 30.2907722, lng: -97.7417604, notes: "Here as well" },
  { id: 9, timestamp: "2026-02-12T14:00:00Z", lat: 30.2910987, lng: -97.7414008, notes: "This Bus stop is a very consistently populated Homeless marker" },
  { id: 10, timestamp: "2026-02-12T14:00:00Z", lat: 30.2919142, lng: -97.7415616, notes: "Occasionally a couple people on this side of Taos" },
  { id: 11, timestamp: "2026-02-12T14:00:00Z", lat: 30.2921968, lng: -97.7414999, notes: "Consistently people here" },
  { id: 12, timestamp: "2026-02-12T14:00:00Z", lat: 30.2921412, lng: -97.7417627, notes: "Consistently people here" },
  { id: 13, timestamp: "2026-02-12T14:00:00Z", lat: 30.2921075, lng: -97.7428622, notes: "down this stretch of Nueces but particularly here, there are often homless people lingering here" },
  { id: 14, timestamp: "2026-02-12T14:00:00Z", lat: 30.2932371, lng: -97.7418843, notes: "A few homless can be seen here as well" },
  { id: 15, timestamp: "2026-02-12T14:00:00Z", lat: 30.2935776, lng: -97.7422705, notes: "A few homless can be seen here as well" },
  { id: 16, timestamp: "2026-02-12T14:00:00Z", lat: 30.2955212, lng: -97.7428514, notes: "" },
  { id: 17, timestamp: "2026-02-12T14:00:00Z", lat: 30.2954054, lng: -97.7426315, notes: "" },
  { id: 18, timestamp: "2026-02-12T14:00:00Z", lat: 30.2953661, lng: -97.7429372, notes: "" },
  { id: 19, timestamp: "2026-02-12T14:00:00Z", lat: 30.2955893, lng: -97.7427801, notes: "Any bus stop is going to be a dependable hotspot for the homless." },
  { id: 20, timestamp: "2026-02-12T14:00:00Z", lat: 30.2947636, lng: -97.742283, notes: "there is always at least one or two people near this gas station" },
  { id: 21, timestamp: "2026-02-12T14:00:00Z", lat: 30.2977597, lng: -97.7411599, notes: "Always some people hanging at this bus stop outside wheatsville" },
  { id: 22, timestamp: "2026-02-12T14:00:00Z", lat: 30.2975422, lng: -97.7412238, notes: "" },
  { id: 23, timestamp: "2026-02-12T14:00:00Z", lat: 30.2974154, lng: -97.7410334, notes: "Apart from infront or pn the benches at wheatsville, pay attention to behind the dumpsters. we always find a coupple keeping warm behind it" },
  { id: 24, timestamp: "2026-02-12T14:00:00Z", lat: 30.2903164, lng: -97.7476951, notes: "a few homless sometimes at the bench here" },
  { id: 25, timestamp: "2026-02-12T14:00:00Z", lat: 30.2900756, lng: -97.747553, notes: "often a coupple homless on the bench here" },
  { id: 26, timestamp: "2026-02-12T14:00:00Z", lat: 30.2896841, lng: -97.74762, notes: "often one or two outside the o mart" },
  { id: 27, timestamp: "2026-02-12T14:00:00Z", lat: 30.2893758, lng: -97.7479779, notes: "often a gorup of 3-4 on the benches here" },
  { id: 28, timestamp: "2026-02-12T14:00:00Z", lat: 30.2869512, lng: -97.7448126, notes: "often a few people here at this bench" },
  { id: 29, timestamp: "2026-02-12T14:00:00Z", lat: 30.2864091, lng: -97.7448984, notes: "often a few people on this curb" },
  { id: 30, timestamp: "2026-02-12T14:00:00Z", lat: 30.2867153, lng: -97.74268, notes: "Always some activity out here infront of the chucrch" },
  { id: 31, timestamp: "2026-02-12T14:00:00Z", lat: 30.2903645, lng: -97.7445813, notes: "frequently a homeless person or two inside the food trucks square" }
];

async function main() {
  console.log('--- STARTING SEED ---');

  const dataToInsert = MOCK_DELIVERY_EVENTS.map((event) => ({
    created_at: new Date(event.timestamp),
    lat: event.lat,
    lng: event.lng,
    notes: event.notes || "",
    items: [], 
  }));

  console.log(`Attempting to insert ${dataToInsert.length} records...`);

  const result = await prisma.delivery_logs.createMany({
    data: dataToInsert,
  });

  console.log(`SUCCESS: Created ${result.count} records.`);
}

main()
  .catch((e) => {
    console.error("SEED ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });