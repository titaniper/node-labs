import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3232;

app.use(bodyParser.json());

app.post('/admins/invoices/:id/finalize', (req, res) => {
    const invoiceId = req.params.id;
    const { autoAdvance, isFirstInvoice } = req.body;
    const txId = req.headers['x-request-id'];
    const regionId = req.headers['x-region-id'];

    console.log(`Finalizing invoice ${invoiceId}`);
    console.log(`Transaction ID: ${txId}`);
    console.log(`Region ID: ${regionId}`);
    console.log(`Auto Advance: ${autoAdvance}`);
    console.log(`Is First Invoice: ${isFirstInvoice}`);

    // 여기에 실제 인보이스 처리 로직을 구현합니다.
    // 이 예제에서는 간단히 성공 응답을 보냅니다.

    res.status(200).json({ message: `Invoice ${invoiceId} finalized successfully` });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});