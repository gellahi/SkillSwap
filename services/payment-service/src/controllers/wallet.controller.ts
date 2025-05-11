import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { CreateWalletDto, UpdateWalletDto } from '../dto/wallet.dto';
import { AuthGuard } from '../guards/auth.guard';
import { TransactionLoggingInterceptor } from '../interceptors/transaction-logging.interceptor';

@Controller('wallets')
@UseGuards(AuthGuard)
@UseInterceptors(TransactionLoggingInterceptor)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async create(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    // Only allow admin to create wallets for other users
    if (req.user.role !== 'admin' && createWalletDto.userId !== req.user.id) {
      createWalletDto.userId = req.user.id;
    }

    return this.walletService.create(createWalletDto);
  }

  @Get('me')
  async findMyWallet(@Request() req) {
    return this.walletService.findByUserId(req.user.id);
  }

  @Get('balance')
  async getMyBalance(@Request() req) {
    return this.walletService.getUserBalance(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const wallet = await this.walletService.findOne(id);

    // Only allow admin or wallet owner to see wallet
    if (req.user.role !== 'admin' && wallet.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return wallet;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @Request() req,
  ) {
    const wallet = await this.walletService.findOne(id);

    // Only allow admin to update wallet
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.walletService.update(id, updateWalletDto);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string, @Request() req) {
    // Only allow admin or wallet owner to see wallet
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return this.walletService.findByUserId(userId);
  }
}
