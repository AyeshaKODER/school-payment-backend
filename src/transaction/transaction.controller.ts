import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/user.decorator';
import type { JwtPayload } from '../auth/user.decorator';

import { TransactionService } from './transaction.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('transactions')
  async getAllTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('status') status?: string,
    @Query('schoolId') schoolId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @GetUser() user?: JwtPayload,   // 👈 logged-in user
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @GetUser() user?: JwtPayload,   // 👈 logged-in user
  ) {
    return this.transactionService.getTransactionsBySchool(
      schoolId,
      page,
      limit,
    );
  }

  @Get('transaction-status/:customOrderId')
  async getTransactionStatus(
    @Param('customOrderId') customOrderId: string,
    @GetUser() user?: JwtPayload,   // 👈 logged-in user
  ) {
    return this.transactionService.getTransactionStatus(customOrderId);
  }
}
