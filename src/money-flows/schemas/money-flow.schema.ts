import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MoneyFlowDocument = MoneyFlow & Document;

@Schema({ timestamps: true })
export class MoneyFlow {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const MoneyFlowSchema = SchemaFactory.createForClass(MoneyFlow);

MoneyFlowSchema.index({ userId: 1 });
