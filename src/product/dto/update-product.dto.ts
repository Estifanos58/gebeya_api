import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty } from 'class-validator';
import { Skus } from '../command/createProduct.command';

class PartialWithOutskus extends OmitType(CreateProductDto, ['skus'] as const) {}

export class UpdateProductDto extends PartialType(PartialWithOutskus) {
    // Override the skus property to include id
    skus: Array<Skus & { id: string }>; 
}
