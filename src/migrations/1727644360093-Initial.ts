import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1727644360093 implements MigrationInterface {
    name = 'Initial1727644360093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conta-receber-baixa" ("id" SERIAL NOT NULL, "idContaReceber" integer NOT NULL, "idUsuarioBaixa" integer NOT NULL, "valorPago" numeric(13,2) NOT NULL, "dataHora" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "pk_conta-receber-baixa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conta-receber" ("id" SERIAL NOT NULL, "idPessoa" integer NOT NULL, "pessoa" character varying(100) NOT NULL, "idUsuarioLancamento" integer NOT NULL, "valorTotal" numeric(13,2) NOT NULL, "dataHora" TIMESTAMP NOT NULL DEFAULT now(), "pago" boolean NOT NULL, CONSTRAINT "pk_conta-receber" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "conta-receber-baixa" ADD CONSTRAINT "fk_conta-receber-baixa" FOREIGN KEY ("idContaReceber") REFERENCES "conta-receber"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conta-receber-baixa" DROP CONSTRAINT "fk_conta-receber-baixa"`);
        await queryRunner.query(`DROP TABLE "conta-receber"`);
        await queryRunner.query(`DROP TABLE "conta-receber-baixa"`);
    }

}
