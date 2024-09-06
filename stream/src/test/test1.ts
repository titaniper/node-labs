import { EntityManager } from 'typeorm';
import { AppDataSource, initializeDataSource } from '../orm';
import { Invoice, InvoiceItem } from '../entity';
import { pipeline, Readable, Transform, Writable } from 'stream';
import axios from 'axios';
import { addDays } from 'date-fns';

/**
 * Data Source has been initialized!
1Processing invoice!!!!! 0 1  / 0
1Processing invoice!!!!! 1 1  / false
1Processing invoice!!!!! 2 2  / true
1 this push 1
2Processing invoice undefined undefined}
1Processing invoice!!!!! 1 2  / false
1Processing invoice!!!!! 2 2  / false
1Processing invoice!!!!! 3 2  / false
1Processing invoice!!!!! 4 2  / false
1Processing invoice!!!!! 5 3  / true
1 this push 2
1Processing invoice!!!!! 1 4  / true
1 this push 3
1Processing invoice!!!!! 1 4  / false
4gogog
4All invoices processed
3Finalizing invoice undefined
2Processing invoice undefined undefined}
3Finalizing invoice undefined
2Processing invoice undefined undefined}
3Finalizing invoice undefined
2Processing invoice undefined undefined}
3Finalizing invoice undefined
5Pipeline succeeded
All invoices processed


 */

class InvoiceService {
    constructor(private readonly entityManager: EntityManager) {}

    async stream(conditions: {
        statuses?: string[];
        publishStartOn?: Date;
        publishEndOn?: Date;
        type?: string;
        isAutopayable?: boolean;
        dueOnStart?: Date;
        dueOnEnd?: Date;
        regionIds?: number[];
    }) {
        const rows: any[] = []; // TODO: any[] -> key 가 i_, ii_ 로 시작하는 맵[]
        const queryBuilder = this.entityManager
            .createQueryBuilder(Invoice, 'i')
            .leftJoinAndSelect(InvoiceItem, 'ii', 'ii.invoiceId = i.id')
            .orderBy('i.id')
            .limit(1000);

        // if (conditions.statuses?.length) {
        //     queryBuilder.andWhere('i.status IN (:...statuses)', { statuses: conditions.statuses });
        // }
        // if (conditions.isAutopayable !== undefined) {
        //     queryBuilder.andWhere('i.isAutopayable = :isAutopayable', { isAutopayable: conditions.isAutopayable });
        // }
        // if (conditions.dueOnStart) {
        //     queryBuilder.andWhere('i.dueOn >= :dueOnStart', { dueOnStart: conditions.dueOnStart });
        // }
        // if (conditions.dueOnEnd) {
        //     queryBuilder.andWhere('i.dueOn < :dueOnEnd', { dueOnEnd: conditions.dueOnEnd });
        // }
        // if (conditions.publishStartOn) {
        //     queryBuilder.andWhere('i.publishOn >= :publishStartOn', { publishStartOn: conditions.publishStartOn });
        // }
        // if (conditions.publishEndOn) {
        //     queryBuilder.andWhere('i.publishOn < :publishEndOn', { publishEndOn: conditions.publishEndOn });
        // }
        // if (conditions.type) {
        //     queryBuilder.andWhere('i.type = :type', { type: conditions.type });
        // }
        // if (conditions.regionIds?.length) {
        //     queryBuilder.andWhere('i.regionId IN (:...regionIds)', { regionIds: conditions.regionIds });
        // }

        return (await queryBuilder.stream()).pipe(
            new Transform({
                // 객체 모드를 사용하여 JavaScript 객체를 직접 처리합니다.
                objectMode: true,
                transform(chunk, encoding, callback) {
                    console.log(`1Processing invoice!!!!! ${rows.length} ${chunk.i_id}  / ${rows.length && rows[0].i_id !== chunk.i_id}`);

                    // 새로운 인보이스의 시작을 감지합니다.
                    // 현재 chunk의 인보이스 ID가 이전과 다르면 새 인보이스가 시작된 것입니다.
                    if (rows.length && rows[0].i_id !== chunk.i_id) {
                        console.log('1 this push', rows[0].i_id);
                        // 이전에 수집된 행들을 하나의 Invoice 인스턴스로 변환하여 다음 단계로 전달합니다.
                        this.push(convertRowsToInstance(rows));
                        // 새 인보이스를 위해 rows 배열을 초기화합니다.
                        rows.length = 0;
                    }
                    
                    
                    // 현재 chunk를 rows 배열에 추가합니다.
                    rows.push(chunk);
                    
                    // 현재 chunk의 처리가 완료되었음을 Node.js에 알립니다.
                    callback();
                },
                // 모든 데이터가 처리된 후 호출되는 함수입니다.
                flush(callback) {
                    console.log('4gogog');
                    // 마지막으로 처리되지 않은 행들이 있다면 처리합니다.
                    if (rows.length) {
                        // 남은 행들을 Invoice 인스턴스로 변환하여 전달합니다.
                        this.push(convertRowsToInstance(rows));
                    }

                    console.log('4All invoices processed');
                    // 스트림 처리가 완료되었음을 Node.js에 알립니다.
                    callback();
                },
            }),
        );
    }
}

function convertRowsToInstance(rows: any[]): Invoice {
    // Implement the logic to convert rows to Invoice instance
    // This is a placeholder implementation
    const invoice = new Invoice();
    invoice.id = rows[0].i_id;
    invoice.customerName = rows[0].i_customerName;
    // ... set other properties
    invoice.items = rows.map(row => {
        const item = new InvoiceItem();
        item.id = row.ii_id;
        item.description = row.ii_description;
        // ... set other properties
        return item;
    });
    return invoice;
}

