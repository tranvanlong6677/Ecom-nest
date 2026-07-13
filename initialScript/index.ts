// import envConfig from 'src/shared/config'
// import { HashingService } from 'src/shared/services/hashing.service'
// import { PrismaService } from 'src/shared/services/prisma.service'

import envConfig from '../src/shared/config'
import { RoleName } from '../src/shared/constants/role.constant'
import { HashingService } from '../src/shared/services/hashing.service'
import { PrismaService } from '../src/shared/services/prisma.service'

// import { RoleName } from 'src/shared/constants/role.constant'
const prisma = new PrismaService()
const hashingService = new HashingService()
const main = async () => {
  const roleCount = await prisma.role.count()
  if (roleCount > 0) {
    throw new Error('Roles already exist')
  }
  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: 'Admin role',
      },
      {
        name: RoleName.Client,
        description: 'Client role',
      },
      {
        name: RoleName.Seller,
        description: 'Seller role',
      },
    ],
  })

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
    },
  })
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })
  return {
    createdRoleCount: roles.count,
    adminUser,
  }
}

main()
  .then(({ adminUser, createdRoleCount }) => {
    console.log(`Created ${createdRoleCount} roles`)
    console.log(`Created admin user: ${adminUser.email}`)
  })
  .catch(console.error)

// const body = {
//   name: 'Áo thun cotton nam',
//   basePrice: 150000,
//   virtualPrice: 200000,
//   brandId: 1,
//   images: ['https://cdn.shop.com/aothun-1.jpg'],
//   publishedAt: null,
//   categories: [3, 7],

//   // 2 variant: Màu sắc và Kích cỡ
//   variants: [
//     {
//       value: 'Màu sắc',
//       options: ['Đỏ', 'Xanh'],
//     },
//     {
//       value: 'Kích cỡ',
//       options: ['S', 'M', 'L'],
//     },
//   ],

//   // 2 × 3 = 6 SKU, đúng theo tổ hợp generateSKUs sinh ra
//   skus: [
//     { value: 'Đỏ-S', price: 150000, stock: 20, images: ['https://cdn.shop.com/do-s.jpg'] },
//     { value: 'Đỏ-M', price: 150000, stock: 15, images: ['https://cdn.shop.com/do-m.jpg'] },
//     { value: 'Đỏ-L', price: 160000, stock: 10, images: ['https://cdn.shop.com/do-l.jpg'] },
//     { value: 'Xanh-S', price: 150000, stock: 0, images: ['https://cdn.shop.com/xanh-s.jpg'] },
//     { value: 'Xanh-M', price: 150000, stock: 30, images: ['https://cdn.shop.com/xanh-m.jpg'] },
//     { value: 'Xanh-L', price: 160000, stock: 5, images: ['https://cdn.shop.com/xanh-l.jpg'] },
//   ],
// }
