import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
  ) {}

  async create(
    userId: string | Types.ObjectId,
    dto: CreateTagDto,
  ): Promise<TagDocument> {
    const userOid = new Types.ObjectId(userId);
    const existing = await this.tagModel.findOne({
      userId: userOid,
      name: dto.name.trim(),
    });
    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }
    return this.tagModel.create({
      name: dto.name.trim(),
      userId: userOid,
    });
  }

  async findAll(userId: string | Types.ObjectId): Promise<TagDocument[]> {
    return this.tagModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ name: 1 })
      .lean()
      .exec() as Promise<TagDocument[]>;
  }

  async findOne(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<TagDocument> {
    const tag = await this.tagModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    dto: UpdateTagDto,
  ): Promise<TagDocument> {
    const tag = await this.findOne(id, userId);
    if (dto.name !== undefined) tag.name = dto.name.trim();
    await tag.save();
    return tag;
  }

  async remove(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<void> {
    const result = await this.tagModel.deleteOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) throw new NotFoundException('Tag not found');
  }

  /** Validate that all tag IDs belong to the user (for transactions) */
  async validateTagIdsBelongToUser(
    tagIds: string[],
    userId: string | Types.ObjectId,
  ): Promise<void> {
    if (!tagIds?.length) return;
    const userOid = new Types.ObjectId(userId);
    const count = await this.tagModel.countDocuments({
      _id: { $in: tagIds.map((id) => new Types.ObjectId(id)) },
      userId: userOid,
    });
    if (count !== tagIds.length) {
      throw new NotFoundException('One or more tags not found');
    }
  }
}
