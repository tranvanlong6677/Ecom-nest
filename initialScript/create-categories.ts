import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()

type CategoryTreeInput = {
  name: string
  logo?: string
  children?: CategoryTreeInput[]
}

const categoryTree: CategoryTreeInput[] = [
  {
    name: 'Điện tử',
    logo: 'Logo Điện tử',
    children: [
      {
        name: 'Điện thoại',
        logo: 'Logo Điện thoại',
        children: [
          { name: 'iPhone', logo: 'Logo iPhone' },
          { name: 'Samsung', logo: 'Logo Samsung' },
          { name: 'Xiaomi', logo: 'Logo Xiaomi' },
        ],
      },
      {
        name: 'Laptop',
        logo: 'Logo Laptop',
        children: [
          { name: 'Laptop Gaming', logo: 'Logo Laptop Gaming' },
          { name: 'Laptop Văn phòng', logo: 'Logo Laptop Văn phòng' },
        ],
      },
    ],
  },
  {
    name: 'Thời trang',
    logo: 'Logo Thời trang',
    children: [
      {
        name: 'Thời trang nam',
        children: [{ name: 'Áo nam' }, { name: 'Quần nam' }],
      },
      {
        name: 'Thời trang nữ',
        children: [{ name: 'Áo nữ' }, { name: 'Quần nữ' }],
      },
    ],
  },
  {
    name: 'Nhà cửa & Đời sống',
    logo: 'Logo Nhà cửa & Đời sống',
  },
]

const createCategoryTree = async (nodes: CategoryTreeInput[], parentCategoryId: number | null): Promise<number> => {
  let count = 0
  for (const node of nodes) {
    const category = await prisma.category.create({
      data: {
        name: node.name,
        logo: node.logo ?? null,
        parentCategoryId,
      },
    })
    count += 1
    if (node.children?.length) {
      count += await createCategoryTree(node.children, category.id)
    }
  }
  return count
}

const addCategories = async () => {
  try {
    const count = await createCategoryTree(categoryTree, null)
    console.log(`Added ${count} categories`)
  } catch (error) {
    console.log(error)
  }
}

addCategories()
