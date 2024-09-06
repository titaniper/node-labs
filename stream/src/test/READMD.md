
네, 맞습니다. stream 처리는 동시에 진행되며, 여러 단계의 처리가 병렬적으로 일어나고 있습니다. 이해를 돕기 위해 현재 상황을 자세히 설명해 드리겠습니다.


# 백프레셔가 적당히 chunk 처리 안되는 걸 기다려주기 때문에 메모리 측면에서 이점은 있다?
- 근데 어차피 async 인데 이게 의미가 있나?
- 우리 코드 의미가 없는 거 같은데


# 설명


```javascript
// 1. 데이터베이스 쿼리 스트림
queryBuilder.stream()
  |
  v
// 2. 첫 번째 Transform 스트림 (InvoiceService의 stream 메서드)
new Transform({
  transform(chunk, encoding, callback) {
    console.log(`1Processing invoice!!!!! ${rows.length} ${chunk.i_id}  / ${rows.length} / ${rows[0].i_id !== chunk.i_id}`);
    rows.push(chunk);
    if (/* 새 인보이스 시작 */) {
      this.push(convertRowsToInstance(rows));
      rows.length = 0;
    }
    callback();
  }
})
  |
  v
// 3. 두 번째 Transform 스트림
new Transform({
  transform(chunk, encoding, callback) {
    console.log(`2Processing invoice ${chunk.i_id} ${chunk.i_customerName}}`);
    setTimeout(() => {
      callback(null, chunk);
    }, 10000);
  }
})
  |
  v
// 4. Writable 스트림
new Writable({
  write(chunk, encoding, callback) {
    console.log(`3Finalizing invoice ${chunk.i_id}`);
    callback();
  }
})

```

스트림 처리의 동시성과 병렬성:

1. 병렬 처리:
   - 각 스트림 단계(Transform, Writable)는 동시에 활성화되어 있습니다.
   - 데이터는 파이프라인을 통해 흐르면서 각 단계에서 처리됩니다.

2. 백프레셔(Backpressure):
   - Node.js의 스트림은 백프레셔 메커니즘을 사용하여 데이터 흐름을 제어합니다.
   - 다운스트림(예: Writable)이 처리 속도를 따라가지 못하면, 업스트림(예: Transform)에 신호를 보내 데이터 생성을 일시적으로 중단합니다.

3. 비동기 처리:
   - `setTimeout`을 사용한 두 번째 Transform 스트림은 각 청크를 비동기적으로 처리합니다.
   - 이로 인해 처리 순서가 보장되지 않으며, 로그 출력 순서가 예상과 다를 수 있습니다.

4. rows 배열 처리:
   - 첫 번째 Transform 스트림에서 `rows` 배열에 데이터를 쌓고 있습니다.
   - 새로운 인보이스가 시작될 때마다 `rows`의 내용을 처리하고 다음 단계로 전달합니다.

현재 상황 설명:

1. 데이터베이스에서 스트림으로 데이터를 읽어옵니다.
2. 첫 번째 Transform 스트림에서 데이터를 `rows` 배열에 쌓습니다.
3. 새 인보이스가 시작되면 `rows`의 내용을 처리하고 다음 단계로 전달합니다.
4. 두 번째 Transform 스트림에서 10초 지연 후 처리합니다 (이 부분이 병목이 될 수 있습니다).
5. Writable 스트림에서 최종 처리를 수행합니다.

주의할 점:
- 10초 지연으로 인해 처리 순서가 뒤섞일 수 있습니다.
- 메모리 사용량: `rows` 배열에 데이터를 쌓는 방식은 메모리 사용량을 증가시킬 수 있습니다.
- 백프레셔로 인해 데이터베이스 쿼리 속도가 조절될 수 있습니다.

개선 제안:
1. 긴 지연 시간(10초) 제거 또는 줄이기
2. `rows` 배열 대신 개별 청크 처리 고려
3. 비동기 작업을 위해 `Promise` 기반의 스트림 처리 사용 고려

이러한 개선을 통해 스트림 처리의 효율성과 예측 가능성을 높일 수 있습니다.