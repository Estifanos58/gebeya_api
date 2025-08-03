import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SuccessfulPaymentEvent } from "./successful_payment.event";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment, ProductSkus, Size, User } from "@/entities";
import { Repository } from "typeorm";
import { MailService } from "@/mail/mail.service";
import { ORDER_PLACED_TEMPLATE, PAYMENT_SUCCESSFUL_TEMPLATE } from "@/utils/templates";

@Injectable()
export class HandlePaymentEvent {

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(ProductSkus)
        private readonly productSkusRepository: Repository<ProductSkus>,

        private readonly mailService: MailService
    ){}

 @OnEvent('payment.success')
 async handleSuccessfulPaymentEvent(event: SuccessfulPaymentEvent) {
   const { paymentId, amount, currency, userId, timestamp } = event;

   const paymentDetails = await this.paymentRepository.findOne({
    where: { id: paymentId },
    relations: ['user', 'order', 'store', 'store.user' , 'order.items', 'order.items.productSkus', 'order.items.productSkus.product'],
   })

    if(!paymentDetails) {
     throw new Error(`Payment with ID ${paymentId} not found`);
    }

   const purchasedProducts = paymentDetails?.order?.items.map(item => ({
     productSkusId: item.productSkus.id,
     productName: item.productSkus.product.name,
     color: item.productSkus.color,
     size: item.productSkus.size,
     orderNumber: paymentDetails.order.orderNumber,
     deliveryAddress: paymentDetails.order.deliveryAddress,
     quantity: item.quantity,
     price: item.price
   }));

   const purchasedProductsHTMLT_Template = purchasedProducts.map((product) => (
        `<div>
            <p><strong>Product:</strong> ${product.productName}</p>
            <p><strong>Color:</strong> ${product.color}</p>
            <p><strong>Size:</strong> ${product.size}</p>
            <p><strong>Quantity:</strong> ${product.quantity}</p>
            <p><strong>Unit Price:</strong> ${product.price} ETB</p>
        </div>`
   )) 

   let totalPrice = paymentDetails?.order?.total;

   const storeOwner = await this.userRepository.findOne({
    where: {id: paymentDetails.store.user.id},
    relations: ['store']
   })

   if(!storeOwner) {
     throw new Error(`Store owner with ID ${paymentDetails.store.user.id} not found`);
   }

   //   Send notification to store owner Order Has Come Throgh
   const storeOwnerMail = {
    to: storeOwner.email,
    subject: 'New Order Received',
    html: ORDER_PLACED_TEMPLATE,
    placeholders: {
        storeOwner: storeOwner.firstName,
        customerName: paymentDetails.user.firstName,
        orderNumber: paymentDetails.order.orderNumber,
        deliveryAddress: paymentDetails.order.deliveryAddress,
        purchasedProductsHTMLT_Template: purchasedProductsHTMLT_Template.join(''),
        totalPrice: totalPrice,
        year: new Date().getFullYear().toString(),
    }
   }
    await this.mailService.sendMail(storeOwnerMail);

   const customer = await this.userRepository.findOne({
    where: { id: userId}
   })

   if(!customer) {
     throw new Error(`Customer with ID ${userId} not found`);
   }

    //   Send notification to customer Payment Successful
    const customerMail = {
        to: customer.email,
        subject: 'Payment Successful',
        html: PAYMENT_SUCCESSFUL_TEMPLATE,
        placeholders: {
            customerName: customer.firstName,
            storeName: paymentDetails.store.name,
            orderNumber: paymentDetails.order.orderNumber,
            deliveryAddress: paymentDetails.order.deliveryAddress,
            purchasedProductsHTMLT_Template: purchasedProductsHTMLT_Template.join(''),
            totalPrice: totalPrice,
            year: new Date().getFullYear().toString(),
        }
    }

    await this.mailService.sendMail(customerMail);

    // Here remove the products from the store inventory

    for(const item of purchasedProducts){
      const product = await this.productSkusRepository.findOne({where: {id: item.productSkusId}})
      if(product) await this.productSkusRepository.remove(product!)
      else console.log(`Product not found with this ${item.productSkusId}`)
    }
    
    // Future improvements remove the error handling and add logging them to a separate db for the admin to review


   console.log(`Payment successful: ${paymentId}, Amount: ${amount}, Currency: ${currency}, User ID: ${userId}, Timestamp: ${timestamp}`);
 }
}