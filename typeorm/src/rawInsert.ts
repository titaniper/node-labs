import { DataSource, EntityManager } from "typeorm";

async function insertStripeInvoiceMap(
  entityManager: EntityManager,
  id: string,
  externalId: string
) {
  try {
    // Raw insert 쿼리 실행
    const result = await entityManager.query(`
      INSERT INTO stripe_invoice_map (id, externalId)
      VALUES (?, ?)
    `, [id, externalId]);

    console.log("Insert 결과:", result);
    return result;
  } catch (error) {
    console.error("Insert 중 오류 발생:", error);
    throw error;
  }
}

// 사용 예시
async function example() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: "localhost",
    database: "payment",
    username: "root",
    password: "1234",
    timezone: 'UTC+0',
    supportBigNumbers: true,
    bigNumberStrings: false,
  });
  await dataSource.initialize();
  const entityManager = dataSource.manager;
  
  try {
    const id = "invoice_123";
    const externalId = "ext_456";
    
    await insertStripeInvoiceMap(entityManager, id, externalId);
    console.log("데이터가 성공적으로 삽입되었습니다.");
  } catch (error) {
    console.error("데이터 삽입 중 오류 발생:", error);
  }
}

example();