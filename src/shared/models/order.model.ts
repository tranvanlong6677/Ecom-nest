import { z } from 'zod'
import { PaginationParamsSchema } from '@/shared/models/request.model'
import { ProductTranslationSchema } from '@/shared/models/product-translation.model'
import { OrderStatus } from '../../routes/order/order.constant'

export const OrderStatusSchema = z.enum([
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PENDING_PICKUP,
  OrderStatus.PENDING_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.RETURNED,
  OrderStatus.CANCELLED,
])

export const ReceiverSchema = z.object({
  name: z.string().trim().min(1, 'Receiver name is required'),
  phone: z.string().trim().min(9, 'Phone number is invalid').max(20, 'Phone number is invalid'),
  address: z.string().trim().min(1, 'Receiver address is required'),
})

export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  status: OrderStatusSchema,
  receiver: ReceiverSchema,
  shopId: z.number(),
  paymentId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Bản chụp (snapshot) thông tin sản phẩm/SKU tại thời điểm đặt hàng.
// productId/skuId nullable vì sản phẩm gốc có thể bị xóa sau này nhưng đơn hàng vẫn phải giữ nguyên dữ liệu lúc mua.
export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productName: z.string(),
  skuValue: z.string(),
  skuId: z.number().nullable(),
  orderId: z.number().nullable(),
  createdAt: z.date(),
  image: z.string().nullable(),
  skuPrice: z.number(),
  quantity: z.number(),
  productId: z.number().nullable(),
  productTranslations: z.array(
    ProductTranslationSchema.pick({
      id: true,
      name: true,
      description: true,
      languageId: true,
    }),
  ),
})

export const GetOrderListQuerySchema = PaginationParamsSchema.extend({
  status: OrderStatusSchema.optional(),
})

export const GetOrderListResSchema = z.object({
  data: z.array(
    OrderSchema.omit({
      receiver: true,
      deletedAt: true,
      createdById: true,
      updatedById: true,
      deletedById: true,
    }).extend({
      items: z.array(ProductSKUSnapshotSchema),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetOrderParamsSchema = z
  .object({
    orderId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetOrderDetailResSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
})

// Giỏ hàng có thể chứa sản phẩm của nhiều shop, nên body là 1 mảng: mỗi phần tử tách thành 1 order theo từng shop.
export const CreateOrderItemSchema = z.object({
  shopId: z.number(),
  receiver: ReceiverSchema,
  cartItemIds: z.array(z.number()).min(1, 'Phải chọn ít nhất 1 sản phẩm'),
})

export const CreateOrderBodySchema = z.array(CreateOrderItemSchema).min(1, 'Phải có ít nhất 1 đơn hàng')

export const CreateOrderResSchema = z.object({
  orders: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
    }),
  ),
  paymentId: z.number(),
})

export const CancelOrderBodySchema = z.object({}).strict()

export const CancelOrderResSchema = OrderSchema

export const OrderIncludeProductSKUSnapshotSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
})

export type OrderIncludeProductSKUSnapshotType = z.infer<typeof OrderIncludeProductSKUSnapshotSchema>
export type OrderStatusZodType = z.infer<typeof OrderStatusSchema>
export type ReceiverType = z.infer<typeof ReceiverSchema>
export type OrderType = z.infer<typeof OrderSchema>
export type ProductSKUSnapshotType = z.infer<typeof ProductSKUSnapshotSchema>
export type GetOrderListQueryType = z.infer<typeof GetOrderListQuerySchema>
export type GetOrderListResType = z.infer<typeof GetOrderListResSchema>
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>
export type CreateOrderItemType = z.infer<typeof CreateOrderItemSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
export type CancelOrderBodyType = z.infer<typeof CancelOrderBodySchema>
export type CancelOrderResType = z.infer<typeof CancelOrderResSchema>
