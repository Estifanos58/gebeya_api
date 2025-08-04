import { HttpException } from '@nestjs/common';

export function logAndThrowInternalServerError(
  error: Error,
  context: string,
  from: string,
  logService: {
    error: (
      message: string,
      context: string,
      email?: string,
      role?: string,
      additionalInfo?: any,
    ) => Promise<void>;
  },
  actor?: {
    ip?: string;
    email?: string;
    role?: string;
    storeId?: string;
    productId?: string;
    productSkuId?: string;
    userId?: string;
    cartId?: string;
    cartItemId?: string;
    orderId?: string;
    commentId?: string;
    paymentId?: string;
  },
) {
  const isHttpError = error instanceof HttpException;

   logService.error(
    `${from} Error: ${error.message}`,
    context,
    actor?.email,
    actor?.role,
    {
      userIp: actor?.ip,
      userId: actor?.userId,
      storeId: actor?.storeId,
      productId: actor?.productId,
      productSkuId: actor?.productSkuId,
      cartId: actor?.cartId,  
      cartItemId: actor?.cartItemId,  
      orderId: actor?.orderId,
      paymentId: actor?.paymentId,
      commentId: actor?.commentId,
      stack: !isHttpError ? error.stack : undefined,
    },
  );

  if (isHttpError) throw error;

  throw new HttpException({ message: 'Internal Server Error' }, 500);
}
