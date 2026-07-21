import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { RoleName } from 'src/shared/constants/role.constant'

const prisma = new PrismaService()
const hashingService = new HashingService()

const LANGUAGE_ID = 'vi'
const SELLER_COUNT = 3
const PRODUCTS_PER_SELLER = 5
const CART_ITEMS_FOR_TARGET_USER = 8
// Email của tài khoản client dùng để test (nếu tồn tại trong DB thì cart sẽ được seed cho user này)
const TARGET_CLIENT_EMAIL = 'tranvanlong6677@gmail.com'

const BRAND_SEEDS = [
  { name: 'Nova', logo: 'https://picsum.photos/seed/brand-nova/200' },
  { name: 'Lumen', logo: 'https://picsum.photos/seed/brand-lumen/200' },
  { name: 'Orbit', logo: 'https://picsum.photos/seed/brand-orbit/200' },
  { name: 'Verve', logo: 'https://picsum.photos/seed/brand-verve/200' },
  { name: 'Kestrel', logo: 'https://picsum.photos/seed/brand-kestrel/200' },
]

const CATEGORY_NAMES = ['Điện tử', 'Thời trang', 'Gia dụng', 'Sách']

const COLORS = ['Đỏ', 'Xanh', 'Đen', 'Trắng', 'Vàng']
const SIZES = ['S', 'M', 'L', 'XL']

const PRODUCT_NAME_TEMPLATES = [
  'Áo thun cotton',
  'Áo khoác gió',
  'Quần jean slim fit',
  'Giày sneaker',
  'Balo du lịch',
  'Tai nghe bluetooth',
  'Đồng hồ thông minh',
  'Bàn phím cơ',
  'Chuột không dây',
  'Loa mini',
  'Kính râm',
  'Mũ lưỡi trai',
  'Ví da nam',
  'Bình giữ nhiệt',
  'Sạc dự phòng',
]

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function randomItems<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
}

async function seedBrands(): Promise<number[]> {
  const existing = await prisma.brand.findMany({ where: { deletedAt: null }, select: { id: true } })
  if (existing.length > 0) {
    console.log(`Brands already exist (${existing.length}), skip`)
    return existing.map((brand) => brand.id)
  }

  const brands = await Promise.all(BRAND_SEEDS.map((data) => prisma.brand.create({ data })))
  console.log(`Created ${brands.length} brands`)
  return brands.map((brand) => brand.id)
}

async function seedCategories(): Promise<number[]> {
  const existing = await prisma.category.findMany({ where: { deletedAt: null }, select: { id: true } })
  if (existing.length > 0) {
    console.log(`Categories already exist (${existing.length}), skip`)
    return existing.map((category) => category.id)
  }

  const categories = await Promise.all(CATEGORY_NAMES.map((name) => prisma.category.create({ data: { name } })))
  console.log(`Created ${categories.length} categories`)
  return categories.map((category) => category.id)
}

async function seedSellers(count: number): Promise<number[]> {
  const existing = await prisma.user.findMany({
    where: { role: { name: RoleName.Seller }, deletedAt: null },
    select: { id: true },
  })
  if (existing.length > 0) {
    console.log(`Sellers already exist (${existing.length}), skip`)
    return existing.map((user) => user.id)
  }

  const sellerRole = await prisma.role.findFirstOrThrow({ where: { name: RoleName.Seller, deletedAt: null } })
  const password = await hashingService.hash('Fake@12345')

  const sellerIds: number[] = []
  for (let i = 1; i <= count; i++) {
    const seller = await prisma.user.create({
      data: {
        email: `fake.seller${i}@example.com`,
        name: `Fake Shop ${i}`,
        password,
        roleId: sellerRole.id,
        status: 'ACTIVE',
      },
    })
    sellerIds.push(seller.id)
  }
  console.log(`Created ${sellerIds.length} sellers (password: Fake@12345)`)
  return sellerIds
}

async function createProductWithSkus({
  sellerId,
  brandIds,
  categoryIds,
  index,
}: {
  sellerId: number
  brandIds: number[]
  categoryIds: number[]
  index: number
}): Promise<number[]> {
  const baseName = PRODUCT_NAME_TEMPLATES[index % PRODUCT_NAME_TEMPLATES.length]
  const name = `${baseName} #${index}`
  const basePrice = randomInt(10, 30) * 10000
  const colors = randomItems(COLORS, 2)
  const sizes = randomItems(SIZES, 3)
  const image = `https://picsum.photos/seed/product-${index}/600/600`

  const product = await prisma.product.create({
    data: {
      name,
      basePrice,
      virtualPrice: basePrice + 50000,
      brandId: brandIds[index % brandIds.length],
      images: [image],
      publishedAt: new Date(),
      createdById: sellerId,
      variants: [
        { value: 'Màu sắc', options: colors },
        { value: 'Kích cỡ', options: sizes },
      ],
      categories: {
        connect: randomItems(categoryIds, Math.min(2, categoryIds.length)).map((id) => ({ id })),
      },
      productTranslations: {
        create: {
          languageId: LANGUAGE_ID,
          name,
          description: `${baseName} chất lượng cao, dữ liệu fake dùng để test.`,
        },
      },
    },
  })

  const skus = await Promise.all(
    colors.flatMap((color) =>
      sizes.map((size) =>
        prisma.sKU.create({
          data: {
            value: `${color}-${size}`,
            price: basePrice,
            stock: randomInt(5, 50),
            image,
            productId: product.id,
            createdById: sellerId,
          },
        }),
      ),
    ),
  )
  return skus.map((sku) => sku.id)
}

