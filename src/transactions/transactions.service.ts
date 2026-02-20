import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { Category } from '../categories/schemas/category.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { CategoriesService } from '../categories/categories.service';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  private mapTagIdsToIds(ids: unknown): string[] {
    if (!Array.isArray(ids)) return [];
    return ids.map((id) =>
      id instanceof Types.ObjectId ? id.toString() : String(id),
    );
  }

  async create(
    userId: string | Types.ObjectId,
    dto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    await this.categoriesService.findOne(dto.categoryId, userId);
    const tagIds: string[] = Array.isArray(dto.tagIds)
      ? (dto.tagIds as string[])
      : [];
    if (tagIds.length > 0) {
      await this.tagsService.validateTagIdsBelongToUser(tagIds, userId);
    }
    const doc = await this.transactionModel.create({
      amount: dto.amount,
      currency: dto.currency,
      date: new Date(dto.date),
      description: dto.description ?? '',
      categoryId: dto.categoryId,
      userId: new Types.ObjectId(userId),
      tagIds: tagIds.map((id) => new Types.ObjectId(id)),
    });
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      ...obj,
      categoryId: obj.categoryId?.toString?.() ?? obj.categoryId,
      userId: obj.userId?.toString?.() ?? obj.userId,
      tagIds: this.mapTagIdsToIds(obj.tagIds),
    } as unknown as TransactionDocument;
  }

  async findAll(
    userId: string | Types.ObjectId,
    options?: {
      from?: string;
      to?: string;
      type?: TransactionType;
      moneyFlowId?: string | Types.ObjectId;
      tagId?: string | Types.ObjectId;
      limit?: number;
      skip?: number;
    },
  ): Promise<TransactionDocument[]> {
    const filter: {
      userId: Types.ObjectId;
      date?: { $gte?: Date; $lte?: Date };
      categoryId?: { $in: Types.ObjectId[] };
      tagIds?: Types.ObjectId;
    } = {
      userId: new Types.ObjectId(userId),
    };
    if (options?.from || options?.to) {
      filter.date = {};
      if (options.from) filter.date.$gte = new Date(options.from);
      if (options.to) filter.date.$lte = new Date(options.to);
    }
    if (options?.moneyFlowId !== undefined && options.moneyFlowId !== '') {
      const moneyFlowOid = new Types.ObjectId(options.moneyFlowId);
      const categoryFilter: Record<string, unknown> = {
        moneyFlowId: moneyFlowOid,
      };
      if (options?.type) categoryFilter.type = options.type;
      const categoryIds = await this.categoryModel
        .find(categoryFilter)
        .distinct('_id');
      filter.categoryId = { $in: categoryIds };
    } else if (options?.type) {
      const categoryIds = await this.categoryModel
        .find({ type: options.type })
        .distinct('_id');
      filter.categoryId = { $in: categoryIds };
    }
    if (options?.tagId) {
      filter.tagIds = new Types.ObjectId(options.tagId);
    }
    let query = this.transactionModel.find(filter).sort({ date: -1 });
    if (options?.limit) query = query.limit(options.limit);
    if (options?.skip) query = query.skip(options.skip);
    const list = await query.lean().exec();
    const mapped = list.map((t) => {
      const row = t as unknown as {
        categoryId?: { toString: () => string };
        userId?: { toString: () => string };
        tagIds?: unknown;
        [key: string]: unknown;
      };
      return {
        ...row,
        categoryId: row.categoryId?.toString?.() ?? row.categoryId,
        userId: row.userId?.toString?.() ?? row.userId,
        tagIds: this.mapTagIdsToIds(row.tagIds),
      };
    });
    return mapped as unknown as TransactionDocument[];
  }

  async findOne(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    const obj = transaction.toObject ? transaction.toObject() : transaction;
    return {
      ...obj,
      categoryId: obj.categoryId?.toString?.() ?? obj.categoryId,
      userId: obj.userId?.toString?.() ?? obj.userId,
      tagIds: this.mapTagIdsToIds(obj.tagIds),
    } as unknown as TransactionDocument;
  }

  async update(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    dto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (dto.categoryId !== undefined) {
      await this.categoriesService.findOne(dto.categoryId, userId);
      transaction.categoryId = new Types.ObjectId(dto.categoryId);
    }
    if (dto.amount !== undefined) transaction.amount = dto.amount;
    if (dto.currency !== undefined) transaction.currency = dto.currency;
    if (dto.date !== undefined) transaction.date = new Date(dto.date);
    if (dto.description !== undefined)
      transaction.description = dto.description;
    if (dto.tagIds !== undefined) {
      const tagIds: string[] = Array.isArray(dto.tagIds)
        ? (dto.tagIds as string[])
        : [];
      if (tagIds.length > 0) {
        await this.tagsService.validateTagIdsBelongToUser(tagIds, userId);
      }
      transaction.tagIds = tagIds.map((id) => new Types.ObjectId(id));
    }
    await transaction.save();
    const obj = transaction.toObject ? transaction.toObject() : transaction;
    return {
      ...obj,
      categoryId: obj.categoryId?.toString?.() ?? obj.categoryId,
      userId: obj.userId?.toString?.() ?? obj.userId,
      tagIds: this.mapTagIdsToIds(obj.tagIds),
    } as unknown as TransactionDocument;
  }

  async remove(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<void> {
    const result = await this.transactionModel.deleteOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0)
      throw new NotFoundException('Transaction not found');
  }
}
