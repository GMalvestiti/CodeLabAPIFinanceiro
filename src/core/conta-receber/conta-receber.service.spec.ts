import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { CreateContaReceberBaixaDto } from './dto/create-conta-receber-baixa.dto';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';
import { ContaReceberBaixa } from './entities/conta-receber-baixa.entity';
import { ContaReceber } from './entities/conta-receber.entity';
import { ContaReceberService } from './conta-receber.service';

const mockCreateContaReceberDto: CreateContaReceberDto = {
  idPessoa: 1,
  pessoa: 'Teste Pessoa',
  idUsuarioLancamento: 1,
  valorTotal: 1000,
  pago: false,
  baixa: [],
};

const mockBaixaDto: CreateContaReceberBaixaDto = {
  idContaReceber: 1,
  idUsuarioBaixa: 1,
  valorPago: 1000,
};

const mockUpdateContaReceberDto: UpdateContaReceberDto = Object.assign(
  mockCreateContaReceberDto,
  { id: 1 },
);

const mockContaReceber: ContaReceber = new ContaReceber(
  mockUpdateContaReceberDto,
);

const mockFindAllOrder: IFindAllOrder = {
  column: 'id',
  sort: 'asc',
};

const mockFindAllFilter: IFindAllFilter = {
  column: 'id',
  value: 1,
};

