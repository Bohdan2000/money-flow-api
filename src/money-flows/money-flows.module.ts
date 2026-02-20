import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoneyFlow, MoneyFlowSchema } from './schemas/money-flow.schema';
import { MoneyFlowsService } from './money-flows.service';
import { MoneyFlowsController } from './money-flows.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MoneyFlow.name, schema: MoneyFlowSchema },
    ]),
  ],
  controllers: [MoneyFlowsController],
  providers: [MoneyFlowsService],
  exports: [MongooseModule, MoneyFlowsService],
})
export class MoneyFlowsModule {}
