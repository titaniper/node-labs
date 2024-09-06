import { AppDataSource } from "../orm";
import { Invoice } from "../entity";
import { InvoiceItem } from "../entity";
import { faker } from '@faker-js/faker';

async function generateFakeData() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const invoiceRepository = AppDataSource.getRepository(Invoice);
        const invoiceItemRepository = AppDataSource.getRepository(InvoiceItem);

        const batchSize = 100; // 한 번에 처리할 인보이스 수
        const totalInvoices = 500;

        for (let i = 0; i < totalInvoices; i += batchSize) {
            const invoices: Invoice[] = [];
            const invoiceItems: InvoiceItem[] = [];

            for (let j = 0; j < batchSize && i + j < totalInvoices; j++) {
                const invoice = new Invoice();
                invoice.customerName = faker.person.fullName();
                invoice.invoiceDate = faker.date.past();
                invoice.status = "paid";
                invoice.type = "regular";
                invoice.isAutopayable = false;
                invoice.publishOn = new Date('2024-08-01');
                invoice.dueOn = new Date('2024-08-31');
                invoice.regionId = faker.number.int({ min: 1, max: 5 });

                // invoice.isPaid = faker.datatype.boolean();

                const itemCount = faker.number.int({ min: 1, max: 5 });
                let totalAmount = 0;

                for (let k = 0; k < itemCount; k++) {
                    const item = new InvoiceItem();
                    item.description = faker.commerce.productName();
                    item.quantity = faker.number.int({ min: 1, max: 10 });
                    item.unitPrice = parseFloat(faker.commerce.price());
                    item.totalPrice = item.quantity * item.unitPrice;
                    item.invoice = invoice;

                    totalAmount += item.totalPrice;
                    invoiceItems.push(item);
                }

                invoice.totalAmount = totalAmount;
                invoices.push(invoice);
            }

            await invoiceRepository.save(invoices);
            await invoiceItemRepository.save(invoiceItems);

            console.log(`Processed ${i + invoices.length} invoices`);
        }

        console.log("Data generation completed!");
    } catch (error) {
        console.error("Error during data generation:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

generateFakeData();