// InvoiceFinalizationService 클래스
class InvoiceFinalizationService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly invoiceService: InvoiceService,
    ) {}

    async finalizeRegularInvoices(
        {
            publishOn,
            regionIds,
        }: {
            publishOn: Date;
            regionIds: number[];
        },
    ) {
        const txId = 'generate-unique-tx-id-here';
        // const queryBuilder = this.entityManager
        // .createQueryBuilder(Invoice, 'i')
        // .orderBy('i.id');


        try {
            await new Promise(async (resolve, reject) => {
                pipeline(
                    await this.invoiceService.stream({}),
                    // await queryBuilder.stream(),
                    new Transform({
                        objectMode: true,
                        transform(chunk, encoding, callback) {
                            console.log(`2Processing invoice ${chunk.i_id} ${chunk.i_customerName}}`);
                            // 여기에서 인보이스 처리 로직을 구현할 수 있습니다.
                            // console.log(`2Invoice ${chunk.i_id} processed successfully`);

                            setTimeout(() => {
                                callback(null, chunk);
                            }, 10000);
                        }
                    }),
                    new Writable({
                        objectMode: true,
                        write(chunk, encoding, callback) {
                            console.log(`3Finalizing invoice ${chunk.i_id}`);
                            // 여기에서 인보이스 최종 처리 로직을 구현할 수 있습니다.
                            // console.log(`3Invoice ${chunk.i_id} finalized successfully`);
                            callback();
                        }
                    }),
                    (err) => {
                        if (err) {
                            console.error('5Pipeline failed', err);
                            reject(err);
                        } else {
                            console.log('5Pipeline succeeded');
                            resolve('');
                        }
                    }
                );
            });
    
            // await pipeline(
            //     await queryBuilder.stream(),
            //     // await this.invoiceService.stream({
            //     //     statuses: ['draft'],
            //     //     publishStartOn: publishOn,
            //     //     publishEndOn: addDays(publishOn, 1),
            //     //     type: 'regular',
            //     //     regionIds,
            //     // }),
            //     new Transform({
            //         objectMode: true,
            //         transform(chunk: Invoice, encoding, callback) {
            //             console.log(`Processing invoice ${chunk.id}`);
            //             // 여기에서 인보이스 처리 로직을 구현할 수 있습니다.
            //             // 예를 들어, 실제 API 호출 대신 로그를 찍습니다.
            //             console.log(`Invoice ${chunk.id} processed successfully`);
            //             callback(null, chunk);
            //         }
            //     }),
            //     new Writable({
            //         objectMode: true,
            //         write(chunk: Invoice, encoding, callback) {
            //             console.log(`Finalizing invoice ${chunk.id}`);
            //             // 여기에서 인보이스 최종 처리 로직을 구현할 수 있습니다.
            //             console.log(`Invoice ${chunk.id} finalized successfully`);
            //             callback();
            //         }
            //     })
            //     // new Writable({
            //     //     objectMode: true,
            //     //     async write(chunk: any, encoding, callback) {
            //     //         try {
            //     //             const response = await axios.post(
            //     //                 `http://localhost:3232/admins/invoices/${chunk.id}/finalize`,
            //     //                 {
            //     //                     autoAdvance: false,
            //     //                     isFirstInvoice: true,
            //     //                 },
            //     //                 {
            //     //                     headers: {
            //     //                         Authorization: `ㅁ`,
            //     //                         'x-request-id': txId,
            //     //                         'x-region-id': 1,
            //     //                         'Content-Type': 'application/json',
            //     //                     },
            //     //                 },
            //     //             );
            //     //             console.log(`Invoice ${chunk.id} finalized successfully:`, response.data);
            //     //         } catch (error: any) {
            //     //             console.error(`Failed to finalize invoice ${chunk.id}:`, error.message);
            //     //         }
            //     //         callback();
            //     //     },
            //     // })
            // )
            
            // await pipeline(
            //     await this.invoiceService.stream({
            //         statuses: ['draft'],
            //         publishStartOn: publishOn,
            //         publishEndOn: addDays(publishOn, 1),
            //         type: 'regular',
            //         regionIds,
            //     }),
                // new Writable({
                //     objectMode: true,
                //     async write(chunk: any, encoding, callback) {
                //         try {
                //             const response = await axios.post(
                //                 `http://localhost:3232/admins/invoices/${chunk.id}/finalize`,
                //                 {
                //                     autoAdvance: false,
                //                     isFirstInvoice: true,
                //                 },
                //                 {
                //                     headers: {
                //                         Authorization: `ㅁ`,
                //                         'x-request-id': txId,
                //                         'x-region-id': 1,
                //                         'Content-Type': 'application/json',
                //                     },
                //                 },
                //             );
                //             console.log(`Invoice ${chunk.id} finalized successfully:`, response.data);
                //         } catch (error: any) {
                //             console.error(`Failed to finalize invoice ${chunk.id}:`, error.message);
                //         }
                //         callback();
                //     },
                // })
            // );
            console.log('All invoices processed');
        } catch (error) {
            console.error('Error in finalizeRegularInvoices:', error);
            throw error;
        }
    }
}

// 메인 실행 함수
async function main() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const entityManager = AppDataSource.manager;
        const invoiceService = new InvoiceService(entityManager);
        const invoiceFinalizationService = new InvoiceFinalizationService(entityManager, invoiceService);

        await invoiceFinalizationService.finalizeRegularInvoices(
            {
                publishOn: new Date(),
                regionIds: [1, 2, 3], // 예시 region IDs
            }
        );
    } catch (error) {
        console.error("Error during execution:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

// 애플리케이션 실행
main().catch(console.error);