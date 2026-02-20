import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { MoneyFlowsModule } from './money-flows/money-flows.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/money-flow',
    ),
    AuthModule,
    UsersModule,
    CategoriesModule,
    MoneyFlowsModule,
    TransactionsModule,
    TagsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
