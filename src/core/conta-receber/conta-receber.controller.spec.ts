import { Test, TestingModule } from '@nestjs/testing';
import { HttpResponse } from '../../shared/classes/http-response';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';
import { ContaReceber } from './entities/conta-receber.entity';
import { ContaReceberController } from './conta-receber.controller';
import { ContaReceberService } from './conta-receber.service';

const mockCreateContaReceberDto: CreateContaReceberDto = {
  idPessoa: 1,
  pessoa: 'Teste Pessoa',
  idUsuarioLancamento: 1,
  valorTotal: 1000,
  pago: false,
  baixa: [],
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

describe('ContaReceberController', () => {
  let controller: ContaReceberController;
  let service: ContaReceberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContaReceberController],
      providers: [
        {
          provide: ContaReceberService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            exportPdf: jest.fn(),
            baixar: jest.fn(),
            findTotalPago: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContaReceberController>(ContaReceberController);
    service = module.get<ContaReceberService>(ContaReceberService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conta-receber', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockContaReceber);

      const response = await controller.create(mockCreateContaReceberDto);

      expect(response).toBeInstanceOf(HttpResponse);
      expect(response.message).toEqual(EMensagem.SALVO_SUCESSO);
      expect(response.data).toEqual(mockContaReceber);
    });
  });

  describe('findAll', () => {
    it('should return a list of conta-receber', async () => {
      const mockList: ContaReceber[] = [mockContaReceber];
      jest.spyOn(service, 'findAll').mockResolvedValue({
        message: undefined,
        data: mockList,
        count: mockList.length,
      });

      const response = await controller.findAll(
        0,
        10,
        mockFindAllOrder,
        mockFindAllFilter,
      );

      expect(response.data).toEqual(mockList);
      expect(response.count).toEqual(mockList.length);
    });
  });

  describe('findOne', () => {
    it('should return a conta-receber', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockContaReceber);

      const response = await controller.findOne(1);

      expect(response.data).toEqual(mockContaReceber);
    });
  });

  describe('update', () => {
    it('should update a conta-receber', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockContaReceber);

      const response = await controller.update(
        mockUpdateContaReceberDto.id,
        mockUpdateContaReceberDto,
      );

      expect(response.message).toEqual(EMensagem.ATUALIZADO_SUCESSO);
      expect(response.data).toEqual(mockContaReceber);
    });
  });

  describe('delete', () => {
    it('should delete a conta-receber', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(true);

      const response = await controller.delete(mockUpdateContaReceberDto.id);

      expect(response.message).toEqual(EMensagem.DESATIVADO_SUCESSO);
      expect(response.data).toEqual(true);
    });
  });

  describe('baixar', () => {
    it('should baixar a conta-receber', async () => {
      jest.spyOn(service, 'baixar').mockResolvedValue(true);

      const response = await controller.baixar(
        mockCreateContaReceberDto.baixa[0] as any,
      );

      expect(response.message).toEqual(EMensagem.BAIXA_REALIZADA);
      expect(response.data).toEqual(true);
    });
  });

  describe('findTotalPago', () => {
    it('should return total pago', async () => {
      jest.spyOn(service, 'findTotalPago').mockResolvedValue(1000);

      const response = await controller.findTotalPago(true);

      expect(response.data).toEqual(1000);
    });
  });
});
