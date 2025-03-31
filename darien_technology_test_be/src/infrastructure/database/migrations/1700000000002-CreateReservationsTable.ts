import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateReservationsTable1700000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reservations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'spaceId',
            type: 'int',
          },
          {
            name: 'userEmail',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'reservationDate',
            type: 'date',
          },
          {
            name: 'startTime',
            type: 'datetime',
          },
          {
            name: 'endTime',
            type: 'datetime',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            isNullable: true,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'reservations',
      new TableForeignKey({
        name: 'FK_reservations_space',
        columnNames: ['spaceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'spaces',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('reservations');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('spaceId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('reservations', foreignKey);
      }
    }
    await queryRunner.dropTable('reservations');
  }
}
