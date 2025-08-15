import { Body, Controller, Post, Req } from '@nestjs/common';
import { InitializePaymentDto } from './dto/initialize_payment.dto';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ChapaInitializePaymentCommand } from './command/chapa_initialize_commannd';
import { ChapaWebhookCommand } from './command/chapa_webhook_command';
import { ChapaVerifyCommand } from './command/chapa_verify_command';
import { ApiResponse } from '@nestjs/swagger';

@Controller('payment')
export class PaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('chapa/initialize')
  @ApiResponse({
    status: 200,
    description: 'Payment initialization successful',
  })
  async initializePayment(
    @Body() body: InitializePaymentDto,
    @Req() req: Request,
  ) {
    return await this.commandBus.execute(
      new ChapaInitializePaymentCommand(req.user!, body.storeId, body.orderId),
    );
  }

  @Post('chapa/webhook')
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(@Req() req: Request) {
    const { tx_ref, status } = req.body;
    return await this.commandBus.execute(
      new ChapaWebhookCommand(tx_ref, status),
    );
  }

  @Post('chapa/verify')
  @ApiResponse({
    status: 200,
    description: 'Payment verification successful',
  })
  async verifyPayment(@Body() body: { tx_ref: string }) {
    return await this.commandBus.execute(new ChapaVerifyCommand(body.tx_ref));
  }
}
