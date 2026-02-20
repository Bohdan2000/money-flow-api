import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { CategoriesModule } from '../categories/categories.module';
import { TagsModule } from '../tags/tags.module';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CategoriesModule,
    TagsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [MongooseModule, TransactionsService],
})
export class TransactionsModule {}
