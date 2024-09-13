import { fakerPT_BR as faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Financeiro } from '../src/core/financeiro/entities/financeiro.entity';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { ResponseExceptionsFilter } from '../src/shared/filters/response-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let repository: Repository<Financeiro>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new ResponseExceptionsFilter());

    await app.startAllMicroservices();
    await app.init();

    repository = app.get<Repository<Financeiro>>(
      getRepositoryToken(Financeiro),
    );
  });

  afterAll(async () => {
    await repository.delete({});
    await app.close();
  });

  describe('CRUD /', () => {
    let id: number;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const financeiro = {
      nome: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      senha: faker.internet.password(),
      admin: false,
      ativo: true,
    };

    it('criar um novo usuário', async () => {
      const resp = await request(app.getHttpServer())
        .post('/financeiro')
        .send(financeiro);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SALVO_SUCESSO);
      expect(resp.body.data).toHaveProperty('id');

      id = resp.body.data.id;
    });

    it('criar um novo usuário usando o mesmo email', async () => {
      const resp = await request(app.getHttpServer())
        .post('/financeiro')
        .send(financeiro);

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IMPOSSIVEL_ALTERAR);
      expect(resp.body.data).toBe(null);
    });

    it('carrega o financeiro criado', async () => {
      const resp = await request(app.getHttpServer()).get(`/financeiro/${id}`);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.nome).toBe(financeiro.nome);
      expect(resp.body.data.email).toBe(financeiro.email);
      expect(resp.body.data.ativo).toBe(financeiro.ativo);
      expect(resp.body.data.admin).toBe(financeiro.admin);
      expect(resp.body.data).toHaveProperty('permissao');
      expect(resp.body.data.password).toBe(undefined);
    });

    it('altera o financeiro criado', async () => {
      const financeiroAlterado = Object.assign(
        { id: id, ativo: false, admin: false },
        financeiro,
        {},
      );

      const resp = await request(app.getHttpServer())
        .patch(`/financeiro/${id}`)
        .send(financeiroAlterado);

      expect(resp).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.ATUALIZADO_SUCESSO);
      expect(resp.body.data).toHaveProperty('id');
      expect(resp.body.data.nome).toBe(financeiroAlterado.nome);
      expect(resp.body.data.email).toBe(financeiroAlterado.email);
      expect(resp.body.data.ativo).toBe(financeiroAlterado.ativo);
      expect(resp.body.data.admin).toBe(financeiroAlterado.admin);
      expect(resp.body.data.password).toBe(undefined);
    });

    it('tenta alterar o financeiro criado passando um id diferente', async () => {
      const financeiroAlterado = Object.assign(financeiro, {
        id: id,
        ativo: false,
        admin: false,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/financeiro/999`)
        .send(financeiroAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDS_DIFERENTES);
      expect(resp.body.data).toBe(null);
    });

    it('tenta alterar o financeiro criado com um email já utilizado', async () => {
      const firstNameTemp = faker.person.firstName();
      const lastNameTemp = faker.person.lastName();

      const financeiroTemp = {
        nome: `${firstNameTemp} ${lastNameTemp}`,
        email: faker.internet
          .email({ firstName: firstNameTemp, lastName: lastNameTemp })
          .toLowerCase(),
        senha: faker.internet.password(),
        admin: false,
        ativo: true,
      };

      await request(app.getHttpServer())
        .post('/financeiro')
        .send(financeiroTemp);

      const financeiroAlterado = Object.assign(financeiro, {
        id: id,
        email: financeiroTemp.email,
      });

      const resp = await request(app.getHttpServer())
        .patch(`/financeiro/${id}`)
        .send(financeiroAlterado);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IMPOSSIVEL_ALTERAR);
      expect(resp.body.data).toBe(null);
    });

    it('tenta desativar um usuário inexistente', async () => {
      const resp = await request(app.getHttpServer()).delete(`/financeiro/999`);

      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.data).toBe(null);
    });

    it('desativa o financeiro criado', async () => {
      const resp = await request(app.getHttpServer()).delete(
        `/financeiro/${id}`,
      );

      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.data).toBe(false);
    });
  });

  describe('PAGINAÇÃO (findAll) /', () => {
    it('obtem todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {
        const firstNameTemp = faker.person.firstName();
        const lastNameTemp = faker.person.lastName();

        const financeiro = {
          nome: `${firstNameTemp} ${lastNameTemp}`,
          email: faker.internet
            .email({ firstName: firstNameTemp, lastName: lastNameTemp })
            .toLowerCase(),
          senha: faker.internet.password(),
          admin: false,
          ativo: true,
        };

        await request(app.getHttpServer()).post('/financeiro').send(financeiro);
      }

      const resp = await request(app.getHttpServer()).get('/financeiro/1/10');

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(10);
    });

    it('obtem todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get('/financeiro/2/10');

      expect(resp).toBeDefined();
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(2);
    });
  });
});
