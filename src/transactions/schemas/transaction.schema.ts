import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, trim: true, uppercase: true })
  currency: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tagIds: Types.ObjectId[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ categoryId: 1 });
TransactionSchema.index({ tagIds: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ userId: 1, date: -1 });
