import { DataSource } from "typeorm";

async function main() {
  // DataSource 생성 및 초기화
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

  try {
    await dataSource.initialize();
    console.log("데이터베이스 연결 성공");

    const entityManager = dataSource.manager;

    // Insert 함수
    async function insertStripeInvoiceMap(id: string, externalId: string) {
      try {
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

    // Select 함수
    async function selectStripeInvoiceMapByExternalId(externalId: string) {
      try {
        const result = await entityManager.query(
          `SELECT id
          FROM stripe_invoice_map
          WHERE externalId = ?`,
          [externalId],
        );

        if (result.length > 0) {
          console.log("조회 결과:", result[0].id);
          return result[0];
        } else {
          console.log("해당 externalId로 조회된 결과가 없습니다.");
          return null;
        }
      } catch (error) {
        console.error("조회 중 오류 발생:", error);
        throw error;
      }
    }

    // Insert 예시
    const insertId = "invoice_123";
    const insertExternalId = "ext_456";
    // await insertStripeInvoiceMap(insertId, insertExternalId);

    // Select 예시
    const selectExternalId = "ext_4563";
    const selectResult = await selectStripeInvoiceMapByExternalId(selectExternalId);

    if (selectResult) {
      console.log("조회된 데이터:");
      console.log("ID:", selectResult.id);
      console.log("External ID:", selectResult.externalId);
      console.log("생성 시간:", selectResult.created_at);
    } else {
      console.log("해당 External ID로 데이터를 찾을 수 없습니다.");
    }

  } catch (error) {
    console.error("오류 발생:", error);
  } finally {
    // 연결 종료
    await dataSource.destroy();
    console.log("데이터베이스 연결 종료");
  }
}

main();