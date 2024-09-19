import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { EnviarEmailDto } from '../../shared/dtos/enviar-email.dto';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import {
  idFormat,
  monetaryFormat,
} from '../../shared/helpers/formatter.helper';
import { handleFilter } from '../../shared/helpers/sql.helper';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { IGrpcUsuarioService } from '../../shared/interfaces/grpc-usuario.service';
import { IUsuario } from '../../shared/interfaces/usuario.interface';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { CreateContaReceberBaixaDto } from './dto/create-conta-receber-baixa.dto';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';
import { ContaReceberBaixa } from './entities/conta-receber-baixa.entity';
import { ContaReceber } from './entities/conta-receber.entity';

@Injectable()
export class ContaReceberService {
  private readonly logger = new Logger(ContaReceberService.name);

  @Inject('MAIL_SERVICE')
  private readonly mailService: ClientProxy;

  @InjectRepository(ContaReceber)
  private repository: Repository<ContaReceber>;

  @InjectRepository(ContaReceberBaixa)
  private repositoryBaixa: Repository<ContaReceberBaixa>;

  @Inject(ExportPdfService)
  private exportPdfService: ExportPdfService;

  @Inject(RedisCacheService)
  private redisCacheService: RedisCacheService;

  private grpcUsuarioService: IGrpcUsuarioService;

  constructor(
    @Inject('GRPC_USUARIO')
    private readonly clientGrpcUsuario: ClientGrpc,
  ) {
    this.grpcUsuarioService =
      this.clientGrpcUsuario.getService<IGrpcUsuarioService>('UsuarioService');
  }

  async create(
    createContaReceberDto: CreateContaReceberDto,
  ): Promise<ContaReceber> {
    const created = this.repository.create(
      new ContaReceber(createContaReceberDto),
    );

    return await this.repository.save(created);
  }

  async findAll(
    page: number,
    size: number,
    order: IFindAllOrder,
    filter?: IFindAllFilter | IFindAllFilter[],
  ): Promise<ContaReceber[]> {
    page--;

    const where = handleFilter(filter);

    return await this.repository.find({
      loadEagerRelations: false,
      order: {
        [order.column]: order.sort,
      },
      where,
      skip: size * page,
      take: size,
    });
  }

  async findOne(id: number): Promise<ContaReceber> {
    return await this.repository.findOne({
      where: { id: id },
    });
  }

