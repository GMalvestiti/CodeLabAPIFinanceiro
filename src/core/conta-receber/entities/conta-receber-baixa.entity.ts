import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContaReceber } from './conta-receber.entity';

@Entity('conta-receber-baixa')
export class ContaReceberBaixa {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_conta-receber-baixa',
  })
  id: number;

  @Column({ nullable: false })
  idContaReceber: number;

  @Column({ nullable: false })
  idUsuarioBaixa: number;

  @Column({ type: 'numeric', precision: 13, scale: 3, nullable: false })
  valorPago: number;

  @CreateDateColumn()
  dataHora: Date;

  @ManyToOne(() => ContaReceber, (contaReceber) => contaReceber.id)
  @JoinColumn({
    name: 'idContaReceber',
    foreignKeyConstraintName: 'fk_conta-receber-baixa',
  })
  contaReceber: ContaReceber;
}
