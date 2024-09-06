import { DataSource } from "typeorm";
import { Invoice } from "./entity";
import { InvoiceItem } from "./entity";

const AppDataSource = new DataSource({
    type: "mysql",
    host: "mysql.com",
    port: 3309,
    username: "root",
    password: "1234",
    database: "mysql_loadtest",
    synchronize: true,
    logging: false,
    entities: [Invoice, InvoiceItem],
    migrations: [],
    subscribers: [],
});

async function initializeDataSource() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");
        return AppDataSource;
    } catch (error) {
        console.error("Error during Data Source initialization:", error);
        throw error;
    }
}


export { AppDataSource, initializeDataSource}