describe('ContaReceberService', () => {
  let service: ContaReceberService;
  let repository: Repository<ContaReceber>;
  let repositoryBaixa: Repository<ContaReceberBaixa>;
  let grpcUsuarioService: ClientGrpc;
  let mailService: ClientProxy;
  let redisCacheService: RedisCacheService;

  beforeEach(async () => {
    grpcUsuarioService = {
      getService: jest.fn().mockReturnValue({ FindOne: jest.fn() }),
    } as unknown as ClientGrpc;

    mailService = { emit: jest.fn() } as unknown as ClientProxy;
    redisCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as RedisCacheService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContaReceberService,
        {
          provide: getRepositoryToken(ContaReceber),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(ContaReceberBaixa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: 'GRPC_USUARIO', useValue: grpcUsuarioService },
        { provide: 'MAIL_SERVICE', useValue: mailService },
        { provide: RedisCacheService, useValue: redisCacheService },
      ],
    }).compile();

    service = module.get<ContaReceberService>(ContaReceberService);
    repository = module.get<Repository<ContaReceber>>(
      getRepositoryToken(ContaReceber),
    );
    repositoryBaixa = module.get<Repository<ContaReceberBaixa>>(
      getRepositoryToken(ContaReceberBaixa),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conta receber', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(mockContaReceber);
      const response = await service.create(new CreateContaReceberDto());
      expect(response).toEqual(mockContaReceber);
    });
  });

  describe('findAll', () => {
    it('should return a list of conta receber', async () => {
      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([[mockContaReceber], 1]);
      const response = await service.findAll(
        0,
        10,
        mockFindAllOrder,
        mockFindAllFilter,
      );
      expect(response.data).toEqual([mockContaReceber]);
      expect(response.count).toEqual(1);
    });
  });

  describe('findOne', () => {
    it('should return a conta receber by ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContaReceber);
      const response = await service.findOne(1);
      expect(response).toEqual(mockContaReceber);
    });
  });

  describe('update', () => {
    it('should update conta receber and return it', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContaReceber);
      jest.spyOn(repository, 'save').mockResolvedValue(mockContaReceber);
      const response = await service.update(1, mockUpdateContaReceberDto);
      expect(response).toEqual(mockContaReceber);
    });

    it('should throw an error if IDs differ', async () => {
      await expect(
        service.update(2, mockUpdateContaReceberDto),
      ).rejects.toThrow(
        new HttpException(EMensagem.IDS_DIFERENTES, HttpStatus.NOT_ACCEPTABLE),
      );
    });

    it('should throw an error if conta receber does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      await expect(
        service.update(1, mockUpdateContaReceberDto),
      ).rejects.toThrow(
        new HttpException(
          EMensagem.IMPOSSIVEL_ALTERAR,
          HttpStatus.NOT_ACCEPTABLE,
        ),
      );
    });
  });

  describe('baixar', () => {
    it('should create baixa for conta receber', async () => {
      const mockContaReceberBaixa: ContaReceberBaixa = {
        ...mockBaixaDto,
        id: 1,
        dataHora: new Date(),
        contaReceber: mockContaReceber,
      } as ContaReceberBaixa;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContaReceber);
      jest
        .spyOn(repositoryBaixa, 'create')
        .mockReturnValue(mockContaReceberBaixa);
      jest
        .spyOn(repositoryBaixa, 'save')
        .mockResolvedValue(mockContaReceberBaixa);
      const result = await service.baixar(mockBaixaDto);
      expect(result).toEqual(true);
    });

    it('should throw an error if conta receber is already paid', async () => {
      const mockPaidConta = { ...mockContaReceber, pago: true };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPaidConta);
      await expect(service.baixar(mockBaixaDto)).rejects.toThrow(
        new HttpException(EMensagem.JA_BAIXADO, HttpStatus.NOT_ACCEPTABLE),
      );
    });

    it('should throw an error if valorPago is invalid', async () => {
      const mockInvalidBaixaDto = { ...mockBaixaDto, valorPago: 2000 };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContaReceber);
      await expect(service.baixar(mockInvalidBaixaDto)).rejects.toThrow(
        new HttpException(EMensagem.VALOR_INVALIDO, HttpStatus.NOT_ACCEPTABLE),
      );
    });
  });

  describe('delete', () => {
    it('should delete conta receber', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContaReceber);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);
      const result = await service.delete(1);
      expect(result).toEqual(true);
    });

    it('should throw an error if conta receber does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      await expect(service.delete(1)).rejects.toThrow(
        new HttpException(EMensagem.IMPOSSIVEL_EXCLUIR, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getUsuarioFromGrpc', () => {
    it('should throw an error if gRPC service fails', async () => {
      jest
        .spyOn(
          grpcUsuarioService.getService('UsuarioService') as any,
          'FindOne',
        )
        .mockReturnValue({
          toPromise: jest.fn().mockRejectedValue(new Error('gRPC error')),
        });
      await expect(service.getUsuarioFromGrpc(1)).rejects.toThrow(
        new HttpException(
          EMensagem.ERRO_COMUNICACAO_GRPC_USUARIO,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('findTotalPago', () => {
    it('should return total pago from cache if available', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(1000);
      const response = await service.findTotalPago(true);
      expect(response).toEqual(1000);
    });

    it('should calculate and cache total pago if not in cache', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(null);
      jest.spyOn(service, 'findTotais').mockResolvedValue(1000);
      jest.spyOn(redisCacheService, 'set').mockResolvedValue(undefined);
      const response = await service.findTotalPago(true);
      expect(response).toEqual(1000);
      expect(redisCacheService.set).toHaveBeenCalledWith('pagoMensal', 1000);
    });
  });

  describe('findTotais', () => {
    it('should return total for given conditions', async () => {
      jest
        .spyOn(repository.createQueryBuilder(), 'getRawOne')
        .mockResolvedValue({ total: 1000 });
      const response = await service.findTotais(true, true);
      expect(response).toEqual(1000);
    });

    it('should return -1 if no result found', async () => {
      jest
        .spyOn(repository.createQueryBuilder(), 'getRawOne')
        .mockResolvedValue(null);
      const response = await service.findTotais(true, true);
      expect(response).toEqual(-1);
    });
  });

  describe('refreshCache', () => {
    it('should refresh cache with new values', async () => {
      jest.spyOn(service, 'findTotais').mockResolvedValue(1000);
      jest.spyOn(redisCacheService, 'set').mockResolvedValue(undefined);
      await service.refreshCache();
      expect(redisCacheService.set).toHaveBeenCalledWith('abertoTotal', 1000);
      expect(redisCacheService.set).toHaveBeenCalledWith('abertoMensal', 1000);
      expect(redisCacheService.set).toHaveBeenCalledWith('pagoTotal', 1000);
      expect(redisCacheService.set).toHaveBeenCalledWith('pagoMensal', 1000);
    });
  });
});
