import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, JwtPayload } from '../auth/user.decorator';

import { TransactionService } from './transaction.service';

@Controller()
@UseGuards(JwtAuthGuard)
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
    @GetUser() user: JwtPayload,   // 👈 logged-in user
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
      user,
    );
  }

  @Get('transactions/school/:schoolId')
  async getTransactionsBySchool(
    @Param('schoolId') schoolId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @GetUser() user: JwtPayload,   // 👈 logged-in user
  ) {
    return this.transactionService.getTransactionsBySchool(
      schoolId,
      page,
      limit,
      user,
    );
  }

  @Get('transaction-status/:customOrderId')
  async getTransactionStatus(
    @Param('customOrderId') customOrderId: string,
    @GetUser() user: JwtPayload,   // 👈 logged-in user
  ) {
    return this.transactionService.getTransactionStatus(customOrderId, user);
  }
}
