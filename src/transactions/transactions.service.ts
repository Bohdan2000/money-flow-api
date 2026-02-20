import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { Category } from '../categories/schemas/category.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from '../common/enums/transaction-type.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async create(
    userId: string | Types.ObjectId,
    dto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    return this.transactionModel.create({
      amount: dto.amount,
      currency: dto.currency,
      date: new Date(dto.date),
      description: dto.description ?? '',
      categoryId: dto.categoryId,
      userId,
    });
  }

  async findAll(
    userId: string | Types.ObjectId,
    options?: {
      from?: string;
      to?: string;
      type?: TransactionType;
      limit?: number;
      skip?: number;
    },
  ): Promise<TransactionDocument[]> {
    const filter: {
      userId: Types.ObjectId;
      date?: { $gte?: Date; $lte?: Date };
      categoryId?: { $in: Types.ObjectId[] };
    } = {
      userId: new Types.ObjectId(userId),
    };
    if (options?.from || options?.to) {
      filter.date = {};
      if (options.from) filter.date.$gte = new Date(options.from);
      if (options.to) filter.date.$lte = new Date(options.to);
    }
    if (options?.type) {
      const categoryIds = await this.categoryModel
        .find({
          type: options.type,
          $or: [
            { userId: new Types.ObjectId(userId) },
            { userId: null },
          ],
        })
        .distinct('_id');
      filter.categoryId = { $in: categoryIds };
    }
    let query = this.transactionModel
      .find(filter)
      .sort({ date: -1 })
      .populate('categoryId', 'name type icon');
    if (options?.limit) query = query.limit(options.limit);
    if (options?.skip) query = query.skip(options.skip);
    return query.lean().exec() as Promise<TransactionDocument[]>;
  }

  async findOne(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .populate('categoryId', 'name type icon');
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
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
    if (dto.amount !== undefined) transaction.amount = dto.amount;
    if (dto.currency !== undefined) transaction.currency = dto.currency;
    if (dto.date !== undefined) transaction.date = new Date(dto.date);
    if (dto.description !== undefined)
      transaction.description = dto.description;
    if (dto.categoryId !== undefined) {
      transaction.categoryId = new Types.ObjectId(dto.categoryId);
    }
    await transaction.save();
    return transaction.populate(
      'categoryId',
      'name type icon',
    ) as Promise<TransactionDocument>;
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
