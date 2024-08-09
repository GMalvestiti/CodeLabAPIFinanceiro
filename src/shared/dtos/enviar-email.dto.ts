import {
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IEmailAttachment } from '../interfaces/email-attachment.interface';

export class EnviarEmailDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  to: string | string[];

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  subject: string;

  @IsNotEmpty()
  @IsDefined()
  context: any;

  @IsNotEmpty()
  @IsDefined()
  template: string;

  @IsOptional()
  @IsArray()
  attachments: IEmailAttachment[];
}
