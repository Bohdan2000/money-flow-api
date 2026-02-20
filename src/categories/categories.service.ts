import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '../common/enums/transaction-type.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    userId: string | Types.ObjectId,
    dto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({
      name: dto.name,
      type: dto.type,
      userId: new Types.ObjectId(userId),
    });
    if (existing) {
      throw new ConflictException(
        'Category with this name and type already exists',
      );
    }
    return this.categoryModel.create({
      ...dto,
      userId,
    });
  }

  async findAllForUser(
    userId: string | Types.ObjectId,
    type?: TransactionType,
  ): Promise<CategoryDocument[]> {
    const filter: Record<string, unknown> = {
      $or: [{ userId: new Types.ObjectId(userId) }, { userId: null }],
    };
    if (type) filter.type = type;
    return this.categoryModel
      .find(filter)
      .sort({ name: 1 })
      .lean()
      .exec() as Promise<CategoryDocument[]>;
  }

  async findOne(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({
      _id: id,
      $or: [{ userId: new Types.ObjectId(userId) }, { userId: null }],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const category = await this.findOne(id, userId);
    if (category.userId === null) {
      throw new ConflictException('Cannot update system category');
    }
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.type !== undefined) category.type = dto.type;
    if (dto.icon !== undefined) category.icon = dto.icon;
    await category.save();
    return category;
  }

  async remove(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<void> {
    const category = await this.findOne(id, userId);
    if (category.userId === null) {
      throw new ConflictException('Cannot delete system category');
    }
    await this.categoryModel.deleteOne({ _id: id });
  }
}
