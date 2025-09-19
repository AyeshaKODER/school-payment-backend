import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, JwtPayload } from '../auth/user.decorator';

@Controller()
@UseGuards(JwtAuthGuard) // Protect all transaction routes
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('transactions')
  async getAllTransactions(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('status') status?: string,
    @Query('schoolId') schoolId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @GetUser() user?: JwtPayload, // Optional: access current user info
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
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @GetUser() user?: JwtPayload,
  ) {
    return this.transactionService.getTransactionsBySchool(schoolId, page, limit);
  }

  @Get('transaction-status/:customOrderId')
  async getTransactionStatus(
    @Param('customOrderId') customOrderId: string,
    @GetUser() user?: JwtPayload,
  ) {
    return this.transactionService.getTransactionStatus(customOrderId);
  }
}