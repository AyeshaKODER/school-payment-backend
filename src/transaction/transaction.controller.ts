import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TransactionService } from './transaction.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('transactions')
  async getAllTransactions(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('status') status?: string,
    @Query('schoolId') schoolId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.transactionService.getAllTransactions(
      page,
      limit,
      sort,
      order,
      status,
      schoolId,
      dateFrom,
      dateTo,
    );
  }

  @Get('transactions/school/:schoolId')
  async getTransactionsBySchool(
    @Param('schoolId') schoolId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.transactionService.getTransactionsBySchool(
      schoolId,
      page,
      limit,
    );
  }

  @Get('transaction-status/:customOrderId')
  async getTransactionStatus(@Param('customOrderId') customOrderId: string) {
    return this.transactionService.getTransactionStatus(customOrderId);
  }
}
