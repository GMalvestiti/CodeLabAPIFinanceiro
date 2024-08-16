import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateContaReceberDto } from '../dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from '../dto/update-conta-receber.dto';
import { ContaReceberBaixa } from './conta-receber-baixa.entity';

@Entity('conta-receber')
export class ContaReceber {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_conta-receber' })
  id: number;

  @Column({ nullable: false })
  idPessoa: number;

  @Column({ type: 'character varying', length: 100, nullable: false })
  pessoa: string;

  @Column({ nullable: false })
  idUsuarioLancamento: number;

  @Column({ type: 'numeric', precision: 13, scale: 3, nullable: false })
  valorTotal: number;

  @CreateDateColumn()
  dataHora: Date;

  @Column({ nullable: false })
  pago: boolean;

  @OneToMany(() => ContaReceberBaixa, (baixa) => baixa.contaReceber, {
    eager: true,
    onDelete: 'CASCADE',
    cascade: ['insert', 'update'],
    orphanedRowAction: 'delete'
  })
  baixa: ContaReceberBaixa[];

  constructor(
    createContaReceberDto: CreateContaReceberDto | UpdateContaReceberDto,
  ) {
    Object.assign(this, createContaReceberDto);
  }
}