  async update(
    id: number,
    updateContaReceberDto: UpdateContaReceberDto,
  ): Promise<ContaReceber> {
    if (id !== updateContaReceberDto.id) {
      throw new HttpException(
        EMensagem.IDS_DIFERENTES,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    return await this.repository.save(new ContaReceber(updateContaReceberDto));
  }

  async delete(id: number): Promise<boolean> {
    return await this.repository
      .delete(id)
      .then((result) => result.affected === 1);
  }

  async exportPdf(
    idUsuario: number,
    order: IFindAllOrder,
    filter?: IFindAllFilter | IFindAllFilter[],
  ): Promise<boolean> {
    try {
      const where = handleFilter(filter);

      const size = 100;
      let page = 0;

      const reportData: ContaReceber[] = [];

      let reportDataTemp: ContaReceber[] = [];

      do {
        reportDataTemp = await this.repository.find({
          select: ['id', 'idPessoa', 'pessoa', 'valorTotal', 'pago'],
          order: {
            [order.column]: order.sort,
          },
          where,
          skip: size * page,
          take: size,
        });

        reportData.push(...reportDataTemp);
        page++;
      } while (reportDataTemp.length === size);

      const filePath = await this.exportPdfService.export(
        'Listagem de ContaRecebers',
        idUsuario,
        {
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'center' },
          },
          columns: ['Código', 'Pessoa', 'Valor Total', 'Pago'],
          body: reportData.map((contaReceber) => [
            contaReceber.id,
            `${idFormat(contaReceber.idPessoa)} - ${contaReceber.pessoa}`,
            monetaryFormat(contaReceber.valorTotal, 2),
            contaReceber.pago ? 'Sim' : 'Não',
          ]),
        },
      );

      const filename = filePath.split('/').pop();
      const filedata = readFileSync(filePath);
      const base64 = filedata.toString('base64');

      const usuario = await this.getUsuarioFromGrpc(idUsuario);

      if (usuario.id === 0) {
        throw new HttpException(
          EMensagem.USUARIO_NAO_IDENTIFICADO,
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const data: EnviarEmailDto = {
        subject: 'Exportação de Relatório',
        to: usuario.email,
        template: 'exportacao-relatorio',
        context: {
          name: usuario.nome,
        },
        attachments: [{ filename, base64 }],
      };

      this.mailService.emit('enviar-email', data);

      return true;
    } catch (error) {
      this.logger.error(`Erro ao gerar relatorio pdf: ${error}`);

      throw new HttpException(
        EMensagem.ERRO_EXPORTAR_PDF,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getUsuarioFromGrpc(id: number): Promise<IUsuario> {
    try {
      return (await lastValueFrom(
        this.grpcUsuarioService.FindOne({ id }),
      )) as unknown as IUsuario;
    } catch (error) {
      this.logger.error(`Erro comunicação gRPC - APIUsuario: ${error}`);
      throw new HttpException(
        EMensagem.ERRO_COMUNICACAO_GRPC_USUARIO,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async baixar(
    createContaReceberBaixaDto: CreateContaReceberBaixaDto,
  ): Promise<boolean> {
    const contaReceber = await this.repository.findOne({
      where: { id: createContaReceberBaixaDto.idContaReceber },
    });

    if (!contaReceber) {
      throw new HttpException(EMensagem.NAO_ENCONTRADO, HttpStatus.NOT_FOUND);
    }

    if (contaReceber.pago) {
      throw new HttpException(EMensagem.JA_BAIXADO, HttpStatus.NOT_ACCEPTABLE);
    }

    // let valorPago = 0;
    // for (const item of contaReceber.baixa) {
    //   valorPago += item.valorPago;
    // }

    const valorPago = contaReceber.baixa.reduce(
      (acc, baixa) => acc + Number(baixa.valorPago),
      0,
    );

    const valorRestante = contaReceber.valorTotal - valorPago;

    if (
      createContaReceberBaixaDto.valorPago > valorRestante ||
      createContaReceberBaixaDto.valorPago > contaReceber.valorTotal
    ) {
      throw new HttpException(
        EMensagem.VALOR_INVALIDO,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const created = this.repositoryBaixa.create(
      new ContaReceberBaixa(createContaReceberBaixaDto),
    );

    await this.repositoryBaixa.save(created);

    if (
      createContaReceberBaixaDto.valorPago == valorRestante ||
      valorRestante == 0
    ) {
      this.repository.update(contaReceber.id, { pago: true });
    }

    return true;
  }

  async findTotalPago(mesAtual: boolean): Promise<number> {
    const cacheKey = mesAtual ? 'pagoMensal' : 'pagoTotal';

    let totalPago = await this.redisCacheService.get<number>(cacheKey);

    if (totalPago) {
      return totalPago;
    }

    totalPago = await this.findTotais(true, mesAtual);

    await this.redisCacheService.set(cacheKey, totalPago);

    return totalPago;
  }

  async findTotais(pago: boolean, mesAtual = false): Promise<number> {
    let dataHoraCondition = 'IS NOT NULL';

    if (mesAtual) {
      dataHoraCondition = `>= date_trunc('month', CURRENT_DATE)`;
    }

    const result: { total: number } = await this.repository
      .createQueryBuilder('contaReceber')
      .select('SUM(contaReceber.valorTotal)', 'total')
      .where('contaReceber.pago = :pago', { pago })
      .andWhere('contaReceber.dataHora ' + dataHoraCondition)
      .getRawOne();

    if (result == null || result.total === null) {
      return -1;
    }

    return result.total;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshCache(): Promise<void> {
    this.logger.log('start refresh cache');

    const abertoTotal = await this.findTotais(false);
    const abertoMensal = await this.findTotais(false, true);

    const pagoTotal = await this.findTotais(true);
    const pagoMensal = await this.findTotais(true, true);

    await this.redisCacheService.set('abertoTotal', abertoTotal);
    await this.redisCacheService.set('abertoMensal', abertoMensal);
    await this.redisCacheService.set('pagoTotal', pagoTotal);
    await this.redisCacheService.set('pagoMensal', pagoMensal);
  }
}
