import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MoneyFlow,
  MoneyFlowDocument,
} from './schemas/money-flow.schema';
import { CreateMoneyFlowDto } from './dto/create-money-flow.dto';
import { UpdateMoneyFlowDto } from './dto/update-money-flow.dto';

@Injectable()
export class MoneyFlowsService {
  constructor(
    @InjectModel(MoneyFlow.name)
    private readonly moneyFlowModel: Model<MoneyFlowDocument>,
  ) {}

  async create(
    userId: string | Types.ObjectId,
    dto: CreateMoneyFlowDto,
  ): Promise<MoneyFlowDocument> {
    return this.moneyFlowModel.create({
      name: dto.name,
      description: dto.description ?? '',
      userId,
    });
  }

  async findAll(userId: string | Types.ObjectId): Promise<MoneyFlowDocument[]> {
    return this.moneyFlowModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<MoneyFlowDocument[]>;
  }

  async findOne(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<MoneyFlowDocument> {
    const moneyFlow = await this.moneyFlowModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (!moneyFlow) throw new NotFoundException('Money flow not found');
    return moneyFlow;
  }

  async update(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    dto: UpdateMoneyFlowDto,
  ): Promise<MoneyFlowDocument> {
    const moneyFlow = await this.findOne(id, userId);
    if (dto.name !== undefined) moneyFlow.name = dto.name;
    if (dto.description !== undefined) moneyFlow.description = dto.description;
    await moneyFlow.save();
    return moneyFlow;
  }

  async remove(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<void> {
    const result = await this.moneyFlowModel.deleteOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0)
      throw new NotFoundException('Money flow not found');
  }
}
