import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteStatus } from './entities/quote.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowedRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'src/users/entities/user.entity';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin')
  findAllAdmin() {
    return this.quotesService.findAllAdmin();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('client')
  findAllClient(@Request() req) {
    return this.quotesService.findAllClient(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.createForClient(createQuoteDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(+id, updateQuoteDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.quotesService.remove(+id, req.user.id);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() { status, staffId }: { status: QuoteStatus; staffId: any },
  ) {
    return this.quotesService.updateStatus(+id, status, staffId);
  }
}
