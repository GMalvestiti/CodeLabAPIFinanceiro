import { Factory, Seeder } from 'typeorm-seeding';
import { ContaReceber } from '../../core/conta-receber/entities/conta-receber.entity';

export class ContaReceberSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(ContaReceber)().createMany(10);
  }
}
