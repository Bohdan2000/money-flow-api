import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.index({ userId: 1, name: 1 }, { unique: true });
TagSchema.index({ userId: 1 });
