import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { InitializePaymentDto } from './dto/initialize_payment.dto';
import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ChapaInitializePaymentCommand } from './command/chapa_initialize_commannd';
import { ChapaWebhookCommand } from './command/chapa_webhook_command';
import { ChapaVerifyCommand } from './command/chapa_verify_command';

@Controller('payment')
export class PaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('chapa/initialize')
  async initializePayment(
    @Body() body: InitializePaymentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const order = await this.commandBus.execute(
      new ChapaInitializePaymentCommand(
        req.user!,
        body.storeId,
        body.orderId,
      ),
    );

    return res.status(200).json({...order})
  }

  @Post('chapa/webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
  const { tx_ref, status } = req.body;
    const webhook = await this.commandBus.execute(new ChapaWebhookCommand(tx_ref, status));

    return res.status(200).json({...webhook})
  }

  @Post('chapa/verify')
  async verifyPayment(
    @Body() body: { tx_ref: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const verification = await this.commandBus.execute(
      new ChapaVerifyCommand(body.tx_ref),
    );

    return res.status(200).json({...verification});
  }
}
