import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { readFileSync } from 'fs'

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})
const docClient = DynamoDBDocumentClient.from(client)

// USD prices (converted from THB ÷ 35)
const properties = [
  {
    id: 'beachfront-villa-chaweng',
    title: 'Beachfront Villa Chaweng',
    price: 1100000,
    currency: 'USD',
    area_sqm: 420,
    land_sqm: 950,
    bedrooms: 5,
    bathrooms: 4,
    location: 'Chaweng, Koh Samui',
    description:
      'Stunning beachfront villa with direct access to Chaweng Beach. Features an infinity pool overlooking the Gulf of Thailand, open-plan living spaces with floor-to-ceiling glass, a fully equipped chef\'s kitchen, and a private tropical garden.',
    images: [
      'https://cdn.mira-samui.com/properties/beachfront-villa-chaweng/main.webp',
      'https://cdn.mira-samui.com/properties/beachfront-villa-chaweng/pool.webp',
      'https://cdn.mira-samui.com/properties/beachfront-villa-chaweng/living.webp',
      'https://cdn.mira-samui.com/properties/beachfront-villa-chaweng/bedroom.webp',
    ],
    panorama_url:
      'https://cdn.mira-samui.com/panoramas/beachfront-villa-chaweng/living-room.jpg',
    featured: true,
  },
  {
    id: 'hillside-villa-bophut',
    title: 'Hillside Pool Villa Bophut',
    price: 712000,
    currency: 'USD',
    area_sqm: 280,
    land_sqm: 620,
    bedrooms: 3,
    bathrooms: 3,
    location: 'Bophut, Koh Samui',
    description:
      'Elegant hillside villa above Fisherman\'s Village with sweeping Gulf of Thailand views. Blends contemporary Thai architecture with teak wood and local stone.',
    images: [
      'https://cdn.mira-samui.com/properties/hillside-villa-bophut/main.webp',
      'https://cdn.mira-samui.com/properties/hillside-villa-bophut/view.webp',
      'https://cdn.mira-samui.com/properties/hillside-villa-bophut/pool.webp',
    ],
    featured: true,
  },
  {
    id: 'garden-townhouse-maenam',
    title: 'Tropical Garden Townhouse Maenam',
    price: 280000,
    currency: 'USD',
    area_sqm: 145,
    land_sqm: 180,
    bedrooms: 2,
    bathrooms: 2,
    location: 'Maenam, Koh Samui',
    description:
      'Modern two-storey townhouse in a peaceful gated community near Maenam Beach. Private garden, covered parking, and shared community pool.',
    images: [
      'https://cdn.mira-samui.com/properties/garden-townhouse-maenam/main.webp',
      'https://cdn.mira-samui.com/properties/garden-townhouse-maenam/garden.webp',
      'https://cdn.mira-samui.com/properties/garden-townhouse-maenam/living.webp',
    ],
    featured: true,
  },
  {
    id: 'seaview-villa-lamai',
    title: 'Sea View Villa Lamai',
    price: 536000,
    currency: 'USD',
    area_sqm: 310,
    land_sqm: 740,
    bedrooms: 4,
    bathrooms: 3,
    location: 'Lamai, Koh Samui',
    description:
      'Four-bedroom villa perched above Lamai Beach with breathtaking sea views. Features a 12-metre private pool and fully landscaped tropical garden.',
    images: [
      'https://cdn.mira-samui.com/properties/seaview-villa-lamai/main.webp',
      'https://cdn.mira-samui.com/properties/seaview-villa-lamai/pool.webp',
      'https://cdn.mira-samui.com/properties/seaview-villa-lamai/bedroom.webp',
    ],
    featured: true,
  },
  {
    id: 'beachside-townhouse-choeng-mon',
    title: 'Beachside Townhouse Choeng Mon',
    price: 354000,
    currency: 'USD',
    area_sqm: 175,
    land_sqm: 210,
    bedrooms: 3,
    bathrooms: 2,
    location: 'Choeng Mon, Koh Samui',
    description:
      'Contemporary three-bedroom townhouse 200m from Choeng Mon Beach. Private rooftop terrace with sea glimpses, within a boutique development of only eight units.',
    images: [
      'https://cdn.mira-samui.com/properties/beachside-townhouse-choeng-mon/main.webp',
      'https://cdn.mira-samui.com/properties/beachside-townhouse-choeng-mon/rooftop.webp',
      'https://cdn.mira-samui.com/properties/beachside-townhouse-choeng-mon/living.webp',
    ],
    featured: false,
  },
]

for (const property of properties) {
  await docClient.send(
    new PutCommand({ TableName: 'mira-properties', Item: property })
  )
  console.log(`✓ Inserted: ${property.id}`)
}

console.log('Done! All properties seeded to DynamoDB.')
