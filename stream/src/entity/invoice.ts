import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    customerName!: string;

    @Column()
    invoiceDate!: Date;

    @Column("decimal", { precision: 10, scale: 2 })
    totalAmount!: number;

    @Column()
    status!: string;

    @Column()
    type!: string;

    @Column()
    isAutopayable!: boolean;

    @Column()
    publishOn!: Date;

    @Column()
    dueOn!: Date;

    @Column()
    regionId!: number;

    @OneToMany(() => InvoiceItem, item => item.invoice)
    items!: InvoiceItem[];
}

@Entity()
export class InvoiceItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    description!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    unitPrice!: number;

    @Column()
    quantity!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    totalPrice!: number;

    @ManyToOne(() => Invoice, invoice => invoice.items)
    invoice!: Invoice;
}