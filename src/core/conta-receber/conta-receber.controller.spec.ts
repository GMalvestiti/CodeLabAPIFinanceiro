import { Test, TestingModule } from '@nestjs/testing';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { ContaReceberController } from './conta-receber.controller';
import { ContaReceberService } from './conta-receber.service';

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
            unactivate: jest.fn(),
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
    it('criar um novo usuário', async () => {
      const createContaReceberDto = {
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockContaReceber = Object.assign(createContaReceberDto, { id: 1 });

      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await controller.create(createContaReceberDto);

      expect(response.message).toEqual(EMensagem.SALVO_SUCESSO);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceCreate).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('obter uma listagem de usuários', async () => {
      const mockListaContaReceber = [
        {
          id: 1,
          nome: 'Nome Teste',
          email: 'nome.teste@teste.com',
          senha: '123456',
          ativo: true,
          admin: true,
          permissao: [],
        },
      ];

      const spyServiceFindAll = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve(mockListaContaReceber) as any);

      const response = await controller.findAll(1, 10);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockListaContaReceber);
      expect(spyServiceFindAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('obter um usuário', async () => {
      const mockContaReceber = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await controller.findOne(1);

      expect(response.message).toEqual(undefined);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const mockContaReceber = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await controller.update(1, mockContaReceber);

      expect(response.message).toEqual(EMensagem.ATUALIZADO_SUCESSO);
      expect(response.data).toEqual(mockContaReceber);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });

  describe('unactivate', () => {
    it('desativar um usuário', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'unactivate')
        .mockReturnValue(Promise.resolve(false) as any);

      const response = await controller.unactivate(1);

      expect(response.message).toEqual(EMensagem.DESATIVADO_SUCESSO);
      expect(response.data).toEqual(false);
      expect(spyServiceUpdate).toHaveBeenCalled();
    });
  });
});
