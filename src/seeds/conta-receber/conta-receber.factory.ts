import { fakerPT_BR as faker } from '@faker-js/faker';
import { define } from 'typeorm-seeding';
import { CreateContaReceberDto } from '../../core/conta-receber/dto/create-conta-receber.dto';
import { ContaReceber } from '../../core/conta-receber/entities/conta-receber.entity';

define(ContaReceber, () => {
  const contaReceber = new CreateContaReceberDto();

  contaReceber.idPessoa = faker.number.int({ max: 20 });
  contaReceber.pessoa = faker.person.fullName().substring(0, 100);
  contaReceber.valorTotal = faker.number.float({ min: 0, max: 1000 });
  contaReceber.idUsuarioLancamento = 1;
  contaReceber.pago = false;
  contaReceber.baixa = [];

  return new ContaReceber(contaReceber);
});