async function seedProducts({
  sellerIds,
  brandIds,
  categoryIds,
  productsPerSeller,
}: {
  sellerIds: number[]
  brandIds: number[]
  categoryIds: number[]
  productsPerSeller: number
}): Promise<number[]> {
  const existingCount = await prisma.product.count({ where: { deletedAt: null } })
  if (existingCount > 0) {
    console.log(`Products already exist (${existingCount}), skip creating, reusing existing SKUs`)
    const skus = await prisma.sKU.findMany({ where: { deletedAt: null }, select: { id: true } })
    return skus.map((sku) => sku.id)
  }

  const skuIds: number[] = []
  let productIndex = 0

  for (const sellerId of sellerIds) {
    for (let i = 0; i < productsPerSeller; i++) {
      productIndex++
      const newSkuIds = await createProductWithSkus({ sellerId, brandIds, categoryIds, index: productIndex })
      skuIds.push(...newSkuIds)
    }
  }

  console.log(`Created ${productIndex} products and ${skuIds.length} SKUs`)
  return skuIds
}

// Tạo thêm 1 shop (seller) mới kèm sản phẩm/SKU riêng, độc lập với seedProducts ở trên
// (seedProducts bỏ qua hoàn toàn nếu DB đã có sản phẩm, nên không thể dùng nó để bổ sung thêm 1 shop).
const EXTRA_SHOP_EMAIL = 'fake.seller.extra1@example.com'
const EXTRA_SHOP_PRODUCT_COUNT = 10

async function seedExtraShop({
  brandIds,
  categoryIds,
}: {
  brandIds: number[]
  categoryIds: number[]
}): Promise<number[]> {
  const existingProductCount = await prisma.product.count({
    where: { createdBy: { email: EXTRA_SHOP_EMAIL }, deletedAt: null },
  })
  if (existingProductCount > 0) {
    console.log(`Extra shop (${EXTRA_SHOP_EMAIL}) already has ${existingProductCount} product(s), skip`)
    return []
  }

  let seller = await prisma.user.findFirst({ where: { email: EXTRA_SHOP_EMAIL } })
  if (!seller) {
    const sellerRole = await prisma.role.findFirstOrThrow({ where: { name: RoleName.Seller, deletedAt: null } })
    const password = await hashingService.hash('Fake@12345')
    seller = await prisma.user.create({
      data: {
        email: EXTRA_SHOP_EMAIL,
        name: 'Fake Shop Extra',
        password,
        roleId: sellerRole.id,
        status: 'ACTIVE',
      },
    })
    console.log(`Created extra seller id=${seller.id} (${EXTRA_SHOP_EMAIL}, password: Fake@12345)`)
  }

  const skuIds: number[] = []
  for (let i = 1; i <= EXTRA_SHOP_PRODUCT_COUNT; i++) {
    // offset index để không trùng name/image seed với các sản phẩm đã tạo ở seedProducts
    const newSkuIds = await createProductWithSkus({ sellerId: seller.id, brandIds, categoryIds, index: 100 + i })
    skuIds.push(...newSkuIds)
  }

  console.log(`Created ${EXTRA_SHOP_PRODUCT_COUNT} products and ${skuIds.length} SKUs for shop id=${seller.id}`)
  return skuIds
}

async function seedCartItems(skuIds: number[]) {
  if (skuIds.length === 0) {
    console.log('No SKU available, skip seeding cart items')
    return
  }

  const targetUser =
    (await prisma.user.findFirst({ where: { email: TARGET_CLIENT_EMAIL, deletedAt: null } })) ??
    (await prisma.user.findFirstOrThrow({ where: { role: { name: RoleName.Client }, deletedAt: null } }))

  const existing = await prisma.cartItem.count({ where: { userId: targetUser.id } })
  if (existing > 0) {
    console.log(`User ${targetUser.email} (id=${targetUser.id}) already has ${existing} cart item(s), skip`)
    return
  }

  const chosenSkuIds = randomItems(skuIds, Math.min(CART_ITEMS_FOR_TARGET_USER, skuIds.length))
  const { count } = await prisma.cartItem.createMany({
    data: chosenSkuIds.map((skuId) => ({
      skuId,
      userId: targetUser.id,
      quantity: randomInt(1, 3),
    })),
    skipDuplicates: true,
  })
  console.log(`Added ${count} cart item(s) for user ${targetUser.email} (id=${targetUser.id})`)
}

async function main() {
  const brandIds = await seedBrands()
  const categoryIds = await seedCategories()
  const sellerIds = await seedSellers(SELLER_COUNT)
  const skuIds = await seedProducts({
    sellerIds,
    brandIds,
    categoryIds,
    productsPerSeller: PRODUCTS_PER_SELLER,
  })
  const extraShopSkuIds = await seedExtraShop({ brandIds, categoryIds })
  await seedCartItems([...skuIds, ...extraShopSkuIds])
}

main()
  .then(() => {
    console.log('Done seeding fake data')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
