import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ContaReceberController } from '../src/core/conta-receber/conta-receber.controller';
import { ContaReceberService } from '../src/core/conta-receber/conta-receber.service';
import { CreateContaReceberDto } from '../src/core/conta-receber/dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from '../src/core/conta-receber/dto/update-conta-receber.dto';
import { CreateContaReceberBaixaDto } from '../src/core/conta-receber/dto/create-conta-receber-baixa.dto';
import { ContaReceber } from '../src/core/conta-receber/entities/conta-receber.entity';
import { IResponse } from '../src/shared/interfaces/response.interface';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { IFindAllOrder } from 'src/shared/interfaces/find-all-order.interface';
import { IFindAllFilter } from 'src/shared/interfaces/find-all-filter.interface';

describe('ContaReceberController (e2e)', () => {
  let controller: ContaReceberController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: ContaReceberService;

  const mockContaReceberService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    baixar: jest.fn(),
    findTotalPago: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContaReceberController],
      providers: [
        {
          provide: ContaReceberService,
          useValue: mockContaReceberService,
        },
      ],
    }).compile();

    controller = module.get<ContaReceberController>(ContaReceberController);
    service = module.get<ContaReceberService>(ContaReceberService);
  });

  it('should create a ContaReceber', async () => {
    const createContaReceberDto: CreateContaReceberDto = {
      idPessoa: 1,
      pessoa: 'Pessoa Teste',
      idUsuarioLancamento: 1,
      valorTotal: 100.0,
      pago: false,
      baixa: [],
    };

    const expectedResponse: IResponse<ContaReceber> = {
      data: {
        id: 1,
        ...createContaReceberDto,
        dataHora: new Date(),
        baixa: createContaReceberDto.baixa.map((baixa) => ({
          ...baixa,
          id: 0,
          dataHora: new Date(),
          contaReceber: null,
        })),
      },
      message: 'Created successfully',
      count: 1,
    };
    mockContaReceberService.create.mockResolvedValue(expectedResponse.data);

    await controller.create(createContaReceberDto);
    expect(mockContaReceberService.create).toHaveBeenCalledWith(
      createContaReceberDto,
    );
  });

  it('should find all ContaReceber', async () => {
    const page = 0;
    const size = 10;
    const order: IFindAllOrder = { column: 'id', sort: 'asc' };
    const filter: IFindAllFilter = { column: 'id', value: 1 };

    const expectedResponse: IResponse<ContaReceber[]> = {
      data: [],
      message: undefined,
      count: 0,
    };
    mockContaReceberService.findAll.mockResolvedValue(expectedResponse);

    const result = await controller.findAll(page, size, order, filter);
    expect(result).toEqual(expectedResponse);
    expect(mockContaReceberService.findAll).toHaveBeenCalledWith(
      page,
      size,
      order,
      filter,
    );
  });

  it('should find a ContaReceber by id', async () => {
    const id = 1;
    const expectedResponse: IResponse<ContaReceber> = {
      data: {
        id,
        idPessoa: 1,
        pessoa: 'Pessoa Teste',
        idUsuarioLancamento: 1,
        valorTotal: 100.0,
        pago: false,
        dataHora: new Date(),
        baixa: [],
      },
      count: 1,
      message: undefined,
    };
    mockContaReceberService.findOne.mockResolvedValue(expectedResponse.data);

    await controller.findOne(id);
    expect(mockContaReceberService.findOne).toHaveBeenCalledWith(id);
  });

  it('should update a ContaReceber', async () => {
    const id = 1;
    const updateContaReceberDto: UpdateContaReceberDto = {
      id,
      idPessoa: 1,
      pessoa: 'Pessoa Teste',
      idUsuarioLancamento: 1,
      valorTotal: 100.0,
      pago: false,
      baixa: [],
    };
    const expectedResponse: IResponse<ContaReceber> = {
      data: {
        id,
        ...updateContaReceberDto,
        dataHora: new Date(),
        idPessoa: updateContaReceberDto.idPessoa!,
        pessoa: updateContaReceberDto.pessoa!,
        idUsuarioLancamento: updateContaReceberDto.idUsuarioLancamento!,
        valorTotal: updateContaReceberDto.valorTotal!,
        pago: updateContaReceberDto.pago!,
        baixa: updateContaReceberDto.baixa!.map((baixa) => ({
          ...baixa,
          id: 0,
          dataHora: new Date(),
          contaReceber: null,
        })),
      },
      message: 'Updated successfully',
      count: 1,
    };
    mockContaReceberService.update.mockResolvedValue(expectedResponse.data);

    await controller.update(id, updateContaReceberDto);
    expect(mockContaReceberService.update).toHaveBeenCalledWith(
      id,
      updateContaReceberDto,
    );
  });

  it('should delete a ContaReceber', async () => {
    const id = 1;
    mockContaReceberService.delete.mockResolvedValue(true);

    const result = await controller.delete(id);
    expect(result).toEqual({
      data: true,
      message: EMensagem.DESATIVADO_SUCESSO,
    });
    expect(mockContaReceberService.delete).toHaveBeenCalledWith(id);
  });

  it('should baixa a ContaReceber', async () => {
    const createContaReceberBaixaDto: CreateContaReceberBaixaDto = {
      idContaReceber: 1,
      idUsuarioBaixa: 1,
      valorPago: 100.0,
    };
    mockContaReceberService.baixar.mockResolvedValue(true);

    const result = await controller.baixar(createContaReceberBaixaDto);
    expect(result).toEqual({
      data: true,
      message: EMensagem.BAIXA_REALIZADA,
    });
    expect(mockContaReceberService.baixar).toHaveBeenCalledWith(
      createContaReceberBaixaDto,
    );
  });

  it('should throw error if ContaReceber not found', async () => {
    const id = 1;
    mockContaReceberService.findOne.mockRejectedValue(
      new HttpException('ContaReceber not found', HttpStatus.NOT_FOUND),
    );

    await expect(controller.findOne(id)).rejects.toThrow(HttpException);
    expect(mockContaReceberService.findOne).toHaveBeenCalledWith(id);
  });
});
