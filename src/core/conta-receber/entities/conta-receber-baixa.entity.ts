import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateContaReceberBaixaDto } from '../dto/create-conta-receber-baixa.dto';
import { UpdateContaReceberBaixaDto } from '../dto/update-conta-receber-baixa.dto';
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

  constructor(
    createContaReceberDto: 
      | CreateContaReceberBaixaDto
      | UpdateContaReceberBaixaDto
  ) {
    Object.assign(this, createContaReceberDto);
  }
}
