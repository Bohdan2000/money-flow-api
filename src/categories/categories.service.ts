import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { MoneyFlow } from '../money-flows/schemas/money-flow.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '../common/enums/transaction-type.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(MoneyFlow.name)
    private readonly moneyFlowModel: Model<MoneyFlow>,
  ) {}

  private async ensureMoneyFlowBelongsToUser(
    moneyFlowId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const exists = await this.moneyFlowModel.findOne({
      _id: moneyFlowId,
      userId,
    });
    if (!exists) throw new NotFoundException('Money flow not found');
  }

  async create(
    userId: string | Types.ObjectId,
    dto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    const moneyFlowOid = new Types.ObjectId(dto.moneyFlowId);
    await this.ensureMoneyFlowBelongsToUser(
      moneyFlowOid,
      new Types.ObjectId(userId),
    );
    const existing = await this.categoryModel.findOne({
      name: dto.name,
      type: dto.type,
      moneyFlowId: moneyFlowOid,
    });
    if (existing) {
      throw new ConflictException(
        'Category with this name and type already exists in this money flow',
      );
    }
    return this.categoryModel.create({
      name: dto.name,
      type: dto.type,
      icon: dto.icon ?? '',
      moneyFlowId: moneyFlowOid,
    });
  }

  async findAllForMoneyFlow(
    moneyFlowId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    type?: TransactionType,
  ): Promise<CategoryDocument[]> {
    const moneyFlowOid = new Types.ObjectId(moneyFlowId);
    await this.ensureMoneyFlowBelongsToUser(
      moneyFlowOid,
      new Types.ObjectId(userId),
    );
    const filter: Record<string, unknown> = { moneyFlowId: moneyFlowOid };
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
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    await this.ensureMoneyFlowBelongsToUser(
      category.moneyFlowId,
      new Types.ObjectId(userId),
    );
    return category;
  }

  async update(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const category = await this.findOne(id, userId);
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
    await this.findOne(id, userId);
    await this.categoryModel.deleteOne({ _id: id });
  }

  /** Used by TransactionsService to validate category belongs to money flow */
  async findByIdAndMoneyFlow(
    categoryId: Types.ObjectId,
    moneyFlowId: Types.ObjectId,
  ): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({
      _id: categoryId,
      moneyFlowId,
    });
  }
}
