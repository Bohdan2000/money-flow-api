import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ default: '' })
  icon: string;

  @Prop({ type: Types.ObjectId, ref: 'MoneyFlow', required: true })
  moneyFlowId: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ name: 1, type: 1, moneyFlowId: 1 }, { unique: true });
CategorySchema.index({ moneyFlowId: 1 });
CategorySchema.index({ type: 1 });
