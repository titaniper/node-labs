import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

const kc = new KubeConfig();
  kc.loadFromDefault();
  
  const k8sApi = kc.makeApiClient(CoreV1Api);
  
  const main = async () => {
      try {
          const podsRes = await k8sApi.listNamespacedPod('nginx');
          for (const item of podsRes.body.items) {
              console.log(item.metadata?.name);
          }
          // console.log(podsRes.body);
      } catch (err) {
          console.error(err);
      }
  };
  
  main();