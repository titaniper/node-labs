
```
npm i -D typescript ts-node @types/node
npm i
npx tsc --init   
npx ts-node index.ts
```

```
CREATE TABLE stripe_invoice_map (
    id VARCHAR(50) NOT NULL primary key,
    externalId VARCHAR(50) NOT NULL,
    created_at datetime(6) default CURRENT_TIMESTAMP(6) not null
);

```


````
npm install @faker-js/faker
```