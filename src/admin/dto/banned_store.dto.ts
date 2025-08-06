import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BannedStoreDto {
  @ApiProperty({
    description: 'Reason for banning the store',
    example: 'Violation of terms and conditions',
  })
  
  @IsNotEmpty()
  @IsString()
  reason: string;
}
