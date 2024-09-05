import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { ContaReceberService } from './conta-receber.service';
import { ContaReceber } from './entities/conta-receber.entity';

describe('ContaReceberService', () => {
  let service: ContaReceberService;
  let repository: Repository<ContaReceber>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContaReceberService,
        {
          provide: getRepositoryToken(ContaReceber),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContaReceberService>(ContaReceberService);

    repository = module.get<Repository<ContaReceber>>(
      getRepositoryToken(ContaReceber),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await service.create(createContaReceberDto);

      expect(response).toEqual(mockContaReceber);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao repetir um email quando criar um novo conta-receber', async () => {
      const createContaReceberDto = {
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockContaReceber = Object.assign(createContaReceberDto, { id: 1 });

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      try {
        await service.create(createContaReceberDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IMPOSSIVEL_CADASTRAR);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
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

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'find')
        .mockReturnValue(Promise.resolve(mockListaContaReceber) as any);

      const response = await service.findAll(1, 10);

      expect(response).toEqual(mockListaContaReceber);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
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

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await service.findOne(1);

      expect(response).toEqual(mockContaReceber);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const updateContaReceberDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockContaReceber = Object.assign(updateContaReceberDto, {});

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceber) as any);

      const response = await service.update(1, updateContaReceberDto);

      expect(response).toEqual(updateContaReceberDto);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao enviar ids diferentes quando alterar um conta-receber', async () => {
      const updateContaReceberDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      try {
        await service.update(2, updateContaReceberDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IDS_DIFERENTES);
      }
    });

    it('lançar erro ao repetir um email já utilizado quando alterar um conta-receber', async () => {
      const updateContaReceberDto = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const mockContaReceberFindOne = {
        id: 2,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: 'abcdef',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceberFindOne) as any);

      try {
        await service.update(1, updateContaReceberDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IMPOSSIVEL_ALTERAR);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('unactivate', () => {
    it('desativar um usuário', async () => {
      const mockContaReceberFindOne = {
        id: 1,
        nome: 'Nome Teste',
        email: 'nome.teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: true,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(mockContaReceberFindOne) as any);

      const mockContaReceberSave = Object.assign(mockContaReceberFindOne, {
        ativo: false,
      });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(mockContaReceberSave) as any);

      const response = await service.unactivate(1);

      expect(response).toEqual(false);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar erro ao não encontrar o conta-receber usando o id quando alterar um conta-receber', async () => {
      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(null) as any);

      try {
        await service.unactivate(1);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(EMensagem.IMPOSSIVEL_ALTERAR);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });
});
